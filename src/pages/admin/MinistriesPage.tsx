import React, { useState, useMemo } from 'react';
import { Heart, Plus, Search, Save, Trash2, ShieldCheck, UserPlus, Briefcase } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDataStore } from '@/lib/data-store';
import type { Ministry, MinistryMember } from '@shared/types';
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
import { toast } from 'sonner';
const ministrySchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  description: z.string().min(5, "Descrição necessária"),
  leaderId: z.string().optional(),
});
export function MinistriesPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [managingMinistry, setManagingMinistry] = useState<Ministry | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
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
  const toggleMembership = (memberId: string, ministryId: string) => {
    const existing = ministryMembers.find(mm => mm.memberId === memberId && mm.ministryId === ministryId);
    if (existing) {
      unlinkMemberAction(existing.id);
      toast.info('Membro removido do ministério');
    } else {
      linkMemberAction({ memberId, ministryId, role: 'member' });
      toast.success('Membro adicionado ao ministério');
    }
  };
  const updateMemberPos = (mmId: string, positionId: string) => {
    updateMinistryMemberAction(mmId, { positionId: positionId === 'none' ? undefined : positionId });
    toast.success('Função atualizada');
  };
  const getMinistryMemberCount = (minId: string) => {
    return ministryMembers.filter(mm => mm.ministryId === minId).length;
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
          const count = getMinistryMemberCount(min.id);
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
                <Button variant="ghost" className="w-full text-xs" onClick={() => setManagingMinistry(min)}>
                  Gerenciar Equipe
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      <Sheet open={!!managingMinistry} onOpenChange={() => setManagingMinistry(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Equipe: {managingMinistry?.name}</SheetTitle>
            <SheetDescription>Vincule membros e atribua funções específicas para este grupo.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar membros..."
                className="pl-9"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
              />
            </div>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
              {members
                .filter(m => m.fullName.toLowerCase().includes(memberSearch.toLowerCase()))
                .map(m => {
                  const mm = ministryMembers.find(item => item.memberId === m.id && item.ministryId === managingMinistry?.id);
                  const isMember = !!mm;
                  const isLeader = mm?.role === 'leader';
                  const currentPos = allPositions.find(p => p.id === mm?.positionId);
                  return (
                    <div key={m.id} className="flex flex-col p-3 rounded-lg border hover:bg-slate-50 transition-colors gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={m.photoUrl} />
                            <AvatarFallback>{m.fullName.substring(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{m.fullName}</span>
                            <div className="flex gap-1 items-center">
                              <span className="text-[10px] text-muted-foreground">{m.role}</span>
                              {isLeader && <ShieldCheck className="h-3 w-3 text-primary" />}
                              {currentPos && <Badge variant="outline" className="text-[9px] py-0">{currentPos.name}</Badge>}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={isMember ? "outline" : "default"}
                          className={`h-8 w-24 ${isMember ? "text-destructive hover:bg-destructive/10" : "bg-primary"}`}
                          onClick={() => managingMinistry && toggleMembership(m.id, managingMinistry.id)}
                        >
                          {isMember ? 'Remover' : 'Adicionar'}
                        </Button>
                      </div>
                      {isMember && (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                          <div className="flex items-center gap-2">
                             <Button
                              size="xs"
                              variant="ghost"
                              className={`h-7 px-2 text-[10px] ${isLeader ? 'text-primary' : 'text-slate-400'}`}
                              onClick={() => {
                                updateMinistryAction(managingMinistry!.id, { leaderId: isLeader ? undefined : m.id });
                                updateMinistryMemberAction(mm.id, { role: isLeader ? 'member' : 'leader' });
                                toast.success(isLeader ? 'Liderança removida' : 'Liderança atribuída');
                              }}
                            >
                               <ShieldCheck className="h-3 w-3 mr-1" /> Líder
                            </Button>
                          </div>
                          <Select 
                            value={mm.positionId || 'none'} 
                            onValueChange={(val) => updateMemberPos(mm.id, val)}
                          >
                            <SelectTrigger className="h-7 text-[10px] bg-white">
                              <Briefcase className="h-3 w-3 mr-1" />
                              <SelectValue placeholder="Função" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Sem função específica</SelectItem>
                              {activeMinistryPositions.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}