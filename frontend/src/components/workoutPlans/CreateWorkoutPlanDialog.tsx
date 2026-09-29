import { useEffect, useState } from 'react';
import { workoutPlanApi, type WorkoutPlan } from '@/services/workoutPlanService';
import { exerciseApi, type Exercise } from '@/services/exerciseService';
import { bodyWeightApi } from '@/services/bodyWeightService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RotateCcw, Scale, Trash2 } from 'lucide-react';
import { ExerciseSearchDropdown } from '@/components/exercises/ExerciseSearchDropdown';
import { toast } from '@/stores/toastStore';
import { getApiErrorMessage } from '@/lib/api';
import {
   clampInteger,
   formatKilograms,
   formatNumberInput,
   formatRestDuration,
   parseOptionalNonNegativeNumber,
} from '@/lib/workoutForm';

interface ExerciseDraft {
   exerciseId: string;
   exerciseName: string;
   equipment: string;
   sets: string;
   reps: string;
   restSeconds: string;
   weight: string;
   usesBodyWeight: boolean;
}

interface CreateWorkoutPlanDialogProps {
   open: boolean;
   onClose: () => void;
   onCreated: () => void;
   editPlan?: WorkoutPlan | null;
}

export function CreateWorkoutPlanDialog({ open, onClose, onCreated, editPlan }: CreateWorkoutPlanDialogProps) {
   const [name, setName] = useState('');
   const [description, setDescription] = useState('');
   const [bodyWeight, setBodyWeight] = useState('');
   const [bodyWeightStatus, setBodyWeightStatus] = useState<'loading' | 'recorded' | 'empty' | 'error'>('loading');
   const [bodyWeightAttempt, setBodyWeightAttempt] = useState(0);
   const [exercises, setExercises] = useState<ExerciseDraft[]>([]);
   const [allExercises, setAllExercises] = useState<Exercise[]>([]);
   const [loadingExercises, setLoadingExercises] = useState(false);
   const [exerciseLoadError, setExerciseLoadError] = useState(false);
   const [submitting, setSubmitting] = useState(false);
   const [error, setError] = useState('');

   const isEdit = !!editPlan;
   const currentBodyWeight = parseOptionalNonNegativeNumber(bodyWeight);

   const resetForm = () => {
      setName('');
      setDescription('');
      setBodyWeight('');
      setBodyWeightStatus('loading');
      setExercises([]);
      setError('');
   };

   const handleClose = () => {
      resetForm();
      onClose();
   };

   useEffect(() => {
      if (!open) return;

      let cancelled = false;
      setLoadingExercises(true);
      setExerciseLoadError(false);

      exerciseApi.getAll({ limit: 300 })
         .then((res) => {
            if (!cancelled) setAllExercises(res.data.data);
         })
         .catch((err) => {
            console.error('Failed to load exercises:', err);
            if (!cancelled) setExerciseLoadError(true);
         })
         .finally(() => {
            if (!cancelled) setLoadingExercises(false);
         });

      return () => { cancelled = true; };
   }, [open]);

   useEffect(() => {
      if (!open) return;

      let cancelled = false;
      setBodyWeightStatus('loading');
      setBodyWeight('');
      bodyWeightApi.getAll({ limit: 1 })
         .then((res) => {
            if (cancelled) return;
            const latestWeight = res.data.data[0]?.weight ?? null;
            setBodyWeightStatus(latestWeight == null ? 'empty' : 'recorded');
            if (latestWeight == null) return;

            const value = formatNumberInput(latestWeight);
            setBodyWeight(value);
            setExercises((current) => current.map((exercise) => (
               exercise.equipment === 'BODYWEIGHT' && exercise.usesBodyWeight
                  ? { ...exercise, weight: value }
                  : exercise
            )));
         })
         .catch(() => {
            if (!cancelled) setBodyWeightStatus('error');
         });

      return () => { cancelled = true; };
   }, [open, bodyWeightAttempt]);

   useEffect(() => {
      if (open && editPlan) {
         setName(editPlan.name);
         setDescription(editPlan.description || '');
         setExercises(
            editPlan.exercises.map((pe) => ({
               exerciseId: pe.exerciseId,
               exerciseName: pe.exercise.name,
               equipment: pe.exercise.equipment,
               sets: String(pe.sets),
               reps: pe.reps,
               restSeconds: String(pe.restSeconds),
               weight: pe.weight == null ? '' : formatNumberInput(pe.weight),
               usesBodyWeight: false,
            })),
         );
      }
   }, [open, editPlan]);

   const addExercise = (exercise: Exercise) => {
      const shouldUseBodyWeight = exercise.equipment === 'BODYWEIGHT';
      setExercises((prev) => [
         ...prev,
         {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            equipment: exercise.equipment,
            sets: '3',
            reps: '10',
            restSeconds: '60',
            weight: shouldUseBodyWeight && currentBodyWeight != null
               ? formatNumberInput(currentBodyWeight)
               : '',
            usesBodyWeight: shouldUseBodyWeight,
         },
      ]);
   };

   const removeExercise = (index: number) => {
      setExercises((prev) => prev.filter((_, i) => i !== index));
   };

   const updateExercise = (index: number, updates: Partial<ExerciseDraft>) => {
      setExercises((prev) =>
         prev.map((exercise, i) => (i === index ? { ...exercise, ...updates } : exercise)),
      );
   };

   const handleBodyWeightChange = (value: string) => {
      setBodyWeight(value);

      const parsed = parseOptionalNonNegativeNumber(value);
      const nextWeight = parsed == null ? '' : formatNumberInput(parsed);
      setExercises((current) => current.map((exercise) => (
         exercise.equipment === 'BODYWEIGHT' && exercise.usesBodyWeight
            ? { ...exercise, weight: nextWeight }
            : exercise
      )));
   };

   const applyBodyWeight = (index: number) => {
      if (currentBodyWeight == null) return;
      updateExercise(index, {
         weight: formatNumberInput(currentBodyWeight),
         usesBodyWeight: true,
      });
   };

   const retryExerciseLoad = async () => {
      setLoadingExercises(true);
      setExerciseLoadError(false);
      try {
         const response = await exerciseApi.getAll({ limit: 300 });
         setAllExercises(response.data.data);
      } catch (err) {
         console.error('Failed to load exercises:', err);
         setExerciseLoadError(true);
      } finally {
         setLoadingExercises(false);
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name) return;
      setSubmitting(true);
      try {
         const exercisePayload = exercises.map((e, i) => ({
            exerciseId: e.exerciseId,
            sets: clampInteger(e.sets, { min: 1, max: 20, fallback: 1 }),
            reps: e.reps,
            restSeconds: clampInteger(e.restSeconds, { min: 0, max: 600, fallback: 0 }),
            weight: parseOptionalNonNegativeNumber(e.weight),
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
         toast.success(isEdit ? 'Ficha atualizada' : 'Ficha criada');
      } catch (err: unknown) {
         setError(getApiErrorMessage(err, 'Não foi possível salvar a ficha.'));
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <Dialog open={open} onClose={handleClose} className="sm:max-w-2xl">
         <DialogHeader>
            <DialogTitle>{isEdit ? 'Editar Ficha de Treino' : 'Nova Ficha de Treino'}</DialogTitle>
         </DialogHeader>
         <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="-mr-2 min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain pr-2 pb-2">
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="form-field">
                     <Label htmlFor="plan-name">Nome da ficha</Label>
                     <Input id="plan-name" placeholder="Ex: Treino A - Peito/Tríceps" value={name} onChange={(event) => setName(event.target.value)} required />
                  </div>
                  <div className="form-field">
                     <Label htmlFor="plan-description">Descrição (opcional)</Label>
                     <Input id="plan-description" placeholder="Descrição breve" value={description} onChange={(event) => setDescription(event.target.value)} />
                  </div>
               </div>

               {bodyWeightStatus === 'loading' && (
                  <p className="text-sm text-muted-foreground" role="status">Carregando peso corporal...</p>
               )}
               {bodyWeightStatus === 'recorded' && currentBodyWeight != null && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                     <Scale className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                     <p>Peso corporal registrado: <span className="font-medium text-foreground">{formatKilograms(currentBodyWeight)} kg</span></p>
                  </div>
               )}
               {bodyWeightStatus === 'error' && (
                  <div className="space-y-2">
                     <p className="text-sm text-destructive" role="alert">Não foi possível consultar seu peso registrado.</p>
                     <Button type="button" variant="outline" onClick={() => setBodyWeightAttempt((attempt) => attempt + 1)}>
                        <RotateCcw className="h-4 w-4" aria-hidden="true" /> Tentar novamente
                     </Button>
                  </div>
               )}
               {bodyWeightStatus === 'empty' && (
                  <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
                     <div className="grid gap-3 sm:grid-cols-[minmax(0,12rem)_1fr] sm:items-end">
                        <div className="form-field">
                           <Label htmlFor="plan-body-weight" className="flex items-center gap-2">
                              <Scale className="h-4 w-4 text-primary" aria-hidden="true" />
                              Peso corporal (kg)
                           </Label>
                           <Input
                              id="plan-body-weight"
                              type="number"
                              min={20}
                              max={500}
                              step="any"
                              inputMode="decimal"
                              placeholder="Ex: 75,5"
                              value={bodyWeight}
                              onChange={(event) => handleBodyWeightChange(event.target.value)}
                           />
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                           Usado para preencher a carga de novos exercícios de peso corporal. Você ainda pode ajustar cada carga manualmente.
                        </p>
                     </div>
                  </div>
               )}

               {exerciseLoadError ? (
                  <div className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between" role="alert">
                     <p className="text-sm text-destructive">Não foi possível carregar os exercícios.</p>
                     <Button type="button" variant="outline" size="sm" onClick={retryExerciseLoad} disabled={loadingExercises}>
                        {loadingExercises ? 'Tentando…' : 'Tentar novamente'}
                     </Button>
                  </div>
               ) : (
                  <ExerciseSearchDropdown
                     exercises={allExercises}
                     onSelect={addExercise}
                     label="Adicionar exercícios"
                     placeholder={loadingExercises ? 'Carregando exercícios…' : 'Buscar exercício…'}
                     showMuscleGroup
                  />
               )}

               {exercises.length > 0 && (
                  <div className="space-y-3">
                     {exercises.map((ex, i) => {
                        const restLabel = formatRestDuration(ex.restSeconds);
                        const isBodyWeightExercise = ex.equipment === 'BODYWEIGHT';

                        return (
                           <div key={`${ex.exerciseId}-${i}`} className="flex flex-col gap-4 rounded-xl border border-border/60 bg-secondary/20 p-3 sm:p-4">
                              <div className="flex min-w-0 items-center gap-2">
                                 <span className="w-6 shrink-0 text-sm text-muted-foreground">{i + 1}.</span>
                                 <span className="min-w-0 truncate text-sm font-medium">{ex.exerciseName}</span>
                                 <Button type="button" variant="ghost" size="icon" className="ml-auto sm:h-9 sm:w-9" onClick={() => removeExercise(i)} aria-label={`Remover ${ex.exerciseName}`}>
                                    <Trash2 className="h-4 w-4" />
                                 </Button>
                              </div>
                              <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-4 sm:pl-8">
                                 <div className="form-field">
                                    <Label htmlFor={`exercise-${i}-sets`} className="text-xs text-muted-foreground">Séries</Label>
                                    <Input id={`exercise-${i}-sets`} type="number" className="min-h-11 px-3 text-base sm:h-10 sm:min-h-10 sm:text-xs" value={ex.sets} onChange={(event) => updateExercise(i, { sets: event.target.value })} min={1} max={20} inputMode="numeric" />
                                 </div>
                                 <div className="form-field">
                                    <Label htmlFor={`exercise-${i}-reps`} className="text-xs text-muted-foreground">Repetições</Label>
                                    <Input id={`exercise-${i}-reps`} className="min-h-11 px-3 text-base sm:h-10 sm:min-h-10 sm:text-xs" value={ex.reps} onChange={(event) => updateExercise(i, { reps: event.target.value })} placeholder="10" />
                                 </div>
                                 <div className="form-field">
                                    <Label htmlFor={`exercise-${i}-weight`} className="text-xs text-muted-foreground">Carga (kg)</Label>
                                    <Input
                                       id={`exercise-${i}-weight`}
                                       type="number"
                                       className="min-h-11 px-3 text-base sm:h-10 sm:min-h-10 sm:text-xs"
                                       value={ex.weight}
                                       onChange={(event) => updateExercise(i, { weight: event.target.value, usesBodyWeight: false })}
                                       min={0}
                                       step="any"
                                       inputMode="decimal"
                                       placeholder="0"
                                    />
                                    {isBodyWeightExercise && currentBodyWeight != null && (
                                       <Button
                                          type="button"
                                          variant="secondary"
                                          size="sm"
                                          className="h-auto min-h-11 w-full whitespace-normal px-2 text-xs sm:min-h-10"
                                          onClick={() => applyBodyWeight(i)}
                                          disabled={ex.usesBodyWeight && parseOptionalNonNegativeNumber(ex.weight) === currentBodyWeight}
                                       >
                                          {ex.usesBodyWeight ? 'Peso aplicado' : `Usar ${formatKilograms(currentBodyWeight)} kg`}
                                       </Button>
                                    )}
                                    {isBodyWeightExercise && bodyWeightStatus === 'empty' && currentBodyWeight == null && (
                                       <p className="text-xs leading-relaxed text-muted-foreground">Informe seu peso acima para preencher.</p>
                                    )}
                                 </div>
                                 <div className="form-field">
                                    <Label htmlFor={`exercise-${i}-rest`} className="text-xs text-muted-foreground">Descanso (s)</Label>
                                    <Input
                                       id={`exercise-${i}-rest`}
                                       type="number"
                                       className="min-h-11 px-3 text-base sm:h-10 sm:min-h-10 sm:text-xs"
                                       value={ex.restSeconds}
                                       onChange={(event) => updateExercise(i, { restSeconds: event.target.value })}
                                       min={0}
                                       max={600}
                                       step={1}
                                       inputMode="numeric"
                                       placeholder="0"
                                       aria-describedby={`exercise-${i}-rest-help`}
                                    />
                                    <p id={`exercise-${i}-rest-help`} className="text-xs text-muted-foreground">
                                       {restLabel ?? 'Vazio será salvo como 0 s'}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               )}

               {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
            </div>

            <div className="mt-5 flex shrink-0 flex-col-reverse gap-3 border-t border-border/60 pt-4 sm:flex-row sm:justify-end">
               <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
               <Button type="submit" disabled={!name.trim() || submitting}>
                  {submitting ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar ficha'}
               </Button>
            </div>
         </form>
      </Dialog>
   );
}
