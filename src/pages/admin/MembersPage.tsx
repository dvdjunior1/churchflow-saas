import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreHorizontal, Filter, UserCircle, Save, Camera, Cake, Briefcase, X, Heart, ExternalLink, ShieldAlert, Key } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDataStore } from '@/lib/data-store';
import type { Member } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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
  whatsapp: z.string().optional(),
  alternatePhone: z.string().optional(),
  gender: z.enum(['M', 'F', 'O']),
  maritalStatus: z.enum(['solteiro', 'casado', 'divorciado', 'viuvo']),
  zipCode: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  memberStatus: z.enum(['ativo', 'inativo', 'visitante', 'transferido']),
  notes: z.string().optional(),
  showBirthdayPublic: z.boolean(),
  // System Access
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
  message: "Credenciais de acesso são obrigatórias quando o acesso está habilitado",
  path: ["accessEmail"],
});
type FormValues = z.infer<typeof memberSchema>;
export function MembersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const members = useDataStore(s => s.members);
  const addMember = useDataStore(s => s.addMember);
  const updateMemberAction = useDataStore(s => s.updateMember);
  const deleteMemberAction = useDataStore(s => s.deleteMember);
  const activities = useDataStore(s => s.activities);
  const activitySteps = useDataStore(s => s.activitySteps);
  const allPositions = useDataStore(s => s.positions);
  const ministries = useDataStore(s => s.ministries);
  const ministryMembers = useDataStore(s => s.ministryMembers);
  const activeChurchPositions = useMemo(() =>
    allPositions.filter(p => p.active && p.scope === 'church'),
  [allPositions]);
  const form = useForm<FormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      birthDate: '',
      baptismDate: '',
      role: 'Membro',
      positions: [],
      photoUrl: '',
      whatsapp: '',
      alternatePhone: '',
      gender: 'M',
      maritalStatus: 'solteiro',
      zipCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      memberStatus: 'ativo',
      notes: '',
      showBirthdayPublic: false,
      hasAccess: false,
      accessRole: 'member',
    },
  });
  useEffect(() => {
    if (editingMember) {
      form.reset({
        fullName: editingMember.fullName || '',
        email: editingMember.email || '',
        phone: editingMember.phone || '',
        birthDate: editingMember.birthDate || '',
        baptismDate: editingMember.baptismDate || '',
        role: editingMember.role || 'Membro',
        positions: editingMember.positions || [],
        photoUrl: editingMember.photoUrl || '',
        whatsapp: editingMember.whatsapp || '',
        alternatePhone: editingMember.alternatePhone || '',
        gender: editingMember.gender || 'M',
        maritalStatus: editingMember.maritalStatus || 'solteiro',
        zipCode: editingMember.zipCode || '',
        street: editingMember.street || '',
        number: editingMember.number || '',
        complement: editingMember.complement || '',
        neighborhood: editingMember.neighborhood || '',
        city: editingMember.city || '',
        state: editingMember.state || '',
        memberStatus: editingMember.memberStatus || 'ativo',
        notes: editingMember.notes || '',
        showBirthdayPublic: !!editingMember.showBirthdayPublic,
        hasAccess: !!editingMember.hasAccess,
        accessEmail: editingMember.accessEmail || '',
        accessPassword: editingMember.accessPassword || '',
        accessRole: editingMember.accessRole || 'member',
      });
    } else {
      form.reset({
        fullName: '',
        email: '',
        phone: '',
        birthDate: '',
        role: 'Membro',
        positions: [],
        memberStatus: 'ativo',
        hasAccess: false,
        accessRole: 'member',
        showBirthdayPublic: false,
        gender: 'M',
        maritalStatus: 'solteiro',
      });
    }
  }, [editingMember, form]);
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('photoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [form]);
  const onSubmit: SubmitHandler<FormValues> = (values) => {
    try {
      const finalPhoto = values.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(values.fullName)}`;
      const payload = { ...values, photoUrl: finalPhoto };
      if (editingMember) {
        updateMemberAction(editingMember.id, {
          ...payload,
          positions: payload.positions ?? [],
        });
        toast.success('Membro atualizado com sucesso');
      } else {
        addMember(payload);
        toast.success('Membro cadastrado com sucesso');
      }
      setIsDialogOpen(false);
      setEditingMember(null);
    } catch (e) {
      toast.error('Ocorreu um erro ao salvar o membro');
    }
  };
  const filteredMembers = members.filter(m =>
    m.fullName.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    (m.memberStatus || '').toLowerCase().includes(search.toLowerCase())
  );
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'ativo': return <Badge className="bg-emerald-500 hover:bg-emerald-600">Ativo</Badge>;
      case 'inativo': return <Badge variant="destructive">Inativo</Badge>;
      case 'visitante': return <Badge variant="secondary">Visitante</Badge>;
      case 'transferido': return <Badge variant="outline">Transferido</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };
  const getMemberMinistries = (memberId: string) => {
    return ministryMembers
      .filter(mm => mm.memberId === memberId)
      .map(mm => {
        const ministry = ministries.find(m => m.id === mm.ministryId);
        const position = allPositions.find(p => p.id === mm.positionId);
        return {
          id: mm.id,
          ministryName: ministry?.name || 'Desconhecido',
          role: mm.role,
          positionName: position?.name || (mm.role === 'leader' ? 'Líder' : 'Membro')
        };
      });
  };
  const accessEnabled = form.watch("hasAccess");
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Membros</h1>
          <p className="text-muted-foreground">Base de dados unificada da congregação.</p>
        </div>
        <Button className="btn-gradient" onClick={() => { setEditingMember(null); setIsDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Membro
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail, status..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
      </div>
      <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Membro</TableHead>
              <TableHead>Ministérios</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Acesso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id} className="group hover:bg-slate-50 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage src={member.photoUrl} />
                      <AvatarFallback>{member.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{member.fullName}</span>
                      <span className="text-xs text-muted-foreground">{member.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {getMemberMinistries(member.id).slice(0, 2).map((min) => (
                      <Badge key={min.id} variant="secondary" className="text-[9px] py-0">{min.ministryName}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(member.memberStatus)}</TableCell>
                <TableCell>
                  {member.hasAccess ? (
                    <Badge className="capitalize bg-primary/10 text-primary border-primary/20" variant="outline">
                      {member.accessRole === 'admin' ? 'Administrador' : member.accessRole === 'leader' ? 'Líder' : 'Membro'}
                    </Badge>
                  ) : (
                    <span className="text-xs text-slate-300 italic">Nenhum</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditingMember(member); setIsDialogOpen(true); }}>Editar</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => { if(confirm('Excluir?')) deleteMemberAction(member.id); }}>Excluir</DropdownMenuItem>
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
            <DialogTitle>{editingMember ? 'Editar Perfil' : 'Novo Cadastro'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24 border-2 border-primary/20">
                  <AvatarImage src={form.watch('photoUrl')} />
                  <AvatarFallback><UserCircle className="h-12 w-12 text-muted-foreground" /></AvatarFallback>
                </Avatar>
                <label className="p-1.5 bg-primary text-primary-foreground rounded-full shadow cursor-pointer">
                  <Camera className="h-4 w-4" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Dados Pessoais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem className="md:col-span-2"><FormLabel>Nome Completo *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>E-mail Pessoal *</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>Telefone Principal *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
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
                        <FormLabel>Habilitar Acesso</FormLabel>
                      </FormItem>
                    )} />
                  </div>
                  {accessEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <FormField control={form.control} name="accessEmail" render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail de Login *</FormLabel>
                          <FormControl><Input placeholder="login@churchflow.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="accessPassword" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha de Acesso *</FormLabel>
                          <FormControl><Input type="password" placeholder="********" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="accessRole" render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Nível de Permissão *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="admin">Administrador (Acesso Total)</SelectItem>
                              <SelectItem value="leader">Líder (Acesso Administrativo Parcial)</SelectItem>
                              <SelectItem value="member">Membro (Acesso ao Portal do Membro)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Define o que este membro pode visualizar e editar no sistema.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  )}
                </div>
                <Separator />
                <Button type="submit" className="w-full btn-gradient h-12 text-lg">
                  <Save className="mr-2 h-5 w-5" />
                  {editingMember ? 'Salvar Alterações' : 'Cadastrar Membro'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}