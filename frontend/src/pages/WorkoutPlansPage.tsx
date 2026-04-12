import { useEffect, useState, useCallback } from 'react';
import { workoutPlanApi, type WorkoutPlan } from '@/services/workoutPlanService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Copy, Trash2, ChevronDown, ChevronUp, Pencil, HelpCircle, Sparkles } from 'lucide-react';
import { ExerciseDetailModal } from '@/components/exercises/ExerciseDetailModal';
import { ExerciseProgressionDialog } from '@/components/exercises/ExerciseProgressionDialog';
import { ScrollText } from '@/components/ui/scroll-text';
import { CreateWorkoutPlanDialog } from '@/components/workoutPlans/CreateWorkoutPlanDialog';
import { GenerateWorkoutDialog } from '@/components/workoutPlans/GenerateWorkoutDialog';
import { muscleGroupLabels } from '@/lib/exerciseLabels';

export default function WorkoutPlansPage() {
   const [plans, setPlans] = useState<WorkoutPlan[]>([]);
   const [loading, setLoading] = useState(true);
   const [showCreate, setShowCreate] = useState(false);
   const [showGenerate, setShowGenerate] = useState(false);
   const [editPlan, setEditPlan] = useState<WorkoutPlan | null>(null);
   const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
   const [selectedExercise, setSelectedExercise] = useState<{ id: string; name: string; muscleGroup: string; type?: string; equipment?: string } | null>(null);
   const [progressionExercise, setProgressionExercise] = useState<{ id: string; name: string; muscleGroup: string } | null>(null);
   const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

   const fetchPlans = useCallback(async () => {
      setLoading(true);
      try {
         const res = await workoutPlanApi.getAll({ limit: 50 });
         setPlans(res.data.data);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => { fetchPlans(); }, [fetchPlans]);

   const handleDuplicate = async (id: string) => {
      try {
         await workoutPlanApi.duplicate(id);
         fetchPlans();
      } catch (err) {
         console.error(err);
      }
   };

   const handleDelete = async () => {
      if (!deleteTarget) return;
      try {
         await workoutPlanApi.delete(deleteTarget);
         setDeleteTarget(null);
         fetchPlans();
      } catch (err) {
         console.error(err);
      }
   };

   return (
      <div className="space-y-6 animate-fade-in-up">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
               <h1 className="text-2xl sm:text-3xl font-bold">Fichas de Treino</h1>
               <p className="text-muted-foreground text-sm sm:text-base">{plans.length} fichas ativas</p>
            </div>
            <div className="flex gap-2">
               <Button variant="outline" onClick={() => setShowGenerate(true)}>
                  <Sparkles className="h-4 w-4 mr-2" /> Gerar com IA
               </Button>
               <Button onClick={() => setShowCreate(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Nova Ficha
               </Button>
            </div>
         </div>

         {loading ? (
            <div className="flex justify-center py-12">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
         ) : plans.length === 0 ? (
            <Card>
               <CardContent className="p-5 sm:p-6 py-12 text-center">
                  <p className="text-muted-foreground">Nenhuma ficha criada ainda.</p>
                  <Button className="mt-4" onClick={() => setShowCreate(true)}>
                     Criar Primeira Ficha
                  </Button>
               </CardContent>
            </Card>
         ) : (
            <div className="space-y-4">
               {plans.map((plan) => (
                  <Card key={plan.id}>
                     <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                           <div
                              className="flex flex-wrap items-center gap-2 cursor-pointer flex-1"
                              onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
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
                           </div>
                           <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => setEditPlan(plan)} title="Editar" className="hover:text-primary">
                                 <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDuplicate(plan.id)} title="Duplicar" className="hover:text-primary">
                                 <Copy className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(plan.id)} title="Excluir" className="hover:text-destructive">
                                 <Trash2 className="h-4 w-4" />
                              </Button>
                           </div>
                        </div>
                        {plan.description && (
                           <p className="text-sm text-muted-foreground">{plan.description}</p>
                        )}
                     </CardHeader>
                     {expandedPlan === plan.id && (
                        <CardContent className="animate-fade-in-down">
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

         <GenerateWorkoutDialog
            open={showGenerate}
            onClose={() => setShowGenerate(false)}
            onGenerated={fetchPlans}
         />

         {/* Delete confirmation modal */}
         {deleteTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteTarget(null)}>
               <div className="bg-card border rounded-lg p-6 mx-4 max-w-sm w-full shadow-lg" onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-lg font-semibold mb-2">Excluir ficha</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                     Tem certeza que deseja excluir esta ficha de treino? Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex justify-end gap-2">
                     <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
                        Cancelar
                     </Button>
                     <Button variant="destructive" size="sm" onClick={handleDelete}>
                        Excluir
                     </Button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
