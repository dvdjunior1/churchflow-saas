import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Banknote, Plus, TrendingUp, TrendingDown, Search, Filter, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api-client';
import { useDataStore } from '@/lib/data-store';
import type { FinancialRecord, FinancialStats } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
const financeSchema = z.object({
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  type: z.enum(['tithe', 'offering', 'donation']),
  memberId: z.string().optional().or(z.literal("anonymous")),
  category: z.string().min(2, "Categoria obrigatória"),
  description: z.string().optional(),
  date: z.string().min(10, "Data obrigatória"),
});
type FinanceFormValues = z.infer<typeof financeSchema>;
export function FinancialPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const records = useDataStore(s => s.financialRecords);
  const setRecords = useDataStore(s => s.setFinancialRecords);
  const addRecordAction = useDataStore(s => s.addFinancialRecord);
  const members = useDataStore(s => s.members);
  const { data: stats, isLoading: isLoadingStats } = useQuery<FinancialStats>({
    queryKey: ['finance-stats'],
    queryFn: () => api<FinancialStats>('/api/finances/stats'),
  });
  const { isLoading: isLoadingRecords } = useQuery<{ items: FinancialRecord[] }>({
    queryKey: ['finances'],
    queryFn: async () => {
      const data = await api<{ items: FinancialRecord[] }>('/api/finances');
      setRecords(data.items);
      return data;
    },
  });
  const form = useForm<FinanceFormValues>({
    resolver: zodResolver(financeSchema),
    defaultValues: {
      amount: 0,
      type: 'offering',
      category: 'Geral',
      date: new Date().toISOString().split('T')[0],
      description: '',
      memberId: 'anonymous'
    },
  });
  const addMutation = useMutation({
    mutationFn: (values: FinanceFormValues) => {
      const payload = {
        ...values,
        memberId: values.memberId === 'anonymous' ? undefined : values.memberId
      };
      return api<FinancialRecord>('/api/finances', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    onSuccess: (newRecord) => {
      addRecordAction(newRecord);
      setIsAddOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['finance-stats'] });
      toast.success('Registro financeiro salvo!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erro ao salvar registro');
    }
  });
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const getMemberName = (id?: string) => {
    if (!id || id === 'anonymous') return 'Anônimo';
    return members.find(m => m.id === id)?.fullName || 'Desconhecido';
  };
  const filteredRecords = records.filter(r =>
    r.category.toLowerCase().includes(search.toLowerCase()) ||
    getMemberName(r.memberId).toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">Controle central de contribuições e fluxo de caixa.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient h-12 px-6">
              <Plus className="mr-2 h-5 w-5" /> Registrar Entrada
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Entrada Financeira</DialogTitle>
              <DialogDescription>Preencha os detalhes da contribuição.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((v) => addMutation.mutate(v))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="amount" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="tithe">Dízimo</SelectItem>
                          <SelectItem value="offering">Oferta</SelectItem>
                          <SelectItem value="donation">Doação</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="memberId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contribuinte</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="anonymous">Anônimo</SelectItem>
                        {members.map(m => <SelectItem key={m.id} value={m.id}>{m.fullName}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria / Destinação</FormLabel>
                    <FormControl><Input placeholder="Ex: Culto de Jovens" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full btn-gradient" disabled={addMutation.isPending}>
                  {addMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Registrar
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-primary text-primary-foreground border-none shadow-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-wider">Total do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoadingStats ? '...' : formatCurrency(stats?.totalMonth ?? 0)}</div>
            <div className="flex items-center mt-2 text-xs font-medium">
              {(stats?.growth ?? 0) >= 0 ? (
                <span className="flex items-center text-green-300"><TrendingUp className="h-3 w-3 mr-1" /> +{stats?.growth.toFixed(1)}%</span>
              ) : (
                <span className="flex items-center text-red-300"><TrendingDown className="h-3 w-3 mr-1" /> {stats?.growth.toFixed(1)}%</span>
              )}
              <span className="ml-2 opacity-70 italic">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>
        {stats?.distribution.map((d, i) => (
          <Card key={i} className="hover:shadow-soft transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{d.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(d.value)}</div>
              <div className="w-full bg-secondary h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-700"
                  style={{ width: `${(d.value / (stats.totalMonth || 1)) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="rounded-xl overflow-hidden border shadow-soft">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Histórico de Entradas</CardTitle>
              <CardDescription>Fluxo recente de dízimos e ofertas.</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por categoria ou membro..."
                className="pl-10 w-full md:w-[300px] bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow>
                <TableHead className="pl-6">Data</TableHead>
                <TableHead>Membro</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right pr-6">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingRecords && records.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Carregando...</TableCell></TableRow>
              ) : filteredRecords.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">Nenhum registro encontrado.</TableCell></TableRow>
              ) : filteredRecords.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="pl-6 text-sm text-muted-foreground">
                    {new Date(r.date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="font-medium">{getMemberName(r.memberId)}</TableCell>
                  <TableCell className="text-sm">{r.category}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize px-2 py-0 h-6">
                      {r.type === 'tithe' ? 'Dízimo' : r.type === 'offering' ? 'Oferta' : 'Doação'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold pr-6 text-foreground">{formatCurrency(r.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}