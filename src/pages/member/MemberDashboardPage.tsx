import React from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { useDataStore } from '@/lib/data-store';
import { Calendar, Heart, Wallet, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
export default function MemberDashboardPage() {
  const user = useAuthStore(s => s.user);
  const memberId = user?.memberId;
  const members = useDataStore(s => s.members);
  const events = useDataStore(s => s.events);
  const records = useDataStore(s => s.financialRecords);
  const ministryMembers = useDataStore(s => s.ministryMembers);
  const ministries = useDataStore(s => s.ministries);
  const linkMember = useDataStore(s => s.linkMember);
  const memberProfile = members.find(m => m.id === memberId);
  const myContributions = records.filter(r => r.memberId === memberId);
  const myMinistryLinks = ministryMembers.filter(mm => mm.memberId === memberId);
  const myMinistries = ministries.filter(min =>
    myMinistryLinks.some(link => link.ministryId === min.id)
  );
  const otherMinistries = ministries.filter(min =>
    !myMinistryLinks.some(link => link.ministryId === min.id)
  );
  const totalDonated = myContributions.reduce((acc, curr) => acc + curr.amount, 0);
  const handleJoinMinistry = async (minId: string) => {
    if (!memberId) {
      toast.error("Vínculo de membro não encontrado.");
      return;
    }
    try {
      const res = await api<any>('/api/ministry-members', {
        method: 'POST',
        body: JSON.stringify({ memberId, ministryId: minId, role: 'member' })
      });
      linkMember(res);
      toast.success("Solicitação enviada!");
    } catch (e) {
      toast.error("Erro ao solicitar participação.");
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
          <Avatar className="h-24 w-24 border-4 border-primary/10">
            <AvatarImage src={memberProfile?.photoUrl} />
            <AvatarFallback className="text-2xl">{user?.name?.substring(0, 2).toUpperCase() || "CF"}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight">Bem-vindo, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-muted-foreground mt-1">É uma alegria ter você conosco em nossa comunidade.</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
              <Badge variant="outline" className="bg-primary/5">{memberProfile?.role || 'Membro'}</Badge>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Ativo</Badge>
            </div>
          </div>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1 space-y-6">
            <Card className="shadow-soft border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                  <Wallet className="h-4 w-4" /> Minha Fidelidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDonated)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total de contribuições registradas</p>
                <Button variant="outline" className="w-full mt-6" size="sm">Ver Histórico</Button>
              </CardContent>
            </Card>
            <Card className="shadow-soft border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                  <Heart className="h-4 w-4" /> Meus Ministérios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {myMinistries.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Você ainda não participa de ministérios.</p>
                ) : (
                  myMinistries.map(min => (
                    <div key={min.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{min.name}</span>
                    </div>
                  ))
                )}
                <Button variant="ghost" className="w-full mt-2 text-xs">Explorar Ministérios</Button>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500" /> Descobrir Ministérios
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {otherMinistries.map(min => (
                  <Card key={min.id} className="border-slate-200 hover:shadow-soft transition-all flex flex-col h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{min.name}</CardTitle>
                      <CardDescription className="text-xs line-clamp-2">{min.description}</CardDescription>
                    </CardHeader>
                    <div className="flex-1" />
                    <CardFooter className="pt-2">
                      <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => handleJoinMinistry(min.id)}>
                        Quero Participar
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> Próximos Eventos
                </h2>
                <Button variant="link" className="text-primary text-sm">Ver agenda completa</Button>
              </div>
              <div className="grid gap-4">
                {events.slice(0, 3).map(event => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex gap-4">
                      <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary">
                        <span className="text-xs font-bold uppercase">{new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                        <span className="text-xl font-bold">{new Date(event.date).getDate()}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold">{event.title}</h3>
                          <Badge variant="secondary" className="text-[10px] uppercase">{event.category}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {event.time}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <Card className="bg-slate-900 text-white border-none shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Heart className="h-32 w-32" />
              </div>
              <CardHeader>
                <CardTitle>Espaço do Voluntário</CardTitle>
                <CardDescription className="text-slate-400">Deseja servir em nossa igreja? Temos vagas abertas!</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300 mb-6">
                  "Cada um exerça o dom que recebeu para servir os outros, administrando fielmente a graça de Deus." (1 Pedro 4:10)
                </p>
                <Button className="bg-white text-slate-900 hover:bg-slate-100">Quero me voluntariar</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}