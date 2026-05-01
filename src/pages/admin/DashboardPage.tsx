import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Heart, ArrowUpRight, Calendar, MapPin, Clock, FileText, Download, Banknote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
    },
    {
      title: "Ministérios Ativos",
      value: stats?.totalMinistries ?? 0,
      icon: Heart,
      trend: "+2 novos",
      color: "text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400"
    }
  ];
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">Visão geral da sua congregação e atividades.</p>
        </div>
        <Link to="/admin/reports">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Ver Relatórios Completos
          </Button>
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <Card key={i} className="hover:shadow-soft transition-all duration-200 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{m.title}</CardTitle>
              <div className={`p-2 rounded-lg ${m.color}`}>
                <m.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{isLoading ? '...' : m.value}</div>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Crescimento de Membros</CardTitle>
              <CardDescription>Histórico de novos membros ativos</CardDescription>
            </div>
            <div className="h-8 w-24 bg-blue-50 rounded-lg flex items-center justify-center text-[10px] font-bold text-blue-600 uppercase tracking-widest">
              6 Meses
            </div>
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
                  fill="#3B82F6"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <div className="lg:col-span-3 space-y-6">
          <Card className="shadow-soft border-slate-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3">
              <Link to="/admin/reports" className="group">
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-soft transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Banknote className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">Relatório Financeiro</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                </div>
              </Link>
              <Link to="/admin/reports" className="group">
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-soft transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">Lista de Membros</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                </div>
              </Link>
            </CardContent>
          </Card>
          <Card className="shadow-soft border-slate-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Próximos Eventos</CardTitle>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Carregando agenda...</div>
              ) : stats?.upcomingEvents.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground italic">Nenhum evento próximo.</div>
              ) : (
                stats?.upcomingEvents.map((event) => (
                  <div key={event.id} className="group p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-soft transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors text-sm">{event.title}</h4>
                      <span className="text-[9px] font-bold uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded">{event.category}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 opacity-70">
                      <div className="flex items-center text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" /> {event.time}
                      </div>
                      <div className="flex items-center text-[10px] text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" /> {event.location}
                      </div>
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