import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Search, MoreHorizontal, Filter, UserCircle, Save, Camera, BookOpen, ShieldAlert } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDataStore } from '@/lib/data-store';
import { useAuthStore } from '@/lib/auth-store';
import type { Member } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
const memberSchema = z.object({
  fullName: z.string().min(3, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  birthDate: z.string().min(1, "Data de nascimento obrigatória"),
  baptismDate: z.string().optional(),
  role: z.string().optional(),
  positions: z.array(z.string()).optional(),
  photoUrl: z.string().optional(),
  gender: z.enum(['M', 'F', 'O']),
  maritalStatus: z.enum(['solteiro', 'casado', 'divorciado', 'viuvo']),
  memberStatus: z.enum(['ativo', 'inativo', 'visitante', 'transferido']),
  showBirthdayPublic: z.boolean(),
  hasAccess: z.boolean(),
  accessEmail: z.string().optional(),
  accessPassword: z.string().optional(),
  accessRole: z.enum(['admin', 'leader', 'member']).optional(),
}).refine((data) => {
  if (data.hasAccess) {
    return !!data.accessEmail && !!data.accessPassword && !!data.accessRole;
  }
  return true;
}, {
  message: "Credenciais de acesso obrigatórias",
  path: ["accessEmail"],
});
type FormValues = z.infer<typeof memberSchema>;
export function MembersPage() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const members = useDataStore(s => s.members);
  const addMember = useDataStore(s => s.addMember);
  const updateMemberAction = useDataStore(s => s.updateMember);
  const deleteMemberAction = useDataStore(s => s.deleteMember);
  const allPositions = useDataStore(s => s.positions);
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'pastor';
  const activeChurchPositions = useMemo(() =>
    allPositions.filter(p => p.active && p.scope === 'church'),
  [allPositions]);
  const form = useForm<FormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      fullName: '', email: '', phone: '', birthDate: '', role: 'Membro', positions: [],
      photoUrl: '', gender: 'M', maritalStatus: 'solteiro', memberStatus: 'ativo',
      showBirthdayPublic: false, hasAccess: false, accessRole: 'member',
    },
  });
  useEffect(() => {
    if (editingMember) {
      form.reset({
        ...editingMember,
        positions: editingMember.positions || [],
        showBirthdayPublic: !!editingMember.showBirthdayPublic,
        hasAccess: !!editingMember.hasAccess,
      });
    } else {
      form.reset({
        fullName: '', email: '', phone: '', birthDate: '', role: 'Membro',
        positions: [], memberStatus: 'ativo', hasAccess: false, accessRole: 'member',
        showBirthdayPublic: false, gender: 'M', maritalStatus: 'solteiro',
      });
    }
  }, [editingMember, form]);
  const onSubmit: SubmitHandler<FormValues> = (values) => {
    try {
      if (editingMember) {
        updateMemberAction(editingMember.id, values);
        toast.success('Membro atualizado');
      } else {
        addMember(values);
        toast.success('Membro cadastrado');
      }
      setIsDialogOpen(false);
    } catch (e) {
      toast.error('Erro ao salvar');
    }
  };
  const filteredMembers = members.filter(m => 
    m.fullName.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );
  const accessEnabled = form.watch("hasAccess");
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Membros</h1>
          <p className="text-muted-foreground">Base de dados unificada da congregação.</p>
        </div>
        <Button className="btn-gradient" onClick={() => { setEditingMember(null); setIsDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Novo Membro
        </Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar membros..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membro</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Nível de Acesso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id} className="group hover:bg-slate-50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage src={member.photoUrl} />
                      <AvatarFallback>{member.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{member.fullName}</span>
                      <span className="text-xs text-muted-foreground">{member.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={member.memberStatus === 'ativo' ? 'default' : 'outline'} className="capitalize">
                    {member.memberStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  {member.hasAccess ? (
                    <Badge variant="secondary" className="capitalize">{member.accessRole}</Badge>
                  ) : (
                    <span className="text-xs text-slate-300 italic">Sem Acesso</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditingMember(member); setIsDialogOpen(true); }}>Editar</DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteMemberAction(member.id)}>Excluir</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Editar Perfil' : 'Novo Membro'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2 md:col-span-2">
                  <UserCircle className="h-4 w-4" /> Dados Pessoais
                </h3>
                <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel>Nome Completo *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>E-mail *</FormLabel><FormControl><Input type="email" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Telefone *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="birthDate" render={({ field }) => (
                  <FormItem><FormLabel>Nascimento *</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
                )} />
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-4">
                  <BookOpen className="h-4 w-4" /> Dados Eclesiásticos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormItem>
                    <FormLabel>Cargos Gerais</FormLabel>
                    <ScrollArea className="h-32 p-3 border rounded-lg bg-slate-50/50">
                      <div className="space-y-2">
                        {activeChurchPositions.map((pos) => (
                          <FormField key={pos.id} control={form.control} name="positions" render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value?.includes(pos.id)} onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  return checked ? field.onChange([...current, pos.id]) : field.onChange(current.filter((value) => value !== pos.id));
                                }} />
                              </FormControl>
                              <FormLabel className="text-xs font-normal">{pos.name}</FormLabel>
                            </FormItem>
                          )} />
                        ))}
                      </div>
                    </ScrollArea>
                  </FormItem>
                </div>
              </div>
              <Separator />
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Acesso ao Sistema</h3>
                  </div>
                  <FormField control={form.control} name="hasAccess" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="text-xs">Habilitar</FormLabel>
                    </FormItem>
                  )} />
                </div>
                {accessEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="accessEmail" render={({ field }) => (
                      <FormItem><FormLabel>E-mail de Login</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="accessPassword" render={({ field }) => (
                      <FormItem><FormLabel>Senha</FormLabel><FormControl><Input type="password" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="accessRole" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Nível</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            {isAdmin && <SelectItem value="admin">Administrador</SelectItem>}
                            <SelectItem value="leader">Líder</SelectItem>
                            <SelectItem value="member">Membro</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full btn-gradient">Salvar</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}