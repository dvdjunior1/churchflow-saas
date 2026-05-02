import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Users, 
  Heart, 
  ArrowRight, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  PrayingHand, 
  MapPin, 
  Clock, 
  Cake, 
  HandHeart,
  Church
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useDataStore } from '@/lib/data-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
const prayerSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  request: z.string().min(10, "Por favor, detalhe seu pedido de oração"),
});
export function HomePage() {
  const ministries = useDataStore(s => s.ministries);
  const events = useDataStore(s => s.events);
  const activities = useDataStore(s => s.activities);
  const members = useDataStore(s => s.members);
  const prayerForm = useForm<z.infer<typeof prayerSchema>>({
    resolver: zodResolver(prayerSchema),
    defaultValues: { name: '', request: '' },
  });
  const currentMonth = new Date().getMonth();
  const anniversaries = useMemo(() => {
    return members.filter(m => {
      if (!m.birthDate || !m.showBirthdayPublic) return false;
      const bDate = new Date(m.birthDate);
      return bDate.getMonth() === currentMonth;
    }).sort((a, b) => new Date(a.birthDate).getDate() - new Date(b.birthDate).getDate());
  }, [members, currentMonth]);
  const agenda = useMemo(() => {
    const now = new Date();
    const combined = [
      ...events.map(e => ({ ...e, type: 'event' as const })),
      ...activities.filter(a => a.visibility === 'public').map(a => ({ ...a, type: 'activity' as const, date: a.startDate }))
    ];
    return combined
      .filter(item => new Date(item.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 6);
  }, [events, activities]);
  const handlePrayerSubmit = (values: z.infer<typeof prayerSchema>) => {
    console.log("Prayer Request Submitted:", values);
    toast.success("Seu pedido de oração foi enviado. Estaremos intercedendo por você!");
    prayerForm.reset();
  };
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-church-green/10">
      {/* Navigation */}
      <nav className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-church-green flex items-center justify-center">
              <Church className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-church-green dark:text-church-gold">
              IASD Curuçá
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:block">
              <Button variant="ghost">Área Administrativa</Button>
            </Link>
            <Button className="btn-gradient bg-church-green hover:bg-church-green/90" onClick={() => toast.info("Informações bancárias: Banco 123, Ag 0001, CC 12345-6")}>
              Doe agora
            </Button>
            <ThemeToggle className="static" />
          </div>
        </div>
      </nav>
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-900">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
             <img 
              src="https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80&w=2071" 
              alt="Background" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-church opacity-60 mix-blend-multiply pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-display mb-6 text-white"
            >
              Comunidade Adventista <br />
              <span className="text-church-gold">do Curuçá</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-100 text-lg max-w-2xl mx-auto mb-10"
            >
              Um lugar de esperança, comunhão e serviço. Junte-se a nós para adorar e crescer em família.
            </motion.p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-church-gold text-slate-900 hover:bg-church-gold/90 border-none">
                  Visitar Administrativo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg text-white border-white hover:bg-white/10">
                Ver Programação
              </Button>
            </div>
          </div>
        </section>
        {/* Sobre Section */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-church-green/10 text-church-green hover:bg-church-green/20 border-none px-4 py-1">Nossa História</Badge>
              <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Uma comunidade firmada na Palavra.</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                A Comunidade Adventista do Curuçá é uma família espiritual dedicada a compartilhar a mensagem bíblica de amor e restauração. 
                Acreditamos na importância da comunhão diária, do estudo da Bíblia e do serviço desinteressado ao próximo.
              </p>
              <ul className="space-y-4">
                {[
                  "Escola Sabatina aos Sábados (09:00)",
                  "Culto Divino aos Sábados (10:30)",
                  "Culto de Oração às Quartas (20:00)"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-church-green" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-video lg:aspect-square">
              <img 
                src="https://images.unsplash.com/photo-1544427928-c49cd049ccfb?auto=format&fit=crop&q=80&w=1974" 
                alt="Comunidade" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>
        {/* Ministries Dynamic Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Nossos Ministérios</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Existem diversas formas de servir e se envolver. Encontre o seu lugar!</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ministries.map((min) => (
                <Card key={min.id} className="rounded-3xl border-none shadow-soft hover:shadow-md transition-all overflow-hidden group">
                  <CardHeader className="bg-church-green/5 group-hover:bg-church-green/10 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-church-green flex items-center justify-center mb-4">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle>{min.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{min.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="p-6">
                    <Button variant="outline" className="w-full group-hover:bg-church-green group-hover:text-white transition-all border-church-green text-church-green">
                      Saiba mais & Participar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
        {/* Agenda Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-2">Próximos Encontros</h2>
                <p className="text-muted-foreground">Fique por dentro da nossa agenda comunitária.</p>
              </div>
              <Button variant="link" className="text-church-green font-bold">Ver Calendário Completo</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {agenda.length === 0 ? (
                <div className="col-span-full py-12 text-center text-muted-foreground italic bg-slate-50 rounded-3xl border-2 border-dashed">
                  Nenhum evento público agendado no momento.
                </div>
              ) : agenda.map((item: any) => (
                <div key={item.id} className="flex gap-4 p-4 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-church-green/10 flex flex-col items-center justify-center text-church-green">
                    <span className="text-[10px] font-bold uppercase">{new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(item.date)).replace('.', '')}</span>
                    <span className="text-2xl font-black">{new Date(item.date).getDate()}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time || 'Horário a definir'}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.location || 'Local a definir'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Birthdays Section */}
        {anniversaries.length > 0 && (
          <section className="py-20 bg-church-green/5 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 mb-10">
                <Cake className="w-8 h-8 text-church-gold" />
                <h2 className="text-3xl font-bold">Aniversariantes do Mês</h2>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
                {anniversaries.map((member) => (
                  <Card key={member.id} className="min-w-[240px] snap-center rounded-3xl border-none shadow-soft text-center group">
                    <CardContent className="pt-8 pb-6">
                      <div className="relative mx-auto w-20 h-20 mb-4">
                        <img 
                          src={member.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} 
                          className="w-full h-full rounded-2xl object-cover border-2 border-church-gold group-hover:scale-110 transition-transform" 
                          alt={member.fullName} 
                        />
                        <div className="absolute -bottom-2 -right-2 bg-church-gold p-1 rounded-full shadow">
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-900">{member.fullName.split(' ')[0]}</h4>
                      <p className="text-xs text-church-green font-bold uppercase tracking-widest mt-1">Dia {new Date(member.birthDate).getDate()}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
        {/* Prayer Request & Contact */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16">
              <div className="space-y-8">
                <div className="p-8 rounded-4xl bg-church-green text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10"><HandHeart className="w-24 h-24" /></div>
                  <h3 className="text-2xl font-bold mb-4">Pedido de Oração</h3>
                  <p className="text-white/80 mb-6">Acreditamos no poder da oração intercessória. Compartilhe seu pedido e nossa equipe orará por você.</p>
                  <Form {...prayerForm}>
                    <form onSubmit={prayerForm.handleSubmit(handlePrayerSubmit)} className="space-y-4">
                      <FormField control={prayerForm.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormControl><Input placeholder="Seu nome" className="bg-white/10 border-white/20 text-white placeholder:text-white/50" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={prayerForm.control} name="request" render={({ field }) => (
                        <FormItem>
                          <FormControl><Textarea placeholder="Seu pedido..." className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-24" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <Button type="submit" className="w-full bg-white text-church-green hover:bg-white/90 font-bold">Enviar Pedido</Button>
                    </form>
                  </Form>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-6">
                <h2 className="text-3xl font-bold">Visite-nos</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-church-green" />
                    </div>
                    <div>
                      <h4 className="font-bold">Endereço</h4>
                      <p className="text-muted-foreground italic">Curuçá, Santo André - SP, Brasil</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-church-green" />
                    </div>
                    <div>
                      <h4 className="font-bold">Cultos Principais</h4>
                      <p className="text-muted-foreground italic">Sábados às 09h e 10h30. Domingos às 19h30.</p>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t">
                  <p className="text-sm font-bold text-church-green mb-4">SIGA-NOS NAS REDES</p>
                  <div className="flex gap-4">
                    {['YouTube', 'Instagram', 'Facebook'].map(social => (
                      <Button key={social} variant="outline" className="rounded-full px-6 border-slate-200">{social}</Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Church className="w-6 h-6 text-church-gold" />
            <span className="font-bold text-xl tracking-tighter">Comunidade Curuçá</span>
          </div>
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} IASD Curuçá. Construído para a Glória de Deus.
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link to="/login" className="hover:text-church-gold transition-colors">Acesso Restrito</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}