import { useEffect, useState, useCallback } from 'react';
import { workoutPlanApi, type WorkoutPlan } from '@/services/workoutPlanService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Copy, Trash2, ChevronDown, ChevronUp, Pencil, HelpCircle, ClipboardList } from 'lucide-react';
import { ExerciseDetailModal } from '@/components/exercises/ExerciseDetailModal';
import { ExerciseProgressionDialog } from '@/components/exercises/ExerciseProgressionDialog';
import { ScrollText } from '@/components/ui/scroll-text';
import { CreateWorkoutPlanDialog } from '@/components/workoutPlans/CreateWorkoutPlanDialog';
import { muscleGroupLabels } from '@/lib/exerciseLabels';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/feedback';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from '@/stores/toastStore';

export default function WorkoutPlansPage() {
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
            description={loading ? 'Organize sua rotina por objetivo e grupo muscular.' : `${plans.length} ${plans.length === 1 ? 'ficha ativa' : 'fichas ativas'} para organizar sua rotina.`}
            actions={<>
               <Button onClick={() => setShowCreate(true)}>
                  <Plus className="h-4 w-4" /> Nova ficha
               </Button>
            </>}
         />

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
               {plans.map((plan) => (
                  <Card key={plan.id} className="overflow-hidden">
                     <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                           <button
                              type="button"
                              className="flex min-h-11 flex-1 flex-wrap items-center gap-2 rounded-lg text-left"
                              onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                              aria-expanded={expandedPlan === plan.id}
                              aria-controls={`plan-${plan.id}`}
                           >
                              {expandedPlan === plan.id ? (
                                 <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                 <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                              <CardTitle className="text-base sm:text-lg">{plan.name}</CardTitle>
                              <Badge variant="secondary" className="text-xs">
                                 {plan.exercises.length} exercícios
                              </Badge>
                              {plan._count && (
                                 <Badge variant="outline" className="text-xs">
                                    {plan._count.workoutLogs} treinos
                                 </Badge>
                              )}
                           </button>
                           <div className="flex gap-1">
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
                     </CardHeader>
                     {expandedPlan === plan.id && (
                        <CardContent id={`plan-${plan.id}`} className="animate-fade-in-down border-t border-border/60 pt-4 sm:pt-5">
                           <div className="grid grid-cols-[auto_1fr_auto_auto] gap-3 px-3 py-2 text-xs font-medium uppercase tracking-wide text-gradient hidden sm:grid">
                              <span className="w-6">#</span>
                              <span>Exercício</span>
                              <span>Grupo</span>
                              <span className="w-7" />
                           </div>
                           <div className="divide-y divide-border/50">
                              {plan.exercises.map((pe, i) => (
                                 <div
                                    key={pe.id}
                                    className="flex flex-col sm:grid sm:grid-cols-[auto_1fr_auto_auto] sm:items-center gap-2 sm:gap-3 px-3 py-3 hover:bg-secondary/20 transition-colors"
                                 >
                                    <span className="text-sm text-muted-foreground w-6 hidden sm:inline">{i + 1}.</span>
                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setProgressionExercise(pe.exercise)}>
                                       <ScrollText className="font-medium text-sm hover:text-primary transition-colors">{pe.exercise.name}</ScrollText>
                                       <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                          <span>{pe.sets} séries × {pe.reps} reps</span>
                                          {pe.weight != null && <span>• {pe.weight}kg</span>}
                                          <span>• {pe.restSeconds}s descanso</span>
                                       </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs w-fit">
                                       {muscleGroupLabels[pe.exercise.muscleGroup]}
                                    </Badge>
                                    <Button
                                       variant="ghost"
                                       size="icon"
                                       className="h-7 w-7 shrink-0 hover:text-primary"
                                       onClick={() => setSelectedExercise(pe.exercise)}
                                       aria-label={`Ver detalhes de ${pe.exercise.name}`}
                                    >
                                       <HelpCircle className="h-4 w-4" />
                                    </Button>
                                 </div>
                              ))}
                              {plan.exercises.length === 0 && (
                                 <p className="text-sm text-muted-foreground text-center py-4">
                                    Nenhum exercício adicionado
                                 </p>
                              )}
                           </div>
                        </CardContent>
                     )}
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
