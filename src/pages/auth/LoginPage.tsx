import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, User, Info, Lock } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useDataStore } from '@/lib/data-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});
export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(s => s.login);
  const members = useDataStore(s => s.members);
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@churchflow.com',
      password: 'admin123',
    },
  });
  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    // 1. Search in local member store for system access credentials
    const matchingMember = members.find(m => 
      m.hasAccess && 
      m.accessEmail?.toLowerCase() === values.email.toLowerCase() && 
      m.accessPassword === values.password
    );
    if (matchingMember) {
      login({
        id: `user_${matchingMember.id}`,
        name: matchingMember.fullName,
        email: matchingMember.accessEmail!,
        role: matchingMember.accessRole!,
        memberId: matchingMember.id
      });
      setLoading(false);
      toast.success(`Bem-vindo, ${matchingMember.fullName}!`);
      if (['admin', 'leader'].includes(matchingMember.accessRole!)) {
        navigate('/admin');
      } else {
        navigate('/member/dashboard');
      }
      return;
    }
    // 2. Fallback for hardcoded admin safety (if seed was cleared or something went wrong)
    if (values.email === 'admin@churchflow.com' && values.password === 'admin123') {
      login({
        id: 'safety_admin',
        name: 'Administrador do Sistema',
        email: 'admin@churchflow.com',
        role: 'admin',
        memberId: 'm1'
      });
      setLoading(false);
      toast.success('Acesso concedido via credenciais de segurança.');
      navigate('/admin');
      return;
    }
    setLoading(false);
    toast.error('E-mail ou senha incorretos. Verifique suas credenciais.');
  };
  const handleMemberDemo = () => {
    form.setValue('email', 'maria@example.com');
    form.setValue('password', 'maria123');
    toast.info("Credenciais de demonstração preenchidas. Clique em entrar.");
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
            Acesse o sistema com suas credenciais locais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>E-mail</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="text-muted-foreground hover:text-primary">
                            <Info className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p className="text-xs">E-mail configurado no cadastro de membro.</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl><Input placeholder="exemplo@igreja.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Senha</FormLabel>
                    <button type="button" className="text-xs text-primary hover:underline">Recuperar acesso</button>
                  </div>
                  <FormControl><Input type="password" placeholder="********" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full btn-gradient h-11" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Lock className="mr-2 h-4 w-4" /> Entrar no Sistema</>}
              </Button>
            </form>
          </Form>
          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Demo</span></div>
          </div>
          <Button variant="outline" className="w-full h-11 border-dashed" onClick={handleMemberDemo} disabled={loading}>
            <User className="mr-2 h-4 w-4" /> Preencher Líder Demo (Maria)
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Esqueceu sua senha? <br/>
            <button className="text-primary font-medium hover:underline">Fale com a secretaria da igreja</button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}