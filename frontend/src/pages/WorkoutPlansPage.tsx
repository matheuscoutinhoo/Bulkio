import { useEffect, useState, useCallback } from 'react';
import { workoutPlanApi, type WorkoutPlan, type CreateWorkoutPlanData } from '@/services/workoutPlanService';
import { exerciseApi, type Exercise } from '@/services/exerciseService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Copy, Archive, GripVertical, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const muscleGroupLabels: Record<string, string> = {
   CHEST: 'Peito', BACK: 'Costas', LEGS: 'Pernas', SHOULDERS: 'Ombros',
   BICEPS: 'Bíceps', TRICEPS: 'Tríceps', ABS: 'Abdômen', CARDIO: 'Cardio',
   GLUTES: 'Glúteos', FOREARMS: 'Antebraço', TRAPS: 'Trapézio', CALVES: 'Panturrilha',
   FULL_BODY: 'Full Body',
};

export default function WorkoutPlansPage() {
   const [plans, setPlans] = useState<WorkoutPlan[]>([]);
   const [loading, setLoading] = useState(true);
   const [showCreate, setShowCreate] = useState(false);
   const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

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
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold">Fichas de Treino</h1>
               <p className="text-muted-foreground">{plans.length} fichas ativas</p>
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
               <CardContent className="py-12 text-center">
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
                              className="flex items-center gap-2 cursor-pointer flex-1"
                              onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                           >
                              {expandedPlan === plan.id ? (
                                 <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                 <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                              <CardTitle className="text-lg">{plan.name}</CardTitle>
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
                              <Button variant="ghost" size="icon" onClick={() => handleDuplicate(plan.id)} title="Duplicar">
                                 <Copy className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleArchive(plan.id)} title="Arquivar">
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
                                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
                                 >
                                    <span className="text-sm text-muted-foreground w-6">{i + 1}.</span>
                                    <div className="flex-1 min-w-0">
                                       <p className="font-medium text-sm truncate">{pe.exercise.name}</p>
                                       <div className="flex gap-2 text-xs text-muted-foreground">
                                          <span>{pe.sets} séries × {pe.reps} reps</span>
                                          <span>• {pe.restSeconds}s descanso</span>
                                       </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                       {muscleGroupLabels[pe.exercise.muscleGroup]}
                                    </Badge>
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
            open={showCreate}
            onClose={() => setShowCreate(false)}
            onCreated={fetchPlans}
         />
      </div>
   );
}

function CreateWorkoutPlanDialog({
   open,
   onClose,
   onCreated,
}: {
   open: boolean;
   onClose: () => void;
   onCreated: () => void;
}) {
   const [name, setName] = useState('');
   const [description, setDescription] = useState('');
   const [exercises, setExercises] = useState<
      { exerciseId: string; exerciseName: string; sets: number; reps: string; restSeconds: number }[]
   >([]);
   const [allExercises, setAllExercises] = useState<Exercise[]>([]);
   const [searchExercise, setSearchExercise] = useState('');
   const [submitting, setSubmitting] = useState(false);

   useEffect(() => {
      if (open) {
         exerciseApi.getAll({ limit: 300 }).then((res) => setAllExercises(res.data.data));
      }
   }, [open]);

   const filteredExercises = allExercises.filter(
      (e) => e.name.toLowerCase().includes(searchExercise.toLowerCase()),
   );

   const addExercise = (exercise: Exercise) => {
      setExercises((prev) => [
         ...prev,
         {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            sets: 3,
            reps: '10',
            restSeconds: 60,
         },
      ]);
      setSearchExercise('');
   };

   const removeExercise = (index: number) => {
      setExercises((prev) => prev.filter((_, i) => i !== index));
   };

   const updateExercise = (index: number, field: string, value: any) => {
      setExercises((prev) =>
         prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)),
      );
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name) return;
      setSubmitting(true);
      try {
         await workoutPlanApi.create({
            name,
            description: description || undefined,
            exercises: exercises.map((e, i) => ({
               exerciseId: e.exerciseId,
               sets: e.sets,
               reps: e.reps,
               restSeconds: e.restSeconds,
               order: i,
            })),
         });
         setName('');
         setDescription('');
         setExercises([]);
         onClose();
         onCreated();
      } catch (err) {
         console.error(err);
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <Dialog open={open} onClose={onClose} className="max-w-2xl">
         <DialogHeader>
            <DialogTitle>Nova Ficha de Treino</DialogTitle>
         </DialogHeader>
         <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
               <div className="space-y-2">
                  <Label>Nome da Ficha</Label>
                  <Input
                     placeholder="Ex: Treino A - Peito/Tríceps"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     required
                  />
               </div>
               <div className="space-y-2">
                  <Label>Descrição (opcional)</Label>
                  <Input
                     placeholder="Descrição breve"
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                  />
               </div>
            </div>

            {/* Exercise selector */}
            <div className="space-y-2">
               <Label>Adicionar Exercícios</Label>
               <div className="relative">
                  <Input
                     placeholder="Buscar exercício..."
                     value={searchExercise}
                     onChange={(e) => setSearchExercise(e.target.value)}
                  />
                  {searchExercise && (
                     <div className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto rounded-md border bg-background shadow-lg">
                        {filteredExercises.slice(0, 10).map((ex) => (
                           <button
                              key={ex.id}
                              type="button"
                              onClick={() => addExercise(ex)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                           >
                              {ex.name}{' '}
                              <span className="text-muted-foreground text-xs">
                                 ({muscleGroupLabels[ex.muscleGroup]})
                              </span>
                           </button>
                        ))}
                        {filteredExercises.length === 0 && (
                           <p className="px-3 py-2 text-sm text-muted-foreground">Nenhum encontrado</p>
                        )}
                     </div>
                  )}
               </div>
            </div>

            {/* Selected exercises */}
            {exercises.length > 0 && (
               <div className="space-y-2">
                  {exercises.map((ex, i) => (
                     <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
                        <span className="text-sm text-muted-foreground w-6">{i + 1}.</span>
                        <span className="flex-1 text-sm font-medium truncate">{ex.exerciseName}</span>
                        <Input
                           type="number"
                           className="w-16 h-8 text-xs"
                           value={ex.sets}
                           onChange={(e) => updateExercise(i, 'sets', parseInt(e.target.value) || 1)}
                           min={1}
                        />
                        <span className="text-xs text-muted-foreground">×</span>
                        <Input
                           className="w-20 h-8 text-xs"
                           value={ex.reps}
                           onChange={(e) => updateExercise(i, 'reps', e.target.value)}
                           placeholder="10"
                        />
                        <Button
                           type="button"
                           variant="ghost"
                           size="icon"
                           className="h-8 w-8"
                           onClick={() => removeExercise(i)}
                        >
                           <Trash2 className="h-3 w-3" />
                        </Button>
                     </div>
                  ))}
               </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
               <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
               <Button type="submit" disabled={!name || submitting}>
                  {submitting ? 'Criando...' : 'Criar Ficha'}
               </Button>
            </div>
         </form>
      </Dialog>
   );
}
