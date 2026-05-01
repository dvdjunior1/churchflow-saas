import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Plus, Users, ShieldCheck, MoreVertical, Loader2, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api-client';
import { useDataStore } from '@/lib/data-store';
import type { Ministry, Member, MinistryMember } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { toast } from 'sonner';
const ministrySchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  description: z.string().min(5, "Descrição necessária"),
});
export function MinistriesPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [managingMinistry, setManagingMinistry] = useState<Ministry | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  // Store data
  const ministries = useDataStore(s => s.ministries);
  const setMinistries = useDataStore(s => s.setMinistries);
  const addMinistryAction = useDataStore(s => s.addMinistry);
  const members = useDataStore(s => s.members);
  const ministryMembers = useDataStore(s => s.ministryMembers);
  const setMinistryMembers = useDataStore(s => s.setMinistryMembers);
  const linkMemberAction = useDataStore(s => s.linkMember);
  const unlinkMemberAction = useDataStore(s => s.unlinkMember);
  const { isLoading: isLoadingMin } = useQuery<{ items: Ministry[] }>({
    queryKey: ['ministries'],
    queryFn: async () => {
      const data = await api<{ items: Ministry[] }>('/api/ministries');
      setMinistries(data.items);
      return data;
    },
  });
  useQuery<{ items: MinistryMember[] }>({
    queryKey: ['ministry-members'],
    queryFn: async () => {
      const data = await api<{ items: MinistryMember[] }>('/api/ministry-members');
      setMinistryMembers(data.items);
      return data;
    },
  });
  const form = useForm<z.infer<typeof ministrySchema>>({
    resolver: zodResolver(ministrySchema),
    defaultValues: { name: '', description: '' },
  });
  const addMutation = useMutation({
    mutationFn: (data: z.infer<typeof ministrySchema>) => api<Ministry>('/api/ministries', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (newMin) => {
      addMinistryAction(newMin);
      setIsAddOpen(false);
      form.reset();
      toast.success('Ministério criado com sucesso!');
    }
  });
  const linkMutation = useMutation({
    mutationFn: (data: Partial<MinistryMember>) => api<MinistryMember>('/api/ministry-members', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (rel) => linkMemberAction(rel),
  });
  const unlinkMutation = useMutation({
    mutationFn: (id: string) => api(`/api/ministry-members/${id}`, { method: 'DELETE' }),
    onSuccess: (_, id) => unlinkMemberAction(id),
  });
  const getMinistryMemberCount = (minId: string) => {
    return ministryMembers.filter(mm => mm.ministryId === minId).length;
  };
  const getLeader = (leaderId?: string) => {
    return members.find(m => m.id === leaderId);
  };
  const toggleMembership = (memberId: string, ministryId: string) => {
    const existing = ministryMembers.find(mm => mm.memberId === memberId && mm.ministryId === ministryId);
    if (existing) {
      unlinkMutation.mutate(existing.id);
    } else {
      linkMutation.mutate({ memberId, ministryId, role: 'member' });
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ministérios</h1>
          <p className="text-muted-foreground">Frentes de trabalho e grupos de serviço da igreja.</p>
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
              <form onSubmit={form.handleSubmit((v) => addMutation.mutate(v))} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={addMutation.isPending}>
                  {addMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Criar
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoadingMin && ministries.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground">Buscando ministérios...</div>
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
                  <Badge variant="secondary">{count} {count === 1 ? 'Membro' : 'Membros'}</Badge>
                </div>
                <CardTitle className="text-xl">{min.name}</CardTitle>
                <CardDescription className="line-clamp-2">{min.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                {leader ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={leader.photoUrl} />
                      <AvatarFallback>{leader.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Líder</span>
                      <span className="text-sm font-semibold">{leader.fullName}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic py-2">Nenhum líder atribuído</div>
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
            <SheetDescription>Adicione ou remova membros deste ministério.</SheetDescription>
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
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {members
                .filter(m => m.fullName.toLowerCase().includes(memberSearch.toLowerCase()))
                .map(m => {
                  const isMember = ministryMembers.some(mm => mm.memberId === m.id && mm.ministryId === managingMinistry?.id);
                  return (
                    <div key={m.id} className="flex items-center justify-between p-2 rounded-lg border hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={m.photoUrl} />
                          <AvatarFallback>{m.fullName.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{m.fullName}</span>
                          <span className="text-xs text-muted-foreground">{m.role}</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant={isMember ? "outline" : "default"}
                        className={isMember ? "text-destructive border-destructive/20 hover:bg-destructive/10" : "bg-primary"}
                        onClick={() => managingMinistry && toggleMembership(m.id, managingMinistry.id)}
                      >
                        {isMember ? 'Remover' : 'Adicionar'}
                      </Button>
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