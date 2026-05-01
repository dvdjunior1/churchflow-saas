import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, Plus, Users, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { Ministry, Member } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
export function MinistriesPage() {
  const { data: ministriesData, isLoading: isLoadingMin } = useQuery<{ items: Ministry[] }>({
    queryKey: ['ministries'],
    queryFn: () => api('/api/ministries'),
  });
  const { data: membersData } = useQuery<{ items: Member[] }>({
    queryKey: ['members'],
    queryFn: () => api('/api/members'),
  });
  const getLeader = (leaderId?: string) => {
    return membersData?.items.find(m => m.id === leaderId);
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ministérios</h1>
          <p className="text-muted-foreground">Organize as frentes de trabalho da sua comunidade.</p>
        </div>
        <Button className="btn-gradient">
          <Plus className="mr-2 h-4 w-4" />
          Novo Ministério
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoadingMin ? (
          <div className="col-span-full text-center py-20 text-muted-foreground">Carregando ministérios...</div>
        ) : ministriesData?.items.map((min) => {
          const leader = getLeader(min.leaderId);
          return (
            <Card key={min.id} className="hover:shadow-md transition-all duration-300 group flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Heart className="h-5 w-5" />
                  </div>
                  <Badge variant="outline">{min.memberIds.length} Membros</Badge>
                </div>
                <CardTitle className="text-xl">{min.name}</CardTitle>
                <CardDescription className="line-clamp-2 min-h-[40px]">{min.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                {leader ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src={leader.avatarUrl} />
                      <AvatarFallback>LD</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Líder
                      </span>
                      <span className="text-sm font-medium">{leader.name}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic p-3 border rounded-lg">
                    Sem líder definido
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-3 border-t">
                <Button variant="ghost" className="w-full text-sm">Gerenciar Equipe</Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}