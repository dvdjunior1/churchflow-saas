import React, { useState, useMemo } from 'react';
import { ListTodo, Plus, Search, Calendar, User, Edit2, Trash2, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDataStore } from '@/lib/data-store';
import { useAuthStore } from '@/lib/auth-store';
import { getManagedMinistryIds } from '@/lib/perms';
import type { Activity, ActivityStatus, StepStatus } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
const activitySchema = z.object({
  title: z.string().min(3, "Título obrigatório"),
  description: z.string().min(5, "Descrição obrigatória"),
  ministryId: z.string().min(1, "Selecione um ministério"),
  responsibleMemberId: z.string().min(1, "Selecione um responsável"),
  visibility: z.enum(['public', 'private']),
  type: z.enum(['event', 'meeting', 'visit', 'project', 'service', 'other']),
  status: z.enum(['planned', 'in_progress', 'completed', 'canceled']),
  startDate: z.string().min(10, "Data de início obrigatória"),
  endDate: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});
const stepSchema = z.object({
  title: z.string().min(2, "Título curto"),
  description: z.string().optional(),
  responsibleMemberId: z.string().min(1, "Responsável obrigatório"),
  dueDate: z.string().min(10, "Prazo obrigatório"),
  status: z.enum(['pending', 'in_progress', 'completed']),
});
export function ActivitiesPage() {
  const activities = useDataStore(s => s.activities);
  const steps = useDataStore(s => s.activitySteps);
  const ministryMembers = useDataStore(s => s.ministryMembers);
  const addActivity = useDataStore(s => s.addActivity);
  const updateActivity = useDataStore(s => s.updateActivity);
  const deleteActivity = useDataStore(s => s.deleteActivity);
  const addStep = useDataStore(s => s.addActivityStep);
  const updateStep = useDataStore(s => s.updateActivityStep);
  const deleteStep = useDataStore(s => s.deleteActivityStep);
  const ministries = useDataStore(s => s.ministries);
  const members = useDataStore(s => s.members);
  const user = useAuthStore(s => s.user);
  const [search, setSearch] = useState('');
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isStepsDialogOpen, setIsStepsDialogOpen] = useState(false);
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const isAdmin = user?.role === 'admin' || user?.role === 'pastor';
  const managedMinIds = useMemo(() => getManagedMinistryIds(ministryMembers, user?.memberId), [ministryMembers, user]);
  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
      const hasPermission = isAdmin || managedMinIds.includes(a.ministryId);
      return matchesSearch && hasPermission;
    });
  }, [activities, search, isAdmin, managedMinIds]);
  const filteredMinistries = useMemo(() => {
    return isAdmin ? ministries : ministries.filter(m => managedMinIds.includes(m.id));
  }, [ministries, isAdmin, managedMinIds]);
  const activityForm = useForm<z.infer<typeof activitySchema>>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: '', description: '', ministryId: '', responsibleMemberId: '',
      visibility: 'public', type: 'event', status: 'planned', startDate: '',
    }
  });
  const stepForm = useForm<z.infer<typeof stepSchema>>({
    resolver: zodResolver(stepSchema),
    defaultValues: {
      title: '', responsibleMemberId: '', dueDate: '', status: 'pending'
    }
  });
  const handleCreateActivity = (values: z.infer<typeof activitySchema>) => {
    if (editingActivity) {
      updateActivity(editingActivity.id, values);
      toast.success("Atividade atualizada");
    } else {
      addActivity(values);
      toast.success("Atividade criada com sucesso");
    }
    setIsActivityDialogOpen(false);
    setEditingActivity(null);
    activityForm.reset();
  };
  const getActivityProgress = (activityId: string) => {
    const activitySteps = steps.filter(s => s.activityId === activityId);
    if (activitySteps.length === 0) return 0;
    const completed = activitySteps.filter(s => s.status === 'completed').length;
    return Math.round((completed / activitySteps.length) * 100);
  };
  const getStatusBadge = (status: ActivityStatus) => {
    const configs: Record<ActivityStatus, { label: string, color: string }> = {
      planned: { label: 'Planejada', color: 'bg-slate-100 text-slate-600' },
      in_progress: { label: 'Em Progresso', color: 'bg-blue-100 text-blue-600' },
      completed: { label: 'Concluída', color: 'bg-emerald-100 text-emerald-600' },
      canceled: { label: 'Cancelada', color: 'bg-rose-100 text-rose-600' },
    };
    const config = configs[status];
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Atividades & Projetos</h1>
            <p className="text-muted-foreground">Gestão granular de tarefas por ministério.</p>
          </div>
          <Button className="btn-gradient" onClick={() => { setEditingActivity(null); activityForm.reset(); setIsActivityDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Nova Atividade
          </Button>
        </div>
        <div className="relative mb-8 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar título..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredActivities.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-muted/20 border-2 border-dashed rounded-3xl">
              <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma atividade encontrada.</p>
            </div>
          ) : filteredActivities.map(activity => {
            const progress = getActivityProgress(activity.id);
            const ministryName = ministries.find(m => m.id === activity.ministryId)?.name;
            const responsible = members.find(m => m.id === activity.responsibleMemberId)?.fullName;
            return (
              <Card key={activity.id} className="hover:shadow-md transition-shadow group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{activity.title}</CardTitle>
                        {getStatusBadge(activity.status)}
                      </div>
                      <CardDescription className="line-clamp-1">{activity.description}</CardDescription>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                        setEditingActivity(activity);
                        activityForm.reset(activity);
                        setIsActivityDialogOpen(true);
                      }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                        if(confirm("Excluir atividade?")) deleteActivity(activity.id);
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2"><Calendar className="h-3 w-3" /> {new Date(activity.startDate).toLocaleDateString()}</div>
                    <div className="flex items-center gap-2"><User className="h-3 w-3" /> {responsible}</div>
                    <div className="flex items-center gap-2 col-span-2">
                      <Badge variant="secondary" className="text-[10px] py-0">{ministryName}</Badge>
                      <Badge variant="outline" className="text-[10px] py-0 capitalize">{activity.type}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Progresso</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                </CardContent>
                <div className="px-6 py-3 border-t bg-muted/10 flex justify-between items-center cursor-pointer" onClick={() => {
                    setActiveActivityId(activity.id);
                    setIsStepsDialogOpen(true);
                }}>
                  <Button variant="ghost" className="text-xs h-8 gap-2">
                    <ListTodo className="h-3 w-3" /> Ver Tarefas
                  </Button>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Card>
            );
          })}
        </div>
        <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingActivity ? 'Editar Atividade' : 'Nova Atividade'}</DialogTitle>
            </DialogHeader>
            <Form {...activityForm}>
              <form onSubmit={activityForm.handleSubmit(handleCreateActivity)} className="space-y-4 py-2">
                <FormField control={activityForm.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={activityForm.control} name="ministryId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ministério</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>{filteredMinistries.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={activityForm.control} name="responsibleMemberId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>{members.map(m => <SelectItem key={m.id} value={m.id}>{m.fullName}</SelectItem>)}</SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={activityForm.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="planned">Planejada</SelectItem>
                          <SelectItem value="in_progress">Em Progresso</SelectItem>
                          <SelectItem value="completed">Concluída</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={activityForm.control} name="startDate" render={({ field }) => (
                    <FormItem><FormLabel>Início</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl></FormItem>
                  )} />
                </div>
                <FormField control={activityForm.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                )} />
                <Button type="submit" className="w-full btn-gradient">Salvar Atividade</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        <Dialog open={isStepsDialogOpen} onOpenChange={setIsStepsDialogOpen}>
          <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col p-0">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle>Gerenciar Tarefas</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="p-6 pt-2 border-b bg-muted/10">
                <Button size="sm" variant="outline" onClick={() => setIsAddStepOpen(!isAddStepOpen)}>
                  {isAddStepOpen ? 'Cancelar' : 'Novo Passo'}
                </Button>
                {isAddStepOpen && (
                  <Form {...stepForm}>
                    <form onSubmit={stepForm.handleSubmit((v) => {
                      if(!activeActivityId) return;
                      addStep({ ...v, activityId: activeActivityId });
                      setIsAddStepOpen(false);
                      stepForm.reset();
                      toast.success("Passo adicionado");
                    })} className="space-y-3 bg-white p-4 rounded-lg border shadow-sm mt-4">
                      <FormField control={stepForm.control} name="title" render={({ field }) => (
                        <FormItem><FormLabel>Tarefa</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-3">
                        <FormField control={stepForm.control} name="responsibleMemberId" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Responsável</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>{members.map(m => <SelectItem key={m.id} value={m.id}>{m.fullName}</SelectItem>)}</SelectContent>
                            </Select>
                          </FormItem>
                        )} />
                        <FormField control={stepForm.control} name="dueDate" render={({ field }) => (
                          <FormItem><FormLabel>Prazo</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
                        )} />
                      </div>
                      <Button type="submit" size="sm" className="w-full">Salvar Passo</Button>
                    </form>
                  </Form>
                )}
              </div>
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-3">
                  {steps.filter(s => s.activityId === activeActivityId).map(step => (
                    <div key={step.id} className="flex items-center justify-between p-3 rounded-xl border bg-white shadow-sm">
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                          const next: StepStatus = step.status === 'completed' ? 'pending' : 'completed';
                          updateStep(step.id, { status: next });
                        }}>
                          {step.status === 'completed' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Clock className="h-5 w-5 text-slate-300" />}
                        </Button>
                        <div>
                          <p className={`text-sm font-medium ${step.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{step.title}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteStep(step.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}