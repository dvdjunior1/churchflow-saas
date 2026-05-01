import React, { useState, useMemo } from 'react';
import { Wallet, Search, TrendingUp, Calendar, Download } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useDataStore } from '@/lib/data-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
export default function MemberDonationsPage() {
  const user = useAuthStore(s => s.user);
  const memberId = user?.memberId;
  const records = useDataStore(s => s.financialRecords);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const myRecords = useMemo(() => {
    if (!memberId) return [];
    return records.filter(r => r.memberId === memberId);
  }, [records, memberId]);
  const filtered = useMemo(() => {
    return myRecords.filter(r => {
      const matchesSearch = r.category.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || r.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [myRecords, search, typeFilter]);
  const total = useMemo(() => 
    filtered.reduce((acc, curr) => acc + curr.amount, 0), 
  [filtered]);
  const lastDonation = useMemo(() => {
    if (myRecords.length === 0) return null;
    return [...myRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }, [myRecords]);
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Minhas Contribuições</h1>
        <p className="text-muted-foreground">Transparência e histórico da sua fidelidade com a obra.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3 mb-10">
        <Card className="bg-primary text-primary-foreground border-none shadow-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80 uppercase">Total Contribuído</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(total)}</div>
            <div className="flex items-center mt-2 text-xs font-medium text-primary-foreground/70">
              <TrendingUp className="h-3 w-3 mr-1" /> No período selecionado
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Última Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {lastDonation ? formatCurrency(lastDonation.amount) : '---'}
            </div>
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" /> {lastDonation ? new Date(lastDonation.date).toLocaleDateString('pt-BR') : 'Sem registros'}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Frequência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{myRecords.length} Entradas</div>
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              Histórico completo registrado localmente
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filtrar por destinação..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="tithe">Dízimo</SelectItem>
            <SelectItem value="offering">Oferta</SelectItem>
            <SelectItem value="donation">Doação</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card className="rounded-xl overflow-hidden border-slate-200 shadow-soft">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="pl-6">Data</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right pr-6">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">Nenhuma contribuição encontrada.</TableCell></TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="pl-6 text-muted-foreground">
                    {new Date(r.date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="font-medium">{r.category}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {r.type === 'tithe' ? 'Dízimo' : r.type === 'offering' ? 'Oferta' : 'Doação'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-foreground">{formatCurrency(r.amount)}</TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs" onClick={() => toast.success("Comprovante gerado!")}>
                      <Download className="h-3 w-3" /> PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}