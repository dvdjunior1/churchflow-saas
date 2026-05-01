import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreHorizontal, Filter, UserCircle, Save, Camera, Cake, Briefcase, X, Heart, ExternalLink } from 'lucide-react';
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
      });
    } else {
      form.reset({
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
        updateMemberAction(editingMember.id, payload);
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
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px]">Membro</TableHead>
              <TableHead>Cargos (Geral)</TableHead>
              <TableHead>Ministérios</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-muted-foreground">Nenhum membro encontrado com estes critérios.</p>
                    {search && (
                      <Button variant="link" size="sm" onClick={() => setSearch('')}>
                        Limpar Filtros
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => {
                const myMinistries = getMemberMinistries(member.id);
                return (
                  <TableRow key={member.id} className="group hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarImage src={member.photoUrl} alt={member.fullName} />
                          <AvatarFallback>{member.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground truncate max-w-[150px]">{member.fullName}</span>
                            {member.showBirthdayPublic && <Cake className="h-3 w-3 text-rose-500" />}
                          </div>
                          <span className="text-xs text-muted-foreground truncate max-w-[150px]">{member.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {member.positions?.map(pid => {
                          const pname = allPositions.find(p => p.id === pid)?.name;
                          return pname ? <Badge key={`${member.id}-${pid}`} variant="outline" className="text-[10px] py-0">{pname}</Badge> : null;
                        })}
                        {!member.positions?.length && <span className="text-xs text-slate-300 italic">Nenhum</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {myMinistries.slice(0, 2).map((min) => (
                          <Badge 
                            key={min.id} 
                            className={`text-[9px] py-0 ${min.role === 'leader' ? 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'}`} 
                            variant="outline"
                          >
                            {min.ministryName}
                          </Badge>
                        ))}
                        {myMinistries.length > 2 && (
                          <Badge variant="outline" className="text-[9px] py-0 bg-slate-50 text-muted-foreground">
                            +{myMinistries.length - 2}
                          </Badge>
                        )}
                        {myMinistries.length === 0 && <span className="text-xs text-slate-300 italic">-</span>}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(member.memberStatus)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">{member.phone}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingMember(member); setIsDialogOpen(true); }}>Editar Dados</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              if (confirm('Remover este registro?')) {
                                deleteMemberAction(member.id);
                                toast.success('Membro removido');
                              }
                            }}
                          >
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Editar Perfil' : 'Novo Cadastro'}</DialogTitle>
            <DialogDescription>Preencha os dados completos do membro abaixo.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-2 border-primary/20">
                    <AvatarImage src={form.watch('photoUrl')} />
                    <AvatarFallback><UserCircle className="h-12 w-12 text-muted-foreground" /></AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full shadow cursor-pointer hover:scale-110 transition-transform">
                    <Camera className="h-4 w-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">Clique no ícone para alterar a foto (opcional)</p>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Dados Pessoais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem className="md:col-span-2"><FormLabel>Nome Completo *</FormLabel><FormControl><Input placeholder="João Silva" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>E-mail *</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>Telefone Principal *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="birthDate" render={({ field }) => (
                      <FormItem><FormLabel>Data de Nascimento *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="gender" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gênero</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent><SelectItem value="M">Masculino</SelectItem><SelectItem value="F">Feminino</SelectItem><SelectItem value="O">Outro</SelectItem></SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="maritalStatus" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado Civil</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="solteiro">Solteiro(a)</SelectItem><SelectItem value="casado">Casado(a)</SelectItem>
                            <SelectItem value="divorciado">Divorciado(a)</SelectItem><SelectItem value="viuvo">Viúvo(a)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Eclesiásticos & Cargos</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <FormField control={form.control} name="memberStatus" render={({ field }) => (
                      <FormItem className="max-w-xs">
                        <FormLabel>Status de Membresia *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="ativo">Ativo</SelectItem><SelectItem value="inativo">Inativo</SelectItem>
                            <SelectItem value="visitante">Visitante</SelectItem><SelectItem value="transferido">Transferido</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="positions" render={({ field }) => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Atribuições Gerais (Cargos da Igreja)</FormLabel>
                          <FormDescription>Selecione as funções que este membro desempenha na estrutura geral.</FormDescription>
                        </div>
                        <ScrollArea className="h-[200px] rounded-md border p-4 bg-slate-50/50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {activeChurchPositions.map((pos) => (
                              <FormItem key={pos.id} className="flex flex-row items-start space-x-3 space-y-0 p-2 rounded-lg bg-white border border-slate-100 shadow-sm">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(pos.id)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      return checked
                                        ? field.onChange([...current, pos.id])
                                        : field.onChange(current.filter((value) => value !== pos.id));
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium">{pos.name}</FormLabel>
                                  <p className="text-[10px] text-muted-foreground line-clamp-1">{pos.description}</p>
                                </div>
                              </FormItem>
                            ))}
                          </div>
                        </ScrollArea>
                      </FormItem>
                    )} />
                  </div>
                </div>
                <Separator />
                {/* MINISTRY PARTICIPATION SECTION */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Participação em Ministérios</h3>
                  </div>
                  <div className="bg-slate-50 border rounded-xl p-6 space-y-4">
                    {editingMember ? (
                      <>
                        {getMemberMinistries(editingMember.id).length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground italic">Nenhum ministério vinculado a este membro.</p>
                          </div>
                        ) : (
                          <div className="grid gap-3">
                            {getMemberMinistries(editingMember.id).map((min) => (
                              <div key={min.id} className="flex items-center justify-between bg-white p-3 rounded-lg border shadow-sm">
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold">{min.ministryName}</span>
                                  <span className="text-xs text-muted-foreground">{min.positionName}</span>
                                </div>
                                <Badge variant={min.role === 'leader' ? 'default' : 'secondary'} className="text-[10px] uppercase">
                                  {min.role === 'leader' ? 'Líder' : 'Voluntário'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="pt-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs gap-2"
                            onClick={() => navigate('/admin/ministries')}
                          >
                            <ExternalLink className="h-3 w-3" />
                            Ir para Gestão de Ministérios
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground italic text-center py-2">
                        Vinculação de ministérios disponível após o cadastro inicial.
                      </p>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <div>
                    <h4 className="text-sm font-semibold">Exibir Aniversário</h4>
                    <p className="text-xs text-muted-foreground">Permitir visualização pública do aniversário.</p>
                  </div>
                  <FormField control={form.control} name="showBirthdayPublic" render={({ field }) => (
                    <FormItem><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                  )} />
                </div>
              </div>
              <Button type="submit" className="w-full btn-gradient h-12 text-lg">
                <Save className="mr-2 h-5 w-5" />
                {editingMember ? 'Salvar Alterações' : 'Cadastrar Membro'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}