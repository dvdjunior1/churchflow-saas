import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Heart, ArrowUpRight, Calendar, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/lib/api-client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import type { DashboardStats } from '@shared/types';
export function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api('/api/dashboard/stats'),
  });
  const metrics = [
    {
      title: "Total de Membros",
      value: stats?.totalMembers ?? 0,
      icon: Users,
      trend: "+12% este mês",
      color: "text-blue-600 bg-blue-100"
    },
    {
      title: "Ministérios Ativos",
      value: stats?.totalMinistries ?? 0,
      icon: Heart,
      trend: "+2 novos",
      color: "text-rose-600 bg-rose-100"
    }
  ];
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">Visão geral da sua congregação e atividades.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <Card key={i} className="hover:shadow-soft transition-all duration-200 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{m.title}</CardTitle>
              <div className={`p-2 rounded-lg ${m.color}`}>
                <m.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoading ? '...' : m.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-2">
                <ArrowUpRight className="h-3 w-3 mr-1 text-green-500 font-bold" />
                {m.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 shadow-soft">
          <CardHeader>
            <CardTitle>Crescimento de Membros</CardTitle>
            <CardDescription>Histórico de novos membros ativos</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.growthData ?? []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                />
                <Tooltip
                  cursor={{fill: 'hsl(var(--muted))', opacity: 0.4}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 0, 0]}
                  barSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <div className="lg:col-span-3 space-y-6">
          <Card className="shadow-soft border-slate-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Próximos Eventos</CardTitle>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Carregando agenda...</div>
              ) : stats?.upcomingEvents.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground italic">Nenhum evento próximo.</div>
              ) : stats?.upcomingEvents.map((event) => (
                <div key={event.id} className="group p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-soft transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{event.title}</h4>
                    <span className="text-[10px] font-bold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded">{event.category}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1.5" /> {event.time}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1.5" /> {event.location}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="bg-gradient-primary text-white border-none overflow-hidden relative">
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-12">
              <Calendar className="w-32 h-32" />
            </div>
            <CardHeader>
              <CardTitle className="text-white">Dica do Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/90 leading-relaxed">
                Manter o cadastro de membros atualizado ajuda a igreja a nutrir relacionamentos mais próximos e pastorais. 
                Revise sua lista de dízimos mensalmente.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}