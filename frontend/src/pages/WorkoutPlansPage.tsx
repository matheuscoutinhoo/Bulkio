import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutLogApi } from '@/services/workoutLogService';
import { workoutPlanApi, type WorkoutPlan } from '@/services/workoutPlanService';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Copy, Trash2, ChevronDown, ChevronUp, Pencil, HelpCircle, ClipboardList, Search, Play, Layers } from 'lucide-react';
import { ExerciseDetailModal } from '@/components/exercises/ExerciseDetailModal';
import { ExerciseProgressionDialog } from '@/components/exercises/ExerciseProgressionDialog';
import { CreateWorkoutPlanDialog } from '@/components/workoutPlans/CreateWorkoutPlanDialog';
import { muscleGroupLabels } from '@/lib/exerciseLabels';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/feedback';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from '@/stores/toastStore';
import { formatRestDuration } from '@/lib/workoutForm';
import { SectionOverview, OverviewMetric } from '@/components/ui/section-overview';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { normalizeSearch } from '@/lib/search';

export default function WorkoutPlansPage() {
   const navigate = useNavigate();
   const [plans, setPlans] = useState<WorkoutPlan[]>([]);
   const [loading, setLoading] = useState(true);
   const [loadError, setLoadError] = useState(false);
   const [showCreate, setShowCreate] = useState(false);
   const [editPlan, setEditPlan] = useState<WorkoutPlan | null>(null);
   const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
   const [selectedExercise, setSelectedExercise] = useState<{ id: string; name: string; muscleGroup: string; type?: string; equipment?: string } | null>(null);
   const [progressionExercise, setProgressionExercise] = useState<{ id: string; name: string; muscleGroup: string } | null>(null);
   const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
   const [deleting, setDeleting] = useState(false);
   const [search, setSearch] = useState('');
   const [startingPlan, setStartingPlan] = useState<string | null>(null);

   const filteredPlans = plans.filter(plan => normalizeSearch([plan.name, plan.description, ...plan.exercises.map(item => `${item.exercise.name} ${muscleGroupLabels[item.exercise.muscleGroup] || ''}`)].join(' ')).includes(normalizeSearch(search)));
   const handleStart = async (plan: WorkoutPlan) => {
      if (startingPlan) return;
      setStartingPlan(plan.id);
      try {
         const now = new Date().toISOString();
         const response = await workoutLogApi.create({ workoutPlanId: plan.id, date: now, startTime: now, isComplete: false, exercises: [] });
         toast.success('Treino iniciado', 'Registre suas séries conforme avança.');
         navigate(`/logs?workout=${response.data.data.id}`);
      } catch {
         toast.error('Não foi possível iniciar o treino');
      } finally { setStartingPlan(null); }
   };

   const fetchPlans = useCallback(async () => {
      setLoading(true);
      setLoadError(false);
      try {
         const res = await workoutPlanApi.getAll({ limit: 50 });
         setPlans(res.data.data);
      } catch (err) {
         console.error(err);
         setLoadError(true);
         toast.error('Não foi possível carregar as fichas', 'Verifique sua conexão e tente novamente.');
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => { fetchPlans(); }, [fetchPlans]);

   const handleDuplicate = async (id: string) => {
      try {
         await workoutPlanApi.duplicate(id);
         await fetchPlans();
         toast.success('Ficha duplicada', 'Uma cópia foi adicionada à sua lista.');
      } catch (err) {
         console.error(err);
         toast.error('Não foi possível duplicar a ficha');
      }
   };

   const handleDelete = async () => {
      if (!deleteTarget) return;
      setDeleting(true);
      try {
         await workoutPlanApi.delete(deleteTarget);
         setDeleteTarget(null);
         await fetchPlans();
         toast.success('Ficha excluída');
      } catch (err) {
         console.error(err);
         toast.error('Não foi possível excluir a ficha');
      } finally {
         setDeleting(false);
      }
   };

   return (
      <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
         <PageHeader
            title="Fichas de treino"
            description={loading ? 'Fichas e exercícios cadastrados.' : `${plans.length} ${plans.length === 1 ? 'ficha cadastrada' : 'fichas cadastradas'}.`}
            actions={<>
               <Button onClick={() => setShowCreate(true)}>
                  <Plus className="h-4 w-4" /> Nova ficha
               </Button>
            </>}
         />

         {!loading && !loadError && plans.length > 0 && <>
            <SectionOverview icon={ClipboardList} eyebrow="Rotina de treino" title="Fichas cadastradas" description="Exercícios, séries e intervalos de cada ficha. O botão Treinar agora inicia uma sessão no histórico.">
               <OverviewMetric value={plans.length} label="fichas disponíveis" />
               <OverviewMetric value={new Set(plans.flatMap(plan => plan.exercises.map(item => item.exerciseId))).size} label="exercícios na rotina" />
            </SectionOverview>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
               <div className="relative w-full sm:max-w-sm"><Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" /><Input aria-label="Buscar fichas" className="pl-10" placeholder="Buscar ficha, exercício ou músculo" value={search} onChange={event => setSearch(event.target.value)} /></div>
               <p className="text-xs text-muted-foreground">{filteredPlans.length} de {plans.length} fichas</p>
            </div>
         </>}

         {loading ? (
            <LoadingState label="Carregando suas fichas" />
         ) : loadError ? (
            <ErrorState message="Não foi possível carregar suas fichas." onRetry={fetchPlans} />
         ) : plans.length === 0 ? (
            <Card>
               <CardContent className="p-0">
                  <EmptyState icon={ClipboardList} title="Crie sua primeira ficha" description="Monte uma sequência de exercícios para organizar sua rotina." actionLabel="Criar ficha" onAction={() => setShowCreate(true)} />
               </CardContent>
            </Card>
         ) : (
            <div className="space-y-4">
               {filteredPlans.length === 0 && <EmptyState compact icon={Search} title="Nenhuma ficha encontrada" description="Tente outro nome, exercício ou grupo muscular." actionLabel="Limpar busca" onAction={() => setSearch('')} />}
               {filteredPlans.map((plan, planIndex) => (
                  <Card key={plan.id} className="overflow-hidden border-t-2 border-t-primary/45 transition-shadow hover:shadow-md hover:shadow-primary/5">
                     <CardHeader>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                           <button
                              type="button"
                              className="flex min-h-11 w-full min-w-0 flex-1 items-center gap-3 rounded-lg text-left"
                              onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                              aria-expanded={expandedPlan === plan.id}
                              aria-controls={`plan-${plan.id}`}
                           >
                              <span className="brand-mark mr-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-primary">{String(planIndex + 1).padStart(2, '0')}</span>
                              <div className="min-w-0 flex-1">
                                 <CardTitle className="break-words text-base sm:text-lg">{plan.name}</CardTitle>
                                 <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs font-normal text-muted-foreground"><span>{plan.exercises.length} exercícios</span>{plan._count && <span>{plan._count.workoutLogs} treinos registrados</span>}</p>
                              </div>
                              {expandedPlan === plan.id ? (
                                 <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                              ) : (
                                 <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                              )}
                           </button>
                           <div className="flex shrink-0 self-end gap-1 sm:self-auto">
                              <Button variant="ghost" size="icon" onClick={() => setEditPlan(plan)} title="Editar" aria-label={`Editar ${plan.name}`} className="hover:text-primary">
                                 <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDuplicate(plan.id)} title="Duplicar" aria-label={`Duplicar ${plan.name}`} className="hover:text-primary">
                                 <Copy className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(plan.id)} title="Excluir" aria-label={`Excluir ${plan.name}`} className="hover:text-destructive">
                                 <Trash2 className="h-4 w-4" />
                              </Button>
                           </div>
                        </div>
                        {plan.description && (
                           <p className="text-sm text-muted-foreground">{plan.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 pt-1">
                           {[...new Set(plan.exercises.map(item => item.exercise.muscleGroup))].map(group => <Badge key={group} variant="outline" className="border-primary/15 bg-primary/5 text-xs">{muscleGroupLabels[group] || group}</Badge>)}
                        </div>
                     </CardHeader>
                     {expandedPlan === plan.id && (
                        <CardContent id={`plan-${plan.id}`} className="animate-fade-in-down border-t border-border/60 pt-4 sm:pt-5">
                           <Table aria-label={`Exercícios de ${plan.name}`}>
                              <TableHeader><TableRow><TableHead className="w-8">#</TableHead><TableHead>Exercício / planejamento</TableHead><TableHead className="w-12"><span className="sr-only">Detalhes</span></TableHead></TableRow></TableHeader>
                              <TableBody>
                              {plan.exercises.map((pe, i) => (
                                 <TableRow key={pe.id}>
                                    <TableCell className="text-muted-foreground tabular-nums">{i + 1}</TableCell>
                                    <TableCell>
                                       <button type="button" className="min-h-11 w-full text-left font-medium break-words hover:text-primary" onClick={() => setProgressionExercise(pe.exercise)}>{pe.exercise.name}</button>
                                       <Badge variant="outline" className="mb-2 text-xs">{muscleGroupLabels[pe.exercise.muscleGroup]}</Badge>
                                       <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                          <span>{pe.sets} séries × {pe.reps} reps</span>
                                          {pe.weight != null && <span>• {pe.weight}kg</span>}
                                          <span>• {formatRestDuration(pe.restSeconds)} de descanso</span>
                                       </div>
                                    </TableCell>
                                    <TableCell><Button
                                       variant="ghost"
                                       size="icon"
                                       className="shrink-0 hover:text-primary"
                                       onClick={() => setSelectedExercise(pe.exercise)}
                                       aria-label={`Ver detalhes de ${pe.exercise.name}`}
                                    >
                                       <HelpCircle className="h-4 w-4" />
                                    </Button></TableCell>
                                 </TableRow>
                              ))}
                              {plan.exercises.length === 0 && (
                                 <TableRow><TableCell colSpan={3} className="text-muted-foreground text-center py-4">
                                    Nenhum exercício adicionado
                                 </TableCell></TableRow>
                              )}
                              </TableBody>
                           </Table>
                        </CardContent>
                     )}
                     <CardFooter className="flex-col items-stretch gap-4 border-t border-border/50 bg-secondary/15 pt-4 sm:flex-row sm:items-center sm:justify-between sm:pt-4">
                        <p className="flex items-center gap-2 text-xs text-muted-foreground"><Layers className="h-4 w-4" />{plan.exercises.reduce((sum, item) => sum + item.sets, 0)} séries planejadas <span aria-hidden="true">·</span> {plan.exercises.length} exercícios</p>
                        <Button onClick={() => handleStart(plan)} disabled={startingPlan !== null || plan.exercises.length === 0}><Play className="h-4 w-4" />{startingPlan === plan.id ? 'Iniciando…' : 'Treinar agora'}</Button>
                     </CardFooter>
                  </Card>
               ))}
            </div>
         )}

         <CreateWorkoutPlanDialog
            open={showCreate || !!editPlan}
            onClose={() => { setShowCreate(false); setEditPlan(null); }}
            onCreated={fetchPlans}
            editPlan={editPlan}
         />

         <ExerciseDetailModal
            exercise={selectedExercise}
            open={!!selectedExercise}
            onClose={() => setSelectedExercise(null)}
         />

         <ExerciseProgressionDialog
            exercise={progressionExercise}
            open={!!progressionExercise}
            onClose={() => setProgressionExercise(null)}
         />

         <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Excluir ficha?" description="A ficha será removida permanentemente. Os treinos já registrados continuarão no seu histórico." />
      </div>
   );
}
