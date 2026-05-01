import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, MoreHorizontal, Filter, UserCircle, Save, Camera, Cake } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDataStore } from '@/lib/data-store';
import type { Member } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { toast } from 'sonner';
const memberSchema = z.object({
  fullName: z.string().min(3, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  birthDate: z.string().optional().default(""),
  baptismDate: z.string().optional().default(""),
  role: z.string().min(2, "Cargo obrigatório"),
  photoUrl: z.string().optional().default(""),
  whatsapp: z.string().optional().default(""),
  alternatePhone: z.string().optional().default(""),
  gender: z.enum(['M', 'F', 'O']).optional().default('M'),
  maritalStatus: z.enum(['solteiro', 'casado', 'divorciado', 'viuvo']).optional().default('solteiro'),
  zipCode: z.string().optional().default(""),
  street: z.string().optional().default(""),
  number: z.string().optional().default(""),
  complement: z.string().optional().default(""),
  neighborhood: z.string().optional().default(""),
  city: z.string().optional().default(""),
  state: z.string().optional().default(""),
  memberStatus: z.enum(['ativo', 'inativo', 'visitante', 'transferido']).default('ativo'),
  notes: z.string().optional().default(""),
  showBirthdayPublic: z.boolean().default(false),
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
  const form = useForm<FormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      birthDate: '',
      baptismDate: '',
      role: 'Membro',
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
        ...editingMember,
        birthDate: editingMember.birthDate || '',
        baptismDate: editingMember.baptismDate || '',
        photoUrl: editingMember.photoUrl || '',
        whatsapp: editingMember.whatsapp || '',
        alternatePhone: editingMember.alternatePhone || '',
        zipCode: editingMember.zipCode || '',
        street: editingMember.street || '',
        number: editingMember.number || '',
        complement: editingMember.complement || '',
        neighborhood: editingMember.neighborhood || '',
        city: editingMember.city || '',
        state: editingMember.state || '',
        notes: editingMember.notes || '',
        showBirthdayPublic: !!editingMember.showBirthdayPublic,
      } as FormValues);
    } else {
      form.reset();
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
  const onSubmit = (values: FormValues) => {
    try {
      if (editingMember) {
        updateMemberAction(editingMember.id, values);
        toast.success('Membro atualizado com sucesso');
      } else {
        const fallbackPhoto = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(values.fullName)}`;
        addMember({
          ...values,
          photoUrl: values.photoUrl || fallbackPhoto
        });
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
    m.memberStatus?.toLowerCase().includes(search.toLowerCase()) ||
    m.city?.toLowerCase().includes(search.toLowerCase())
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
            placeholder="Buscar por nome, e-mail, status ou cidade..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Membro</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10">Nenhum membro encontrado.</TableCell></TableRow>
            ) : (
              filteredMembers.map((member) => (
                <TableRow key={member.id} className="group hover:bg-slate-50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border">
                        <AvatarImage src={member.photoUrl} alt={member.fullName} />
                        <AvatarFallback>{member.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{member.fullName}</span>
                          {member.showBirthdayPublic && <Cake className="h-3 w-3 text-rose-500" />}
                        </div>
                        <span className="text-xs text-muted-foreground">{member.role}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(member.memberStatus)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {member.city && member.neighborhood ? `${member.neighborhood}, ${member.city}` : member.city || 'N/A'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{member.phone}</TableCell>
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
                            if (confirm('Remover este registro? Esta ação é permanente.')) {
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
              ))
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
                <p className="text-xs text-muted-foreground">Clique no ícone para alterar a foto</p>
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
                    <FormField control={form.control} name="whatsapp" render={({ field }) => (
                      <FormItem><FormLabel>WhatsApp</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="birthDate" render={({ field }) => (
                      <FormItem><FormLabel>Data de Nascimento</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
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
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Endereço</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="zipCode" render={({ field }) => (
                      <FormItem><FormLabel>CEP</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="street" render={({ field }) => (
                      <FormItem className="md:col-span-2"><FormLabel>Logradouro</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="number" render={({ field }) => (
                      <FormItem><FormLabel>Número</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="complement" render={({ field }) => (
                      <FormItem><FormLabel>Complemento</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="neighborhood" render={({ field }) => (
                      <FormItem><FormLabel>Bairro</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem className="md:col-span-2"><FormLabel>Cidade</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="state" render={({ field }) => (
                      <FormItem><FormLabel>Estado (UF)</FormLabel><FormControl><Input maxLength={2} {...field} /></FormControl></FormItem>
                    )} />
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Eclesiásticos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="role" render={({ field }) => (
                      <FormItem><FormLabel>Cargo/Função *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="memberStatus" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="ativo">Ativo</SelectItem><SelectItem value="inativo">Inativo</SelectItem>
                            <SelectItem value="visitante">Visitante</SelectItem><SelectItem value="transferido">Transferido</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="baptismDate" render={({ field }) => (
                      <FormItem><FormLabel>Data de Batismo</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem className="md:col-span-2"><FormLabel>Observações</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                    )} />
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <div>
                    <h4 className="text-sm font-semibold">Exibir Aniversário</h4>
                    <p className="text-xs text-muted-foreground">Permitir que outros membros vejam seu dia de aniversário no calendário.</p>
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