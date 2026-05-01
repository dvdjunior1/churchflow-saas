import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, User, Info } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(s => s.login);
  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login({
        id: 'admin_user',
        name: 'Pastor João Silva',
        email: 'admin@churchflow.com',
        role: 'admin',
        memberId: 'm1' // Joâo Silva is m1 in seeds
      });
      setLoading(false);
      toast.success('Bem-vindo ao ChurchFlow!');
      navigate('/admin');
    }, 1200);
  };
  const handleMemberDemo = () => {
    setLoading(true);
    setTimeout(() => {
      login({
        id: 'user_m2',
        name: 'Maria Oliveira',
        email: 'maria@example.com',
        role: 'member',
        memberId: 'm2' // Maria is m2 in seeds
      });
      setLoading(false);
      toast.success('Acesso ao Portal do Membro');
      navigate('/member/dashboard');
    }, 800);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="absolute inset-0 bg-gradient-rainbow opacity-5 pointer-events-none" />
      <Card className="w-full max-w-md shadow-glass border-white/20 relative z-10 animate-scale-in">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-primary floating">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Portal ChurchFlow</CardTitle>
          <CardDescription>
            Acesse sua conta administrativa ou portal do membro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="email">E-mail</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-primary">
                        <Info className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Use admin@churchflow.com para testar o painel ADM.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@igreja.com"
                required
                defaultValue="admin@churchflow.com"
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <button type="button" className="text-xs text-primary hover:underline">Esqueceu a senha?</button>
              </div>
              <Input
                id="password"
                type="password"
                required
                defaultValue="admin123"
                className="bg-secondary"
              />
            </div>
            <Button type="submit" className="w-full btn-gradient h-11" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar no Sistema'}
            </Button>
          </form>
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Ou acesso rápido</span></div>
          </div>
          <Button variant="outline" className="w-full h-11 border-dashed" onClick={handleMemberDemo} disabled={loading}>
            <User className="mr-2 h-4 w-4" /> Entrar como Membro (Demo)
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Ainda não tem o ChurchFlow? <br/>
            <button className="text-primary font-medium hover:underline">Falar com um consultor</button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}