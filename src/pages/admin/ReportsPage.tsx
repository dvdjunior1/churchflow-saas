import React from 'react';
import { 
  FileText, 
  Download, 
  Users, 
  Banknote, 
  Calendar as CalendarIcon, 
  ArrowUpRight, 
  FileBarChart,
  Table as TableIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { toast } from 'sonner';
export default function ReportsPage() {
  const mockTrendData = [
    { month: 'Jan', members: 120, finance: 4500 },
    { month: 'Fev', members: 135, finance: 5200 },
    { month: 'Mar', members: 150, finance: 4800 },
    { month: 'Abr', members: 162, finance: 6100 },
    { month: 'Mai', members: 180, finance: 5900 },
    { month: 'Jun', members: 195, finance: 7200 },
  ];
  const handleExport = (type: string, format: 'PDF' | 'Excel') => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Gerando relatório de ${type} em ${format}...`,
        success: `Relatório de ${type} baixado com sucesso!`,
        error: 'Erro ao gerar relatório.',
      }
    );
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Central de Relatórios</h1>
            <p className="text-muted-foreground">Análise detalhada de crescimento, finanças e engajamento.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Últimos 6 Meses
            </Button>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-4 bg-muted/50 p-1">
            <TabsTrigger value="overview">Geral</TabsTrigger>
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="finance">Financeiro</TabsTrigger>
            <TabsTrigger value="events">Agenda</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-slate-200 shadow-soft">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Crescimento de Membros
                  </CardTitle>
                  <CardDescription>Evolução semestral da congregação</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockTrendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="members" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-soft">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Banknote className="h-5 w-5 text-emerald-500" />
                    Fluxo Financeiro
                  </CardTitle>
                  <CardDescription>Entradas mensais consolidadas</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockTrendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Line type="monotone" dataKey="finance" stroke="hsl(var(--primary))" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <h2 className="text-xl font-semibold mt-10 mb-4">Exportar Dados Rápidos</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: "Lista de Membros Ativos", icon: Users, type: "Membros" },
                { title: "Balancete Mensal", icon: Banknote, type: "Financeiro" },
                { title: "Relatório de Atividades", icon: CalendarIcon, type: "Agenda" }
              ].map((report, i) => (
                <Card key={i} className="hover:border-primary/50 transition-colors cursor-default border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 rounded-lg bg-slate-100">
                        <report.icon className="h-6 w-6 text-slate-600" />
                      </div>
                      <Badge variant="secondary">Pronto</Badge>
                    </div>
                    <h3 className="font-bold mb-4">{report.title}</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleExport(report.type, 'PDF')}>
                        <FileText className="mr-2 h-3 w-3" /> PDF
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleExport(report.type, 'Excel')}>
                        <TableIcon className="mr-2 h-3 w-3" /> Excel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="members" className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Relatórios Detalhados de Membros</h3>
            <p className="text-muted-foreground mb-6">Gere listas por batismo, aniversário ou ministério.</p>
            <Button className="btn-gradient px-8" onClick={() => handleExport('Membros', 'PDF')}>
              <Download className="mr-2 h-4 w-4" /> Configurar Exportação
            </Button>
          </TabsContent>
          <TabsContent value="finance" className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
            <FileBarChart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Demonstrativo Financeiro</h3>
            <p className="text-muted-foreground mb-6">Analise dízimos e ofertas por período e categoria.</p>
            <Button className="btn-gradient px-8" onClick={() => handleExport('Financeiro', 'Excel')}>
              <Download className="mr-2 h-4 w-4" /> Gerar Planilha
            </Button>
          </TabsContent>
          <TabsContent value="events" className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Relatório de Presença e Escalas</h3>
            <p className="text-muted-foreground mb-6">Acompanhe a participação nas atividades da igreja.</p>
            <Button className="btn-gradient px-8" onClick={() => handleExport('Agenda', 'PDF')}>
              <Download className="mr-2 h-4 w-4" /> Baixar PDF
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}