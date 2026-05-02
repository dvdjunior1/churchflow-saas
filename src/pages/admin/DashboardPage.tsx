import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Heart, Calendar, Clock, MapPin, ListTodo, AlertTriangle, Plus, Banknote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDataStore } from '@/lib/data-store';
import { useAuthStore } from '@/lib/auth-store';
import { canAccess } from '@/lib/perms';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
export function DashboardPage() {
  const members = useDataStore(s => s.members);
  const ministries = useDataStore(s => s.ministries);
  const ministryMembers = useDataStore(s => s.ministryMembers);
  const events = useDataStore(s => s.events);
  const activities = useDataStore(s => s.activities);
  const steps = useDataStore(s => s.activitySteps);
  const user = useAuthStore(s => s.user);
  const totalMembers = members?.length ?? 0;
  const totalMinistries = ministries?.length ?? 0;
  const upcomingEvents = (events ?? [])
    .filter(e => e?.date && new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);
  const inProgressActivitiesCount = (activities ?? []).filter(a => a?.status === 'in_progress').length;
  const overdueSteps = (steps ?? []).filter(s => s?.dueDate && new Date(s.dueDate) < new Date() && s.status !== 'completed').length;
  const currentMonthName = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date());
  const capitalizedMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1).replace('.', '');
  const growthData = [
    { month: 'Jan', count: 120 }, { month: 'Fev', count: 135 }, { month: 'Mar', count: 150 },
    { month: 'Abr', count: 162 }, { month: 'Mai', count: 180 }, { month: capitalizedMonth, count: totalMembers }
  ];
  const metrics = [
    { title: "Membros", value: totalMembers, icon: Users, color: "bg-blue-500", trend: "Total da base" },
    { title: "Ministérios", value: totalMinistries, icon: Heart, color: "bg-rose-500", trend: "Equipes ativas" },
    { title: "Atividades", value: inProgressActivitiesCount, icon: ListTodo, color: "bg-amber-500", trend: "Em execução" },
    { title: "Atrasos", value: overdueSteps, icon: AlertTriangle, color: overdueSteps > 0 ? "bg-red-500" : "bg-slate-500", trend: "Tarefas críticas" }
  ];
  const showFinance = canAccess(user, ministryMembers, 'finance');
  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Command Center</h1>
          <p className="text-muted-foreground font-medium">Gestão em tempo real da ChurchFlow.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/members">
            <Button size="sm" className="btn-gradient shadow-primary">
              <Plus className="mr-2 h-4 w-4" /> Novo Membro
            </Button>
          </Link>
          {showFinance && (
            <Link to="/admin/finance">
              <Button size="sm" variant="outline" className="border-slate-300">
                <Banknote className="mr-2 h-4 w-4" /> Registrar Entrada
              </Button>
            </Link>
          )}
        </div>
      </div>
      <div className={`grid gap-4 sm:grid-cols-2 ${showFinance ? 'lg:grid-cols-4' : 'lg:grid-cols-2'}`}>
        {metrics.map((m, i) => (
          <Card key={i} className="group hover:scale-[1.02] transition-all duration-300 border-slate-200 shadow-soft overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className={`p-2.5 rounded-xl text-white shadow-lg ${m.color}`}>
                  <m.icon className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-tighter opacity-60">{m.trend}</Badge>
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wider">{m.title}</p>
                <h3 className="text-4xl font-black tracking-tighter">{m.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-12">
        <Card className="lg:col-span-8 shadow-soft border-slate-200">
          <CardHeader>
            <CardTitle>Crescimento da Congregação</CardTitle>
            <CardDescription>Evolução de membros por mês</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40}>
                  {growthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === growthData.length - 1 ? '#2563eb' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <div className="lg:col-span-4 space-y-8">
          <Card className="shadow-soft border-slate-200">
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Próximos Eventos</CardTitle>
              <Link to="/admin/events"><Button variant="ghost" size="sm" className="h-7 text-xs">Ver Tudo</Button></Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-6">Nenhum evento agendado.</p>
              ) : upcomingEvents.map((event) => (
                <div key={event.id} className="p-3 rounded-xl border bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all group">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm truncate max-w-[150px]">{event.title}</h4>
                    <Badge variant="secondary" className="text-[9px] uppercase py-0">{event.category}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {event.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
              <Heart className="h-24 w-24 fill-white" />
            </div>
            <h4 className="text-lg font-black mb-1">Dica do Dia</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Manter o cadastro de membros atualizado melhora a comunicação da igreja em 80%.
            </p>
            <Button variant="link" className="text-blue-400 p-0 h-auto mt-4 text-xs font-bold">Acessar Secretaria</Button>
          </div>
        </div>
      </div>
    </div>
  );
}