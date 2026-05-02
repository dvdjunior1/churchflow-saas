import React, { useState, useMemo } from 'react';
import { Heart, Plus, Trash2, UserPlus, Briefcase, UserMinus, Edit2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDataStore } from '@/lib/data-store';
import { useAuthStore } from '@/lib/auth-store';
import { canAccess, isLeaderInMin } from '@/lib/perms';
import type { Ministry } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
const ministrySchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  description: z.string().min(5, "Descrição necessária"),
  leaderId: z.string().optional(),
});
export function MinistriesPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null);
  const [managingMinistryId, setManagingMinistryId] = useState<string | null>(null);
  const [assignMemberId, setAssignMemberId] = useState<string>("");
  const [assignPositionId, setAssignPositionId] = useState<string>("none");
  const ministries = useDataStore(s => s.ministries);
  const addMinistryAction = useDataStore(s => s.addMinistry);
  const deleteMinistryAction = useDataStore(s => s.deleteMinistry);
  const updateMinistryAction = useDataStore(s => s.updateMinistry);
  const members = useDataStore(s => s.members);
  const ministryMembers = useDataStore(s => s.ministryMembers);
  const linkMemberAction = useDataStore(s => s.linkMember);
  const unlinkMemberAction = useDataStore(s => s.unlinkMember);
  const allPositions = useDataStore(s => s.positions);
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'pastor';
  const visibleMinistries = useMemo(() => {
    if (isAdmin) return ministries;
    return ministries.filter(min => 
      min.leaderId === user?.memberId || isLeaderInMin(min.id, user?.memberId)
    );
  }, [ministries, isAdmin, user]);
  const activeMinistryPositions = useMemo(() =>
    allPositions.filter(p => p.active && p.scope === 'ministry'),
  [allPositions]);
  const form = useForm<z.infer<typeof ministrySchema>>({
    resolver: zodResolver(ministrySchema),
    defaultValues: { name: '', description: '', leaderId: '' },
  });
  const onAddSubmit = (values: z.infer<typeof ministrySchema>) => {
    try {
      const newMin = addMinistryAction({
        name: values.name,
        description: values.description,
        leaderId: values.leaderId || undefined
      });
      if (values.leaderId) {
        linkMemberAction({ memberId: values.leaderId, ministryId: newMin.id, role: 'leader' });
      }
      setIsAddOpen(false);
      form.reset();
      toast.success('Ministério criado com sucesso!');
    } catch (e) {
      toast.error('Erro ao criar ministério');
    }
  };
  const onEditSubmit = (values: z.infer<typeof ministrySchema>) => {
    if (!editingMinistry) return;
    try {
      updateMinistryAction(editingMinistry.id, {
        name: values.name,
        description: values.description,
        leaderId: values.leaderId || undefined
      });
      setEditingMinistry(null);
      toast.success('Ministério atualizado!');
    } catch (e) {
      toast.error('Erro ao atualizar ministério');
    }
  };
  const currentTeam = useMemo(() => {
    if (!managingMinistryId) return [];
    return ministryMembers
      .filter(mm => mm.ministryId === managingMinistryId)
      .map(mm => ({
        ...mm,
        member: members.find(m => m.id === mm.memberId),
        position: allPositions.find(p => p.id === mm.positionId)
      }))
      .filter(item => item.member)
      .sort((a, b) => {
        if (a.role === 'leader' && b.role !== 'leader') return -1;
        if (a.role !== 'leader' && b.role === 'leader') return 1;
        return (a.member?.fullName || '').localeCompare(b.member?.fullName || '');
      });
  }, [managingMinistryId, ministryMembers, members, allPositions]);
  const membersNotJoined = useMemo(() => {
    if (!managingMinistryId) return [];
    const joinedIds = new Set(currentTeam.map(t => t.memberId));
    return members.filter(m => !joinedIds.has(m.id));
  }, [members, currentTeam, managingMinistryId]);
  const handleAssignMember = () => {
    if (!managingMinistryId || !assignMemberId) return;
    try {
      const isFirstMember = currentTeam.length === 0;
      const role = isFirstMember ? 'leader' : 'member';
      linkMemberAction({
        memberId: assignMemberId,
        ministryId: managingMinistryId,
        role: role,
        positionId: assignPositionId === 'none' ? undefined : assignPositionId
      });
      if (isFirstMember) {
        updateMinistryAction(managingMinistryId, { leaderId: assignMemberId });
      }
      toast.success(isFirstMember ? "Líder vinculado" : "Membro vinculado");
      setAssignMemberId("");
      setAssignPositionId("none");
    } catch (e) {
      toast.error("Erro ao vincular membro");
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ministérios</h1>
          <p className="text-muted-foreground">Gestão local de equipes e frentes de trabalho.</p>
        </div>
        {isAdmin && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gradient"><Plus className="mr-2 h-4 w-4" /> Novo Ministério</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Criar Ministério</DialogTitle></DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onAddSubmit)} className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                  )} />
                  <Button type="submit" className="w-full btn-gradient">Criar Ministério</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleMinistries.map((min) => {
          const leader = members.find(m => m.id === min.leaderId);
          const count = ministryMembers.filter(mm => mm.ministryId === min.id).length;
          const canManage = canAccess(user, 'ministries', min.id);
          return (
            <Card key={min.id} className="hover:shadow-md transition-all group flex flex-col h-full border-slate-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Heart className="h-5 w-5" />
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => {
                        setEditingMinistry(min);
                        form.reset(min);
                      }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => {
                        if (confirm('Excluir ministério?')) deleteMinistryAction(min.id);
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <CardTitle className="text-xl">{min.name}</CardTitle>
                <CardDescription className="line-clamp-2">{min.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700">{count} Integrantes</Badge>
                </div>
                {leader && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={leader.photoUrl} />
                      <AvatarFallback>{leader.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Líder</span>
                      <span className="text-sm font-semibold">{leader.fullName}</span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-3 border-t">
                <Button 
                  variant="ghost" 
                  disabled={!canManage}
                  className="w-full text-xs font-semibold" 
                  onClick={() => setManagingMinistryId(min.id)}
                >
                  {canManage ? 'Gerenciar Equipe' : 'Acesso Restrito'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      <Dialog open={editingMinistry !== null} onOpenChange={(open) => !open && setEditingMinistry(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Ministério</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
              )} />
              <Button type="submit" className="w-full btn-gradient">Salvar Alterações</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Sheet open={managingMinistryId !== null} onOpenChange={(open) => !open && setManagingMinistryId(null)}>
        <SheetContent className="sm:max-w-md flex flex-col p-0">
          <SheetHeader className="p-6 pb-2">
            <SheetTitle>Equipe Ministerial</SheetTitle>
            <SheetDescription>Adicione membros e atribua funções específicas.</SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-8 py-4">
              <div className="space-y-4 p-4 rounded-xl border bg-slate-50/50">
                <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-2">
                  <UserPlus className="h-4 w-4" /> Vincular Novo Membro
                </div>
                <Select value={assignMemberId} onValueChange={setAssignMemberId}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Selecione um membro..." /></SelectTrigger>
                  <SelectContent>
                    {membersNotJoined.map(m => <SelectItem key={m.id} value={m.id}>{m.fullName}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={assignPositionId} onValueChange={setAssignPositionId}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Sem função específica" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma (Membro)</SelectItem>
                    {activeMinistryPositions.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button className="w-full" disabled={!assignMemberId} onClick={handleAssignMember}>
                  Adicionar à Equipe
                </Button>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2"><Briefcase className="h-4 w-4" /> Integrantes Ativos</h4>
                <div className="space-y-3">
                  {currentTeam.map((item) => (
                    <div key={item.id} className="flex flex-col p-3 rounded-lg border bg-white shadow-sm gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border">
                            <AvatarImage src={item.member?.photoUrl} />
                            <AvatarFallback>{item.member?.fullName.substring(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-bold flex items-center gap-1.5">
                              {item.member?.fullName}
                              {item.role === 'leader' && <Badge className="text-[8px] h-3.5 px-1 uppercase leading-none">Líder</Badge>}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{item.position?.name || 'Apoio'}</p>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => unlinkMemberAction(item.id)}>
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}