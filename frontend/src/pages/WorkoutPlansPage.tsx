import { useEffect, useState, useCallback } from 'react';
import { workoutPlanApi, type WorkoutPlan } from '@/services/workoutPlanService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Copy, Archive, ChevronDown, ChevronUp, Pencil, HelpCircle } from 'lucide-react';
import { ExerciseDetailModal } from '@/components/exercises/ExerciseDetailModal';
import { ExerciseProgressionDialog } from '@/components/exercises/ExerciseProgressionDialog';
import { CreateWorkoutPlanDialog } from '@/components/workoutPlans/CreateWorkoutPlanDialog';
import { muscleGroupLabels } from '@/lib/exerciseLabels';

export default function WorkoutPlansPage() {
   const [plans, setPlans] = useState<WorkoutPlan[]>([]);
   const [loading, setLoading] = useState(true);
   const [showCreate, setShowCreate] = useState(false);
   const [editPlan, setEditPlan] = useState<WorkoutPlan | null>(null);
   const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
   const [selectedExercise, setSelectedExercise] = useState<{ id: string; name: string; muscleGroup: string; type?: string; equipment?: string } | null>(null);
   const [progressionExercise, setProgressionExercise] = useState<{ id: string; name: string; muscleGroup: string } | null>(null);

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

   const handleArchive = async (id: string) => {
      try {
         await workoutPlanApi.archive(id);
         fetchPlans();
      } catch (err) {
         console.error(err);
      }
   };

   return (
      <div className="space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
               <h1 className="text-2xl sm:text-3xl font-bold">Fichas de Treino</h1>
               <p className="text-muted-foreground text-sm sm:text-base">{plans.length} fichas ativas</p>
            </div>
            <Button onClick={() => setShowCreate(true)}>
               <Plus className="h-4 w-4 mr-2" /> Nova Ficha
            </Button>
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
                              <Button variant="ghost" size="icon" onClick={() => handleArchive(plan.id)} title="Arquivar" className="hover:text-primary">
                                 <Archive className="h-4 w-4" />
                              </Button>
                           </div>
                        </div>
                        {plan.description && (
                           <p className="text-sm text-muted-foreground">{plan.description}</p>
                        )}
                     </CardHeader>
                     {expandedPlan === plan.id && (
                        <CardContent>
                           <div className="space-y-2">
                              {plan.exercises.map((pe, i) => (
                                 <div
                                    key={pe.id}
                                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-lg bg-secondary/30"
                                 >
                                    <span className="text-sm text-muted-foreground w-6 hidden sm:inline">{i + 1}.</span>
                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setProgressionExercise(pe.exercise)}>
                                       <p className="font-medium text-sm truncate hover:text-primary transition-colors">{pe.exercise.name}</p>
                                       <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                          <span>{pe.sets} séries × {pe.reps} reps</span>
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
      </div>
   );
}
