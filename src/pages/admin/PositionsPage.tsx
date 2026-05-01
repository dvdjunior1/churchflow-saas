import React, { useState } from 'react';
import { Briefcase, Plus, Search, Filter, Save, MoreHorizontal, CheckCircle2, XCircle } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDataStore } from '@/lib/data-store';
import type { Position } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
import { toast } from 'sonner';
const positionSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  scope: z.enum(['church', 'ministry']),
  active: z.boolean(),
});
type FormValues = z.infer<typeof positionSchema>;
export function PositionsPage() {
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'church' | 'ministry'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<Position | null>(null);
  const positions = useDataStore(s => s.positions);
  const addPosition = useDataStore(s => s.addPosition);
  const updatePosition = useDataStore(s => s.updatePosition);
  const deactivatePosition = useDataStore(s => s.deactivatePosition);
  const form = useForm<FormValues>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      name: '',
      description: '',
      scope: 'church',
      active: true,
    },
  });
  const onSubmit: SubmitHandler<FormValues> = (values) => {
    try {
      if (editingPos) {
        updatePosition(editingPos.id, {
          name: values.name,
          description: values.description,
          scope: values.scope,
          active: values.active,
        });
        toast.success('Cargo atualizado com sucesso');
      } else {
        addPosition({
          name: values.name,
          description: values.description,
          scope: values.scope,
        });
        toast.success('Cargo criado com sucesso');
      }
      setIsDialogOpen(false);
      setEditingPos(null);
      form.reset();
    } catch (e) {
      toast.error('Erro ao salvar cargo');
    }
  };
  const handleEdit = (pos: Position) => {
    setEditingPos(pos);
    form.reset({
      name: pos.name,
      description: pos.description || '',
      scope: pos.scope,
      active: pos.active,
    });
    setIsDialogOpen(true);
  };
  const filteredPositions = positions.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          (p.description?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesScope = scopeFilter === 'all' || p.scope === scopeFilter;
    return matchesSearch && matchesScope;
  });
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cargos & Funções</h1>
          <p className="text-muted-foreground">Defina a estrutura hierárquica e operacional da igreja.</p>
        </div>
        <Button className="btn-gradient" onClick={() => { setEditingPos(null); form.reset(); setIsDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cargo
        </Button>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cargos..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={scopeFilter} onValueChange={(val: 'all' | 'church' | 'ministry') => setScopeFilter(val)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Escopo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Escopos</SelectItem>
              <SelectItem value="church">Geral (Igreja)</SelectItem>
              <SelectItem value="ministry">Ministério</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Escopo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPositions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                  Nenhum cargo encontrado para os filtros selecionados.
                </TableCell>
              </TableRow>
            ) : (
              filteredPositions.map((pos) => (
                <TableRow key={pos.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-medium">{pos.name}</TableCell>
                  <TableCell className="max-w-[300px] truncate text-muted-foreground text-sm">
                    {pos.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={pos.scope === 'church' ? 'default' : 'secondary'} className="capitalize">
                      {pos.scope === 'church' ? 'Geral' : 'Ministério'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {pos.active ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-slate-400" />
                      )}
                      <span className={pos.active ? "text-emerald-700 font-medium" : "text-slate-400"}>
                        {pos.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(pos)}>Editar</DropdownMenuItem>
                        {pos.active ? (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              if (confirm('Deseja desativar este cargo? Ele não poderá ser mais selecionado em novos cadastros.')) {
                                deactivatePosition(pos.id);
                                toast.info('Cargo desativado');
                              }
                            }}
                          >
                            Desativar
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => updatePosition(pos.id, { active: true })}>
                            Ativar
                          </DropdownMenuItem>
                        )}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPos ? 'Editar Cargo' : 'Novo Cargo'}</DialogTitle>
            <DialogDescription>
              Defina o nome e escopo da função para atribuição a membros.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cargo</FormLabel>
                  <FormControl><Input placeholder="Ex: Diácono, Líder de Louvor..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="scope" render={({ field }) => (
                <FormItem>
                  <FormLabel>Escopo de Atribuição</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione o escopo" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="church">Geral (Toda a Igreja)</SelectItem>
                      <SelectItem value="ministry">Ministério (Específico de grupos)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    "Geral" aparece no cadastro do membro. "Ministério" aparece na gestão de equipes.
                  </FormDescription>
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl><Textarea placeholder="Responsabilidades da função..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="active" render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <FormLabel>Ativo</FormLabel>
                    <FormDescription className="text-xs">Disponível para seleção</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />
              <Button type="submit" className="w-full btn-gradient">
                <Save className="mr-2 h-4 w-4" />
                {editingPos ? 'Salvar Alterações' : 'Criar Cargo'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}