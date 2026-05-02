import React from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/auth-store';
import { useDataStore } from '@/lib/data-store';
import { Calendar, Heart, Wallet, Clock, MapPin, CheckCircle2, Star, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
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
  ).slice(0, 4);
  const totalDonated = myContributions.reduce((acc, curr) => acc + curr.amount, 0);
  const monthlyGoal = 500; // Mock goal
  const goalProgress = Math.min(Math.round((totalDonated / monthlyGoal) * 100), 100);
  const handleJoinMinistry = (minId: string) => {
    if (!memberId) return;
    try {
      linkMember({ memberId, ministryId: minId, role: 'member' });
      toast.success("Solicitação enviada! Aguarde o contato do líder.");
    } catch (e) {
      toast.error("Ocorreu um erro.");
    }
  };
  if (!user) return null;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center gap-6 mb-12 bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="relative">
            <Avatar className="h-28 w-28 border-4 border-white shadow-xl">
              <AvatarImage src={memberProfile?.photoUrl} />
              <AvatarFallback className="text-2xl bg-primary text-white">{user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 p-1.5 rounded-full shadow-lg border-2 border-white">
              <Star className="h-4 w-4 text-white fill-white" />
            </div>
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Olá, {user.name?.split(' ')[0]}!</h1>
            <p className="text-slate-500 font-medium mt-1">Que bom ter você servindo e crescendo conosco hoje.</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
              <Badge variant="secondary" className="bg-white border text-primary uppercase text-[10px] tracking-widest font-bold">
                {memberProfile?.role || 'Membro'}
              </Badge>
              <Badge className="bg-emerald-500 text-white border-none uppercase text-[10px] tracking-widest font-bold">
                Membro Ativo
              </Badge>
            </div>
          </div>
        </motion.div>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1 space-y-6">
            <Card className="shadow-soft border-slate-200 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Target className="h-12 w-12" /></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                  <Wallet className="h-4 w-4" /> Minha Fidelidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-black">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDonated)}</div>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1">Contribuição total acumulada</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                    <span>Engajamento Mensal</span>
                    <span>{goalProgress}%</span>
                  </div>
                  <Progress value={goalProgress} className="h-2 bg-slate-100" />
                </div>
                <Button variant="outline" className="w-full text-xs font-bold" size="sm">Ver Comprovantes</Button>
              </CardContent>
            </Card>
            <Card className="shadow-soft border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                  <Heart className="h-4 w-4" /> Onde eu sirvo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {myMinistries.length === 0 ? (
                  <div className="text-center py-4 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-muted-foreground italic">Você ainda não está em uma equipe.</p>
                  </div>
                ) : (
                  myMinistries.map(min => (
                    <div key={min.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-sm font-bold text-slate-700">{min.name}</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2 space-y-10">
            <div>
              <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" /> Oportunidades de Serviço
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {otherMinistries.map(min => (
                  <Card key={min.id} className="border-slate-200 hover:shadow-soft transition-all flex flex-col group">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-bold group-hover:text-primary transition-colors">{min.name}</CardTitle>
                      <CardDescription className="text-xs line-clamp-2">{min.description}</CardDescription>
                    </CardHeader>
                    <div className="flex-1" />
                    <CardFooter className="pt-2">
                      <Button variant="ghost" size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest bg-slate-50" onClick={() => handleJoinMinistry(min.id)}>
                        Quero fazer parte
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" /> Agenda da Família
                </h2>
                <Button variant="link" className="text-blue-600 text-xs font-bold">Ver Calendário Completo</Button>
              </div>
              <div className="space-y-4">
                {events.slice(0, 2).map(event => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow border-slate-200">
                    <CardContent className="p-4 flex gap-5">
                      <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-blue-50 flex flex-col items-center justify-center text-blue-600 border border-blue-100">
                        <span className="text-[10px] font-black uppercase">{new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(event.date)).replace('.','')}</span>
                        <span className="text-2xl font-black leading-none">{new Date(event.date).getDate()}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-black text-slate-800">{event.title}</h3>
                          <Badge variant="outline" className="text-[8px] h-4 uppercase">{event.category}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-[11px] font-bold text-slate-400">
                          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {event.time}</span>
                          <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {event.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}