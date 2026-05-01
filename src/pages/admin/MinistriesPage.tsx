import React, { useState, useMemo } from 'react';
import { Heart, Plus, Search, Trash2, ShieldCheck, UserPlus, Briefcase, UserMinus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDataStore } from '@/lib/data-store';
import type { Ministry } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
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
  const updateMinistryMemberAction = useDataStore(s => s.updateMinistryMember);
  const allPositions = useDataStore(s => s.positions);
  const currentMinistry = useMemo(() => 
    ministries.find(m => m.id === managingMinistryId) || null,
  [ministries, managingMinistryId]);
  const activeMinistryPositions = useMemo(() =>
    allPositions.filter(p => p.active && p.scope === 'ministry'),
  [allPositions]);
  const form = useForm<z.infer<typeof ministrySchema>>({
    resolver: zodResolver(ministrySchema),
    defaultValues: { name: '', description: '', leaderId: '' },
  });
  const onSubmit = (values: z.infer<typeof ministrySchema>) => {
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
        toast.success(`Membro vinculado como líder do ministério`);
      } else {
        toast.success("Membro vinculado com sucesso");
      }
      setAssignMemberId("");
      setAssignPositionId("none");
    } catch (e) {
      toast.error("Erro ao vincular membro");
    }
  };
  const toggleLeader = (mmId: string, memberId: string, isCurrentlyLeader: boolean) => {
    if (!managingMinistryId) return;
    if (!isCurrentlyLeader) {
      const oldLeaderMM = currentTeam.find(t => t.role === 'leader');
      if (oldLeaderMM) {
        updateMinistryMemberAction(oldLeaderMM.id, { role: 'member' });
      }
      updateMinistryAction(managingMinistryId, { leaderId: memberId });
      updateMinistryMemberAction(mmId, { role: 'leader' });
      toast.success("Novo líder definido");
    } else {
      updateMinistryAction(managingMinistryId, { leaderId: undefined });
      updateMinistryMemberAction(mmId, { role: 'member' });
      toast.success("Liderança removida");
    }
  };
  const getLeader = (leaderId?: string) => {
    return members.find(m => m.id === leaderId);
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ministérios</h1>
          <p className="text-muted-foreground">Gestão local de equipes e frentes de trabalho.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient"><Plus className="mr-2 h-4 w-4" /> Novo Ministério</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Ministério</DialogTitle>
              <DialogDescription>Defina o nome e propósito do novo grupo.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="leaderId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Líder Inicial (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione um líder" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {members.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.fullName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <Button type="submit" className="w-full btn-gradient">Criar Ministério</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ministries.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground bg-slate-50 border-2 border-dashed rounded-3xl">
            Nenhum ministério cadastrado.
          </div>
        ) : ministries.map((min) => {
          const leader = getLeader(min.leaderId);
          const count = ministryMembers.filter(mm => mm.ministryId === min.id).length;
          return (
            <Card key={min.id} className="hover:shadow-md transition-all group flex flex-col h-full border-slate-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{count} {count === 1 ? 'Membro' : 'Membros'}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        if (confirm('Deseja excluir este ministério?')) {
                          deleteMinistryAction(min.id);
                          toast.success('Ministério excluído');
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-xl">{min.name}</CardTitle>
                <CardDescription className="line-clamp-2">{min.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                {leader ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={leader.photoUrl} alt={leader.fullName} />
                      <AvatarFallback>{leader.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Líder</span>
                      <span className="text-sm font-semibold">{leader.fullName}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic py-2">Sem líder definido</div>
                )}
              </CardContent>
              <CardFooter className="pt-3 border-t">
                <Button variant="ghost" className="w-full text-xs" onClick={() => setManagingMinistryId(min.id)}>
                  Gerenciar Equipe
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      <Sheet open={managingMinistryId !== null} onOpenChange={(open) => !open && setManagingMinistryId(null)}>
        <SheetContent className="sm:max-w-md flex flex-col p-0">
          <SheetHeader className="p-6 pb-2">
            <SheetTitle>Equipe: {currentMinistry?.name}</SheetTitle>
            <SheetDescription>Organize o corpo de voluntários deste ministério.</SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-8 py-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider">
                  <UserPlus className="h-4 w-4" /> Vincular Novo Membro
                </div>
                <div className="space-y-3 p-4 rounded-xl border bg-slate-50/50">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Membro</label>
                    <Select value={assignMemberId} onValueChange={setAssignMemberId}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Selecione um membro..." />
                      </SelectTrigger>
                      <SelectContent>
                        {membersNotJoined.length === 0 ? (
                          <div className="p-2 text-xs text-center text-muted-foreground">Todos os membros vinculados</div>
                        ) : (
                          membersNotJoined.map(m => (
                            <SelectItem key={m.id} value={m.id}>{m.fullName}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Função (Opcional)</label>
                    <Select value={assignPositionId} onValueChange={setAssignPositionId}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Sem função específica" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {activeMinistryPositions.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full btn-gradient"
                    disabled={!assignMemberId}
                    onClick={handleAssignMember}
                  >
                    Vincular ao Grupo
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider">
                    <Briefcase className="h-4 w-4" /> Membros Ativos
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{currentTeam.length}</Badge>
                </div>
                <div className="space-y-3">
                  {currentTeam.length === 0 ? (
                    <div className="py-10 text-center text-sm text-muted-foreground italic border-2 border-dashed rounded-xl">
                      Equipe vazia. Vincule membros acima.
                    </div>
                  ) : currentTeam.map((item) => (
                    <div key={item.id} className="flex flex-col p-3 rounded-lg border bg-white shadow-sm hover:shadow-md transition-all gap-3 border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border shadow-sm">
                            <AvatarImage src={item.member?.photoUrl} />
                            <AvatarFallback>{item.member?.fullName.substring(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold">{item.member?.fullName}</span>
                              {item.role === 'leader' && (
                                <Badge className="bg-primary text-[9px] h-4 px-1 uppercase leading-none">Líder</Badge>
                              )}
                            </div>
                            <div className="flex gap-1.5 items-center mt-0.5">
                              {item.position ? (
                                <Badge variant="outline" className="text-[9px] py-0 border-primary/20 text-primary bg-primary/5">
                                  {item.position.name}
                                </Badge>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">Membro comum</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            if (confirm('Remover este membro do ministério?')) {
                              unlinkMemberAction(item.id);
                              if (item.role === 'leader' && managingMinistryId) {
                                updateMinistryAction(managingMinistryId, { leaderId: undefined });
                              }
                              toast.info('Membro removido');
                            }
                          }}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-50 gap-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={item.role === 'leader' ? "default" : "outline"}
                            className={`h-7 px-3 text-[10px] ${item.role === 'leader' ? 'bg-primary' : ''}`}
                            onClick={() => toggleLeader(item.id, item.memberId, item.role === 'leader')}
                          >
                            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                            {item.role === 'leader' ? 'Liderança Ativa' : 'Tornar Líder'}
                          </Button>
                        </div>
                        <Select
                          value={item.positionId || 'none'}
                          onValueChange={(val) => {
                            updateMinistryMemberAction(item.id, { positionId: val === 'none' ? undefined : val });
                            toast.success('Função atualizada');
                          }}
                        >
                          <SelectTrigger className="h-7 text-[10px] w-[140px] bg-slate-50 border-slate-200">
                            <SelectValue placeholder="Trocar Função" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sem função</SelectItem>
                            {activeMinistryPositions.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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