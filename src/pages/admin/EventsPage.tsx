import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Plus, MapPin, Clock, Search, Filter, Loader2, MoreVertical, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api-client';
import { useDataStore } from '@/lib/data-store';
import type { ChurchEvent } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
const eventSchema = z.object({
  title: z.string().min(3, "Título muito curto"),
  description: z.string().min(5, "Descrição obrigatória"),
  date: z.string().min(10, "Data obrigatória"),
  time: z.string().min(5, "Hora obrigatória"),
  location: z.string().min(3, "Local obrigatório"),
  category: z.enum(['culto', 'ensaio', 'reuniao', 'social']),
});
export function EventsPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const events = useDataStore(s => s.events);
  const setEvents = useDataStore(s => s.setEvents);
  const addEventAction = useDataStore(s => s.addEvent);
  const deleteEventAction = useDataStore(s => s.deleteEvent);
  const { isLoading } = useQuery<{ items: ChurchEvent[] }>({
    queryKey: ['events'],
    queryFn: async () => {
      const data = await api<{ items: ChurchEvent[] }>('/api/events');
      setEvents(data.items);
      return data;
    },
  });
  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '19:00',
      location: 'Santuário',
      category: 'culto',
    },
  });
  const addMutation = useMutation({
    mutationFn: (data: z.infer<typeof eventSchema>) => 
      api<ChurchEvent>('/api/events', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (newEvent) => {
      addEventAction(newEvent);
      setIsAddOpen(false);
      form.reset();
      toast.success('Evento agendado!');
    }
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/events/${id}`, { method: 'DELETE' }),
    onSuccess: (_, id) => {
      deleteEventAction(id);
      toast.success('Evento removido');
    }
  });
  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.location.toLowerCase().includes(search.toLowerCase())
  );
  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'culto': return <Badge className="bg-blue-500 hover:bg-blue-600">Culto</Badge>;
      case 'ensaio': return <Badge className="bg-amber-500 hover:bg-amber-600">Ensaio</Badge>;
      case 'reuniao': return <Badge className="bg-slate-500 hover:bg-slate-600">Reunião</Badge>;
      case 'social': return <Badge className="bg-green-500 hover:bg-green-600">Social</Badge>;
      default: return <Badge>{cat}</Badge>;
    }
  };
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda & Eventos</h1>
          <p className="text-muted-foreground">Gerencie o calendário de atividades da igreja.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient">
              <Plus className="mr-2 h-4 w-4" /> Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Evento</DialogTitle>
              <DialogDescription>Preencha as informações da atividade.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((v) => addMutation.mutate(v))} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl><Input placeholder="Culto de Jovens" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="time" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora</FormLabel>
                      <FormControl><Input type="time" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local</FormLabel>
                    <FormControl><Input placeholder="Templo Principal" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="culto">Culto</SelectItem>
                        <SelectItem value="ensaio">Ensaio</SelectItem>
                        <SelectItem value="reuniao">Reunião</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl><Textarea placeholder="Detalhes do evento..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={addMutation.isPending}>
                  {addMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar Evento
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar eventos..." 
            className="pl-10" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && events.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground">Carregando agenda...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground">Nenhum evento encontrado.</div>
        ) : filteredEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-soft transition-all group overflow-hidden border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                {getCategoryBadge(event.category)}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteMutation.mutate(event.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">{event.title}</CardTitle>
              <CardDescription className="line-clamp-2">{event.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2 text-primary" />
                {new Date(event.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2 text-primary" />
                {event.time}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                {event.location}
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 border-t mt-auto py-3">
              <Button variant="ghost" className="w-full text-xs font-medium uppercase tracking-wider">
                Ver detalhes
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}