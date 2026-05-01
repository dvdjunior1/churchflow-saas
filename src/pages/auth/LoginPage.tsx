import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(s => s.login);
  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock authentication delay
    setTimeout(() => {
      login({
        id: '1',
        name: 'Pastor João Silva',
        email: 'admin@churchflow.com',
        role: 'admin'
      });
      setLoading(false);
      toast.success('Bem-vindo ao ChurchFlow!');
      navigate('/admin');
    }, 1200);
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
          <CardTitle className="text-2xl font-bold tracking-tight">Login Administrativo</CardTitle>
          <CardDescription>
            Acesse o painel de controle da sua igreja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
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