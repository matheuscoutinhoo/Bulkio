import { useEffect, useState } from 'react';
import { workoutLogApi } from '@/services/workoutLogService';
import { workoutPlanApi, type WorkoutPlan } from '@/services/workoutPlanService';
import { exerciseApi, type Exercise } from '@/services/exerciseService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';
import { ExerciseSearchDropdown } from '@/components/exercises/ExerciseSearchDropdown';

interface LogExercise {
   exerciseId: string;
   exerciseName: string;
   sets: { setNumber: number; reps: number; weight: number }[];
}

interface LogWorkoutDialogProps {
   open: boolean;
   onClose: () => void;
   onCreated: () => void;
}

export function LogWorkoutDialog({ open, onClose, onCreated }: LogWorkoutDialogProps) {
   const [plans, setPlans] = useState<WorkoutPlan[]>([]);
   const [selectedPlan, setSelectedPlan] = useState<string>('');
   const [exercises, setExercises] = useState<LogExercise[]>([]);
   const [allExercises, setAllExercises] = useState<Exercise[]>([]);
   const [notes, setNotes] = useState('');
   const [isComplete, setIsComplete] = useState(true);
   const [submitting, setSubmitting] = useState(false);

   const resetForm = () => {
      setSelectedPlan('');
      setExercises([]);
      setNotes('');
      setIsComplete(true);
   };

   const handleClose = () => {
      resetForm();
      onClose();
   };

   useEffect(() => {
      if (open) {
         workoutPlanApi.getAll({ limit: 50 }).then((res) => setPlans(res.data.data)).catch(console.error);
         exerciseApi.getAll({ limit: 300 })
            .then((res) => setAllExercises(res.data.data))
            .catch((err) => console.error('Failed to load exercises:', err));
      }
   }, [open]);

   const loadFromPlan = (planId: string) => {
      setSelectedPlan(planId);
      const plan = plans.find((p) => p.id === planId);
      if (plan) {
         setExercises(
            plan.exercises.map((pe) => ({
               exerciseId: pe.exercise.id,
               exerciseName: pe.exercise.name,
               sets: Array.from({ length: pe.sets }, (_, i) => ({
                  setNumber: i + 1,
                  reps: parseInt(pe.reps) || 10,
                  weight: 0,
               })),
            })),
         );
      }
   };

   const addExercise = (exercise: Exercise) => {
      setExercises((prev) => [
         ...prev,
         {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            sets: [{ setNumber: 1, reps: 10, weight: 0 }],
         },
      ]);
   };

   const removeExercise = (index: number) => {
      setExercises((prev) => prev.filter((_, i) => i !== index));
   };

   const addSet = (exerciseIndex: number) => {
      setExercises((prev) =>
         prev.map((e, i) =>
            i === exerciseIndex
               ? {
                  ...e,
                  sets: [
                     ...e.sets,
                     {
                        setNumber: e.sets.length + 1,
                        reps: e.sets[e.sets.length - 1]?.reps || 10,
                        weight: e.sets[e.sets.length - 1]?.weight || 0,
                     },
                  ],
               }
               : e,
         ),
      );
   };

   const updateSet = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: number) => {
      setExercises((prev) =>
         prev.map((e, i) =>
            i === exerciseIndex
               ? {
                  ...e,
                  sets: e.sets.map((s, si) =>
                     si === setIndex ? { ...s, [field]: value } : s,
                  ),
               }
               : e,
         ),
      );
   };

   const removeSet = (exerciseIndex: number, setIndex: number) => {
      setExercises((prev) =>
         prev.map((e, i) =>
            i === exerciseIndex
               ? {
                  ...e,
                  sets: e.sets
                     .filter((_, si) => si !== setIndex)
                     .map((s, si) => ({ ...s, setNumber: si + 1 })),
               }
               : e,
         ),
      );
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (exercises.length === 0) return;
      setSubmitting(true);
      try {
         const now = new Date().toISOString();
         await workoutLogApi.create({
            workoutPlanId: selectedPlan || undefined,
            date: now,
            startTime: now,
            endTime: undefined,
            isComplete,
            notes: notes || undefined,
            exercises: exercises.map((ex, i) => ({
               exerciseId: ex.exerciseId,
               order: i,
               sets: ex.sets,
            })),
         });
         handleClose();
         onCreated();
      } catch (err) {
         console.error(err);
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <Dialog open={open} onClose={handleClose} className="max-w-2xl">
         <DialogHeader>
            <DialogTitle>Registrar Treino</DialogTitle>
         </DialogHeader>
         <form onSubmit={handleSubmit} className="space-y-4 flex flex-col min-h-0">
            <div className="space-y-2">
               <Label>Carregar de ficha (opcional)</Label>
               <Select value={selectedPlan} onChange={(e) => loadFromPlan(e.target.value)}>
                  <option value="">Treino livre</option>
                  {plans.map((p) => (
                     <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
               </Select>
            </div>

            <ExerciseSearchDropdown
               exercises={allExercises}
               onSelect={addExercise}
               maxResults={8}
               maxHeight="max-h-40"
            />

            {exercises.length > 0 && (
               <div className="overflow-y-auto max-h-[40vh] pr-1 space-y-4">
                  {exercises.map((ex, ei) => (
                     <div key={ei} className="p-3 rounded-lg border space-y-2">
                        <div className="flex items-center justify-between">
                           <span className="font-medium text-sm">{ex.exerciseName}</span>
                           <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeExercise(ei)}>
                              <Trash2 className="h-3 w-3" />
                           </Button>
                        </div>
                        <div className="grid grid-cols-[40px_1fr_1fr_40px] gap-1 text-xs text-muted-foreground font-medium">
                           <span>Série</span><span>Reps</span><span>Carga (kg)</span><span></span>
                        </div>
                        {ex.sets.map((set, si) => (
                           <div key={si} className="grid grid-cols-[40px_1fr_1fr_40px] gap-1 items-center">
                              <span className="text-sm text-center text-muted-foreground">{set.setNumber}</span>
                              <Input
                                 type="number"
                                 className="h-8 text-sm"
                                 value={set.reps}
                                 onChange={(e) => updateSet(ei, si, 'reps', parseInt(e.target.value) || 0)}
                                 min={0}
                              />
                              <Input
                                 type="number"
                                 className="h-8 text-sm"
                                 value={set.weight}
                                 onChange={(e) => updateSet(ei, si, 'weight', parseFloat(e.target.value) || 0)}
                                 min={0}
                                 step={0.5}
                              />
                              <Button
                                 type="button"
                                 variant="ghost"
                                 size="icon"
                                 className="h-7 w-7"
                                 onClick={() => removeSet(ei, si)}
                                 disabled={ex.sets.length <= 1}
                              >
                                 <Trash2 className="h-3 w-3" />
                              </Button>
                           </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => addSet(ei)}>
                           + Série
                        </Button>
                     </div>
                  ))}
               </div>
            )}

            <div className="space-y-2">
               <Label>Observações (opcional)</Label>
               <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anotações do treino..." />
            </div>

            <div className="flex items-center gap-2">
               <input
                  type="checkbox"
                  id="isComplete"
                  checked={isComplete}
                  onChange={(e) => setIsComplete(e.target.checked)}
                  className="rounded"
               />
               <Label htmlFor="isComplete">Marcar como completo</Label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
               <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
               <Button type="submit" disabled={exercises.length === 0 || submitting}>
                  {submitting ? 'Salvando...' : 'Salvar Treino'}
               </Button>
            </div>
         </form>
      </Dialog>
   );
}
