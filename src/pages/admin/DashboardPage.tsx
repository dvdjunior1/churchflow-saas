import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Heart, ArrowUpRight, Calendar, Clock, MapPin, FileText, ListTodo, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDataStore } from '@/lib/data-store';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
export function DashboardPage() {
  const members = useDataStore(s => s.members);
  const ministries = useDataStore(s => s.ministries);
  const events = useDataStore(s => s.events);
  const activities = useDataStore(s => s.activities);
  const steps = useDataStore(s => s.activitySteps);
  const totalMembers = members?.length ?? 0;
  const totalMinistries = ministries?.length ?? 0;
  const upcomingEvents = (events ?? [])
    .filter(e => e?.date && new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);
  const inProgressActivities = (activities ?? []).filter(a => a?.status === 'in_progress').length;
  const now = new Date();
  const overdueSteps = (steps ?? []).filter(s => s?.dueDate && new Date(s.dueDate) < now && s.status !== 'completed').length;
  const nextActivities = (activities ?? [])
    .filter(a => a && (a.status === 'planned' || a.status === 'in_progress'))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);
  const currentMonthName = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date());
  const capitalizedMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1).replace('.', '');
  const growthData = [
    { month: 'Jan', count: 120 }, { month: 'Fev', count: 135 }, { month: 'Mar', count: 150 },
    { month: 'Abr', count: 162 }, { month: 'Mai', count: 180 }, { month: capitalizedMonth, count: totalMembers }
  ];
  const metrics = [
    {
      title: "Membros",
      value: totalMembers,
      icon: Users,
      trend: "Total Ativos",
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
    },
    {
      title: "Ministérios",
      value: totalMinistries,
      icon: Heart,
      trend: "Atuando",
      color: "text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400"
    },
    {
      title: "Em Progresso",
      value: inProgressActivities,
      icon: ListTodo,
      trend: "Atividades Ativas",
      color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400"
    },
    {
      title: "Atrasos",
      value: overdueSteps,
      icon: AlertTriangle,
      trend: "Tarefas Pendentes",
      color: overdueSteps > 0 ? "text-red-600 bg-red-100" : "text-slate-600 bg-slate-100"
    }
  ];
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Geral</h1>
          <p className="text-muted-foreground">Visão imediata da congregação e produtividade.</p>
        </div>
        <Link to="/admin/reports">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Relatórios Completos
          </Button>
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <Card key={i} className="hover:shadow-soft transition-all duration-200 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{m.title}</CardTitle>
              <div className={`p-2 rounded-lg ${m.color}`}>
                <m.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{m.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-2">
                <ArrowUpRight className="h-3 w-3 mr-1 text-green-500 font-bold" />
                {m.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 shadow-soft border-slate-200">
          <CardHeader>
            <CardTitle>Crescimento Local</CardTitle>
            <CardDescription>Evolução da membresia nos últimos meses</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                <Tooltip cursor={{fill: 'hsl(var(--primary))', opacity: 0.05}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <div className="lg:col-span-3 space-y-6">
          <Card className="shadow-soft border-slate-200">
            <CardHeader className="pb-4"><CardTitle className="text-lg">Próximas Atividades</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {nextActivities.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground italic">Nenhuma atividade em andamento.</div>
              ) : (
                nextActivities.map((act) => {
                  const mName = ministries.find(m => m.id === act.ministryId)?.name;
                  return (
                    <div key={act.id} className="group p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-soft transition-all">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-900 text-sm truncate max-w-[180px]">{act.title}</h4>
                        <Badge variant="outline" className="text-[9px] uppercase">{act.status}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 opacity-70">
                        <Badge variant="secondary" className="text-[9px] py-0">{mName || 'Geral'}</Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {act.startDate ? new Date(act.startDate).toLocaleDateString() : '---'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <Link to="/admin/activities" className="block w-full">
                <Button variant="ghost" className="w-full text-xs mt-2">Ver Todas Atividades</Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="shadow-soft border-slate-200">
            <CardHeader className="pb-4"><CardTitle className="text-lg">Próximos Eventos</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground italic">Nenhum evento agendado.</div>
              ) : (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="group p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-soft transition-all">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-900 text-sm">{event.title}</h4>
                      <Badge variant="outline" className="text-[9px] uppercase">{event.category}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 opacity-70">
                      <div className="flex items-center text-[10px] text-muted-foreground"><Clock className="h-3 w-3 mr-1" /> {event.time}</div>
                      <div className="flex items-center text-[10px] text-muted-foreground"><MapPin className="h-3 w-3 mr-1" /> {event.location}</div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}