import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Bell, Loader2, Camera, Save } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useDataStore } from '@/lib/data-store';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
const profileSchema = z.object({
  fullName: z.string().min(3, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  birthDate: z.string().min(10, "Data inválida"),
  photoUrl: z.string().url("URL inválida").or(z.literal("")),
});
export default function ProfilePage() {
  const user = useAuthStore(s => s.user);
  const members = useDataStore(s => s.members);
  const updateMember = useDataStore(s => s.updateMember);
  const [isSaving, setIsSaving] = useState(false);
  const memberProfile = members.find(m => m.id === user?.memberId);
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: memberProfile?.phone || '',
      birthDate: memberProfile?.birthDate || '',
      photoUrl: memberProfile?.photoUrl || '',
    },
  });
  useEffect(() => {
    if (memberProfile) {
      form.reset({
        fullName: memberProfile.fullName,
        email: memberProfile.email,
        phone: memberProfile.phone,
        birthDate: memberProfile.birthDate,
        photoUrl: memberProfile.photoUrl,
      });
    }
  }, [memberProfile, form]);
  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user?.memberId) {
      toast.error("Perfil de membro não vinculado.");
      return;
    }
    setIsSaving(true);
    try {
      const updated = await api(`/api/members/self/${user.memberId}`, {
        method: 'PUT',
        body: JSON.stringify(values),
      });
      updateMember(user.memberId, updated as any);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      toast.error("Falha ao atualizar perfil.");
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
        <div className="relative group">
          <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
            <AvatarImage src={form.watch('photoUrl')} />
            <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
              {user?.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform">
            <Camera className="h-5 w-5" />
          </button>
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tight">{user?.name}</h1>
          <p className="text-muted-foreground capitalize">{user?.role} • {user?.email}</p>
        </div>
      </div>
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 w-full max-w-md">
          <TabsTrigger value="personal" className="flex-1 gap-2"><User className="h-4 w-4" /> Dados</TabsTrigger>
          <TabsTrigger value="security" className="flex-1 gap-2"><Shield className="h-4 w-4" /> Segurança</TabsTrigger>
          <TabsTrigger value="prefs" className="flex-1 gap-2"><Bell className="h-4 w-4" /> Avisos</TabsTrigger>
        </TabsList>
        <AnimatePresence mode="wait">
          <TabsContent value="personal">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                  <Card className="border-slate-200 shadow-soft">
                    <CardHeader>
                      <CardTitle>Informações Pessoais</CardTitle>
                      <CardDescription>Mantenha seus dados atualizados para contato da igreja.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <FormField control={form.control} name="fullName" render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="birthDate" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="photoUrl" render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL da Foto de Perfil</FormLabel>
                          <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </CardContent>
                    <CardFooter className="border-t pt-6">
                      <Button type="submit" className="ml-auto btn-gradient" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Salvar Alterações
                      </Button>
                    </CardFooter>
                  </Card>
                </form>
              </Form>
            </motion.div>
          </TabsContent>
          <TabsContent value="security">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card className="border-slate-200 shadow-soft">
                <CardHeader>
                  <CardTitle>Alterar Senha</CardTitle>
                  <CardDescription>Recomendamos trocar sua senha a cada 90 dias.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Senha Atual</Label>
                    <Input type="password" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nova Senha</Label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirmar Nova Senha</Label>
                      <Input type="password" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                  <Button variant="outline" className="ml-auto" onClick={() => toast.info("Funcionalidade demo")}>Atualizar Senha</Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}