import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Users, Heart, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
export function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      <nav className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">ChurchFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link to="/login">
              <Button className="btn-gradient">Começar Agora</Button>
            </Link>
            <ThemeToggle className="static" />
          </div>
        </div>
      </nav>
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-rainbow opacity-5 dark:opacity-10 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-display mb-6 animate-fade-in">
              Gestão moderna para uma <br />
              <span className="text-gradient">Igreja conectada.</span>
            </h1>
            <p className="text-body max-w-2xl mx-auto mb-10 animate-slide-up">
              Simplifique a administração da sua congregação. De membros a finanças, 
              o ChurchFlow oferece todas as ferramentas que você precisa em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up delay-100">
              <Link to="/login">
                <Button size="lg" className="btn-gradient w-full sm:w-auto h-14 px-8 text-lg">
                  Criar conta gratuita
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg">
                Agendar demonstração
              </Button>
            </div>
          </div>
        </section>
        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Users,
                  title: "Gestão de Membros",
                  description: "Cadastros completos, marcos eclesiásticos e histórico de participação simplificados."
                },
                {
                  icon: Heart,
                  title: "Ministérios & Grupos",
                  description: "Organize equipes, escalas e acompanhe o engajamento dos voluntários de forma visual."
                },
                {
                  icon: Shield,
                  title: "Segurança de Dados",
                  description: "Dados protegidos com criptografia de ponta e backups automáticos diários."
                }
              ].map((f, i) => (
                <div key={i} className="p-8 rounded-3xl bg-card border hover:shadow-soft transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-muted-foreground">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Social Proof */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-12">Por que líderes escolhem o ChurchFlow?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {['Fácil de usar', 'Suporte prioritário', 'Multi-plataforma', 'Relatórios em 1-clique'].map((item) => (
                <div key={item} className="flex items-center justify-center gap-2 p-4 rounded-full bg-secondary/50 border">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-bold">ChurchFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ChurchFlow SaaS. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
            <a href="#" className="hover:text-foreground transition-colors">Termos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}