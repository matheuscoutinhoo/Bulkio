import { useEffect, useState } from 'react';
import { workoutPlanApi, type WorkoutPlan } from '@/services/workoutPlanService';
import { exerciseApi, type Exercise } from '@/services/exerciseService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';
import { ExerciseSearchDropdown } from '@/components/exercises/ExerciseSearchDropdown';
import { muscleGroupLabels } from '@/lib/exerciseLabels';

interface CreateWorkoutPlanDialogProps {
   open: boolean;
   onClose: () => void;
   onCreated: () => void;
   editPlan?: WorkoutPlan | null;
}

export function CreateWorkoutPlanDialog({ open, onClose, onCreated, editPlan }: CreateWorkoutPlanDialogProps) {
   const [name, setName] = useState('');
   const [description, setDescription] = useState('');
   const [exercises, setExercises] = useState<
      { exerciseId: string; exerciseName: string; sets: number; reps: string; restSeconds: number }[]
   >([]);
   const [allExercises, setAllExercises] = useState<Exercise[]>([]);
   const [submitting, setSubmitting] = useState(false);

   const isEdit = !!editPlan;

   const resetForm = () => {
      setName('');
      setDescription('');
      setExercises([]);
   };

   const handleClose = () => {
      resetForm();
      onClose();
   };

   useEffect(() => {
      if (open) {
         exerciseApi.getAll({ limit: 300 })
            .then((res) => setAllExercises(res.data.data))
            .catch((err) => console.error('Failed to load exercises:', err));
      }
   }, [open]);

   useEffect(() => {
      if (open && editPlan) {
         setName(editPlan.name);
         setDescription(editPlan.description || '');
         setExercises(
            editPlan.exercises.map((pe) => ({
               exerciseId: pe.exerciseId,
               exerciseName: pe.exercise.name,
               sets: pe.sets,
               reps: pe.reps,
               restSeconds: pe.restSeconds,
            })),
         );
      }
   }, [open, editPlan]);

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
   };

   const removeExercise = (index: number) => {
      setExercises((prev) => prev.filter((_, i) => i !== index));
   };

   const updateExercise = (index: number, field: string, value: string | number) => {
      setExercises((prev) =>
         prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)),
      );
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name) return;
      setSubmitting(true);
      try {
         const exercisePayload = exercises.map((e, i) => ({
            exerciseId: e.exerciseId,
            sets: e.sets,
            reps: e.reps,
            restSeconds: e.restSeconds,
            order: i,
         }));

         if (isEdit && editPlan) {
            await workoutPlanApi.update(editPlan.id, {
               name,
               description: description || undefined,
               exercises: exercisePayload,
            });
         } else {
            await workoutPlanApi.create({
               name,
               description: description || undefined,
               exercises: exercisePayload,
            });
         }
         handleClose();
         onCreated();
      } catch (err) {
         console.error(err);
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <Dialog open={open} onClose={handleClose} className="sm:max-w-2xl">
         <DialogHeader>
            <DialogTitle>{isEdit ? 'Editar Ficha de Treino' : 'Nova Ficha de Treino'}</DialogTitle>
         </DialogHeader>
         <form onSubmit={handleSubmit} className="space-y-4 flex flex-col min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            <ExerciseSearchDropdown
               exercises={allExercises}
               onSelect={addExercise}
               label="Adicionar Exercícios"
               showMuscleGroup
            />

            {exercises.length > 0 && (
               <div className="space-y-2 overflow-y-auto max-h-[40vh] pr-1">
                  {exercises.map((ex, i) => (
                     <div key={i} className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-secondary/30">
                        <span className="text-sm text-muted-foreground w-6">{i + 1}.</span>
                        <span className="flex-1 text-sm font-medium truncate min-w-0">{ex.exerciseName}</span>
                        <div className="flex items-center gap-2">
                           <Input
                              type="number"
                              className="w-14 sm:w-16 h-8 text-xs"
                              value={ex.sets}
                              onChange={(e) => updateExercise(i, 'sets', parseInt(e.target.value) || 1)}
                              min={1}
                           />
                           <span className="text-xs text-muted-foreground">×</span>
                           <Input
                              className="w-16 sm:w-20 h-8 text-xs"
                              value={ex.reps}
                              onChange={(e) => updateExercise(i, 'reps', e.target.value)}
                              placeholder="10"
                           />
                           <span className="text-xs text-muted-foreground">•</span>
                           <Input
                              type="number"
                              className="w-14 sm:w-16 h-8 text-xs"
                              value={ex.restSeconds}
                              onChange={(e) => updateExercise(i, 'restSeconds', parseInt(e.target.value) || 0)}
                              min={0}
                              max={600}
                           />
                           <span className="text-xs text-muted-foreground">s</span>
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
                     </div>
                  ))}
               </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
               <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
               <Button type="submit" disabled={!name || submitting}>
                  {submitting ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Ficha'}
               </Button>
            </div>
         </form>
      </Dialog>
   );
}
