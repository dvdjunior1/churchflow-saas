import React from 'react';
import {
  FileText,
  Download,
  Users,
  Banknote,
  Calendar as CalendarIcon,
  ArrowUpRight,
  FileBarChart,
  Table as TableIcon,
  Activity,
  Heart,
  LucideIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useDataStore } from '@/lib/data-store';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { toast } from 'sonner';
interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend: string;
  color: string;
}
const SummaryCard = ({ title, value, icon: Icon, trend, color }: SummaryCardProps) => (
  <Card className={`relative overflow-hidden border-none shadow-soft ${color}`}>
    <div className="absolute right-0 top-0 p-4 opacity-10"><Icon className="h-16 w-16" /></div>
    <CardContent className="p-6">
      <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">{title}</p>
      <h3 className="text-3xl font-black mb-2">{value}</h3>
      <p className="text-[10px] flex items-center font-bold">
        <ArrowUpRight className="h-3 w-3 mr-1" /> {trend}
      </p>
    </CardContent>
  </Card>
);
export default function ReportsPage() {
  const members = useDataStore(s => s.members);
  const records = useDataStore(s => s.financialRecords);
  const ministries = useDataStore(s => s.ministries);
  const activities = useDataStore(s => s.activities);
  const totalRevenue = records.reduce((acc, curr) => acc + curr.amount, 0);
  const activeMembers = members.filter(m => m.memberStatus === 'ativo').length;
  const inProgressActs = activities.filter(a => a.status === 'in_progress').length;
  const mockTrendData = [
    { month: 'Jan', members: 120, finance: 4500 },
    { month: 'Fev', members: 135, finance: 5200 },
    { month: 'Mar', members: 150, finance: 4800 },
    { month: 'Abr', members: 162, finance: 6100 },
    { month: 'Mai', members: 180, finance: 5900 },
    { month: 'Jun', members: activeMembers, finance: totalRevenue / 4 }, // Simplified
  ];
  const handleExport = (type: string, format: 'PDF' | 'Excel') => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Gerando relatório em ${format}...`,
        success: `Relatório de ${type} pronto para baixar!`,
        error: 'Erro ao processar arquivo.',
      }
    );
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground">Relatórios Inteligentes</h1>
            <p className="text-muted-foreground font-medium">Sua igreja em dados, para decisões mais assertivas.</p>
          </div>
          <Button variant="outline" className="border-slate-300">
            <CalendarIcon className="mr-2 h-4 w-4" /> Período Personalizado
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <SummaryCard
            title="Membros Totais"
            value={members.length}
            icon={Users}
            trend="12% este mês"
            color="bg-blue-600 text-white"
          />
          <SummaryCard
            title="Receita Consolidada"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
            icon={Banknote}
            trend="Meta: 90%"
            color="bg-emerald-600 text-white"
          />
          <SummaryCard
            title="Ministérios Ativos"
            value={ministries.length}
            icon={Heart}
            trend="Plena atividade"
            color="bg-rose-600 text-white"
          />
          <SummaryCard
            title="Atividades"
            value={inProgressActs}
            icon={Activity}
            trend="Em execução"
            color="bg-slate-800 text-white"
          />
        </div>
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-muted/50 p-1 w-full max-w-md border">
            <TabsTrigger value="overview" className="flex-1">Visão Geral</TabsTrigger>
            <TabsTrigger value="members" className="flex-1">Membros</TabsTrigger>
            <TabsTrigger value="finance" className="flex-1">Financeiro</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-slate-200 shadow-soft">
                <CardHeader>
                  <CardTitle className="text-lg">Tendência de Crescimento</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockTrendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        cursor={{fill: '#f8fafc'}}
                      />
                      <Bar dataKey="members" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={35}>
                        {mockTrendData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === mockTrendData.length - 1 ? '#2563eb' : '#3b82f6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-soft">
                <CardHeader>
                  <CardTitle className="text-lg">Evolução Financeira</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockTrendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Line type="monotone" dataKey="finance" stroke="#10b981" strokeWidth={4} dot={{r: 6, fill: '#10b981', strokeWidth: 0}} activeDot={{r: 8}} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-3 pt-6">
              {[
                { title: "Lista de Membros Ativos", icon: Users, type: "Membros" },
                { title: "Balancete Mensal", icon: Banknote, type: "Financeiro" },
                { title: "Relatório de Atividades", icon: Activity, type: "Agenda" }
              ].map((report, i) => (
                <Card key={i} className="hover:border-primary/50 transition-colors border-slate-200">
                  <CardContent className="p-6">
                    <div className="p-2 rounded-lg bg-slate-100 w-fit mb-4"><report.icon className="h-5 w-5 text-slate-600" /></div>
                    <h3 className="font-bold text-sm mb-4">{report.title}</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 text-[10px]" onClick={() => handleExport(report.type, 'PDF')}>PDF</Button>
                      <Button variant="outline" size="sm" className="flex-1 text-[10px]" onClick={() => handleExport(report.type, 'Excel')}>EXCEL</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}