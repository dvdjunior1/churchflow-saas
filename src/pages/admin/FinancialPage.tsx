import React, { useState } from 'react';
import { Banknote, Plus, TrendingUp, TrendingDown, Search, Save, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDataStore } from '@/lib/data-store';
import type { FinancialRecord } from '@shared/types';
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
  amount: z.number().positive("Valor deve ser positivo"),
  type: z.enum(['tithe', 'offering', 'donation']),
  memberId: z.string().min(1, "Selecione um contribuinte"),
  category: z.string().min(2, "Categoria obrigatória"),
  description: z.string().optional(),
  date: z.string().min(10, "Data obrigatória"),
});
export function FinancialPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const records = useDataStore(s => s.financialRecords);
  const addFinancialRecord = useDataStore(s => s.addFinancialRecord);
  const deleteFinancialRecord = useDataStore(s => s.deleteFinancialRecord);
  const members = useDataStore(s => s.members);
  // Compute stats locally
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const totalMonth = records
    .filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, curr) => acc + curr.amount, 0);
  const distribution = ['tithe', 'offering', 'donation'].map(t => ({
    name: t === 'tithe' ? 'Dízimos' : t === 'offering' ? 'Ofertas' : 'Doações',
    type: t,
    value: records.filter(r => r.type === t).reduce((acc, curr) => acc + curr.amount, 0)
  }));
  const form = useForm<z.infer<typeof financeSchema>>({
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
  const onSubmit = (values: z.infer<typeof financeSchema>) => {
    try {
      addFinancialRecord({
        ...values,
        memberId: values.memberId === 'anonymous' ? undefined : values.memberId
      });
      setIsAddOpen(false);
      form.reset();
      toast.success('Registro financeiro salvo localmente!');
    } catch (e) {
      toast.error('Erro ao salvar registro');
    }
  };
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const getMemberName = (id?: string) => {
    if (!id || id === 'anonymous') return 'Anônimo';
    return members.find(m => m.id === id)?.fullName || 'Membro não encontrado';
  };
  const filteredRecords = records.filter(r =>
    r.category.toLowerCase().includes(search.toLowerCase()) ||
    getMemberName(r.memberId).toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Financeiro</h1>
          <p className="text-muted-foreground">Controle central de contribuições processado localmente.</p>
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
              <DialogDescription>Dados persistidos instantaneamente.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="amount" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" onChange={(e) => field.onChange(e.target.valueAsNumber)} value={field.value} />
                      </FormControl>
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
                    <FormControl><Input placeholder="Ex: Geral, Missões" {...field} /></FormControl>
                  </FormItem>
                )} />
                <Button type="submit" className="w-full btn-gradient">Salvar Registro</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-primary text-primary-foreground border-none shadow-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80 uppercase">Total do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalMonth)}</div>
            <div className="flex items-center mt-2 text-xs font-medium text-green-300">
              <TrendingUp className="h-3 w-3 mr-1" /> Calculado em Tempo Real
            </div>
          </CardContent>
        </Card>
        {distribution.map((d, i) => (
          <Card key={i} className="hover:shadow-soft transition-shadow border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{d.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(d.value)}</div>
              <div className="w-full bg-secondary h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-primary h-full transition-all" style={{ width: `${(d.value / (totalMonth || 1)) * 100}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="rounded-xl overflow-hidden border border-slate-200 shadow-soft">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <CardTitle className="text-lg">Histórico Local</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar..." className="pl-10 w-full md:w-[300px] bg-background" value={search} onChange={(e) => setSearch(e.target.value)} />
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
              {filteredRecords.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">Nenhum registro encontrado.</TableCell></TableRow>
              ) : (
                filteredRecords.map((r) => (
                  <TableRow key={r.id} className="group">
                    <TableCell className="pl-6 text-sm text-muted-foreground">{new Date(r.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{getMemberName(r.memberId)}</TableCell>
                    <TableCell className="text-sm">{r.category}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{r.type === 'tithe' ? 'Dízimo' : r.type === 'offering' ? 'Oferta' : 'Doação'}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold pr-6">
                      <div className="flex items-center justify-end gap-2">
                        {formatCurrency(r.amount)}
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => deleteFinancialRecord(r.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}