import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Heart, ArrowUpRight, TrendingUp } from 'lucide-react';
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
  const cards = [
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
        <h1 className="text-3xl font-bold tracking-tight">Painel Geral</h1>
        <p className="text-muted-foreground">Bem-vindo de volta ao centro de comando da sua igreja.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : card.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                {card.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Crescimento da Igreja</CardTitle>
            <CardDescription>Membros ativos nos últimos 5 meses</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.growthData ?? []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  cursor={{fill: 'hsl(var(--muted))'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
            <CardDescription>Dicas de gestão hoje</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              "Atualizar fotos dos novos membros",
              "Enviar escala para Ministério Kids",
              "Revisar relatórios financeiros de Maio"
            ].map((task, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm font-medium">{task}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}