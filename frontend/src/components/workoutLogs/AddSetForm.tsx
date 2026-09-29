import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { History, RotateCcw, Scale } from 'lucide-react';
import type { WorkoutPlanExercise } from '@/services/workoutPlanService';
import { workoutLogApi, type ExerciseLastSession } from '@/services/workoutLogService';
import { bodyWeightApi } from '@/services/bodyWeightService';
import { getApiErrorMessage } from '@/lib/api';
import {
   formatKilograms,
   formatNumberInput,
   parseOptionalNonNegativeNumber,
} from '@/lib/workoutForm';

interface AddSetFormProps {
   planExercises: WorkoutPlanExercise[];
   onSave: (exerciseId: string, reps: number, weight: number) => Promise<void>;
   onCancel: () => void;
}

export function AddSetForm({ planExercises, onSave, onCancel }: AddSetFormProps) {
   const [exerciseId, setExerciseId] = useState('');
   const [reps, setReps] = useState('10');
   const [weight, setWeight] = useState('');
   const [bodyWeight, setBodyWeight] = useState('');
   const [bodyWeightStatus, setBodyWeightStatus] = useState<'loading' | 'recorded' | 'empty' | 'error'>('loading');
   const [bodyWeightAttempt, setBodyWeightAttempt] = useState(0);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState('');
   const [lastSession, setLastSession] = useState<ExerciseLastSession | null>(null);
   const [loadingHistory, setLoadingHistory] = useState(false);
   const weightTouchedRef = useRef(false);
   const repsTouchedRef = useRef(false);

   const selectedPlanExercise = planExercises.find((exercise) => exercise.exerciseId === exerciseId);
   const currentBodyWeight = parseOptionalNonNegativeNumber(bodyWeight);
   const isBodyWeightExercise = selectedPlanExercise?.exercise.equipment === 'BODYWEIGHT';
   const currentBodyWeightRef = useRef(currentBodyWeight);

   useEffect(() => {
      currentBodyWeightRef.current = currentBodyWeight;
   }, [currentBodyWeight]);

   useEffect(() => {
      let cancelled = false;
      setBodyWeightStatus('loading');
      setBodyWeight('');
      bodyWeightApi.getAll({ limit: 1 })
         .then((response) => {
            if (cancelled) return;
            const latestWeight = response.data.data[0]?.weight ?? null;
            setBodyWeightStatus(latestWeight == null ? 'empty' : 'recorded');
            if (latestWeight != null) {
               setBodyWeight(formatNumberInput(latestWeight));
            }
         })
         .catch(() => {
            if (!cancelled) setBodyWeightStatus('error');
         });

      return () => { cancelled = true; };
   }, [bodyWeightAttempt]);

   useEffect(() => {
      if (!exerciseId) {
         setLastSession(null);
         return;
      }

      let cancelled = false;
      setLoadingHistory(true);
      workoutLogApi.getExerciseLastSession(exerciseId)
         .then((res) => {
            if (!cancelled) {
               setLastSession(res.data.data);
               if (res.data.data && res.data.data.sets.length > 0) {
                  const lastSet = res.data.data.sets[res.data.data.sets.length - 1];
                  if (!repsTouchedRef.current) setReps(String(lastSet.reps));
                  if (!weightTouchedRef.current) {
                     const latestBodyWeight = currentBodyWeightRef.current;
                     if (selectedPlanExercise?.exercise.equipment === 'BODYWEIGHT' && latestBodyWeight != null) {
                        setWeight(formatNumberInput(latestBodyWeight));
                     } else {
                        setWeight(formatNumberInput(lastSet.weight));
                     }
                  }
               }
            }
         })
         .catch(() => { if (!cancelled) setLastSession(null); })
         .finally(() => { if (!cancelled) setLoadingHistory(false); });

      return () => { cancelled = true; };
   }, [exerciseId, selectedPlanExercise?.exercise.equipment]);

   useEffect(() => {
      if (isBodyWeightExercise && currentBodyWeight != null && !weightTouchedRef.current) {
         setWeight(formatNumberInput(currentBodyWeight));
      }
   }, [currentBodyWeight, isBodyWeightExercise]);

   const handleExerciseChange = (nextExerciseId: string) => {
      const planExercise = planExercises.find((exercise) => exercise.exerciseId === nextExerciseId);
      weightTouchedRef.current = false;
      repsTouchedRef.current = false;
      setExerciseId(nextExerciseId);
      setLastSession(null);

      if (!planExercise) {
         setReps('10');
         setWeight('');
         return;
      }

      const plannedReps = Number.parseInt(planExercise.reps, 10);
      setReps(Number.isFinite(plannedReps) && plannedReps > 0 ? String(plannedReps) : '10');
      if (planExercise.exercise.equipment === 'BODYWEIGHT' && currentBodyWeight != null) {
         setWeight(formatNumberInput(currentBodyWeight));
      } else {
         setWeight(planExercise.weight == null ? '' : formatNumberInput(planExercise.weight));
      }
   };

   const handleBodyWeightChange = (value: string) => {
      setBodyWeight(value);

      const parsed = parseOptionalNonNegativeNumber(value);
      if (isBodyWeightExercise && !weightTouchedRef.current) {
         setWeight(parsed == null ? '' : formatNumberInput(parsed));
      }
   };

   const applyBodyWeight = () => {
      if (currentBodyWeight == null) return;
      weightTouchedRef.current = false;
      setWeight(formatNumberInput(currentBodyWeight));
   };

   const handleSave = async (event: React.FormEvent) => {
      event.preventDefault();
      const repsValue = Number(reps);
      const weightValue = parseOptionalNonNegativeNumber(weight);
      if (!exerciseId || !Number.isInteger(repsValue) || repsValue <= 0 || weightValue == null || saving) return;
      setError('');
      setSaving(true);
      try {
         await onSave(exerciseId, repsValue, weightValue);
      } catch (err: unknown) {
         setError(getApiErrorMessage(err, 'Não foi possível salvar a série. Tente novamente.'));
      } finally {
         setSaving(false);
      }
   };

   const parsedReps = Number(reps);
   const parsedWeight = parseOptionalNonNegativeNumber(weight);
   const canSave = !!exerciseId && Number.isInteger(parsedReps) && parsedReps > 0 && parsedWeight != null;

   return (
      <form onSubmit={handleSave} className="space-y-5 rounded-xl border border-primary/25 bg-primary/5 p-3.5 sm:p-5">
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
            <div className="rounded-xl border border-primary/20 bg-background/65 p-3 sm:p-4">
               <div className="form-field">
                  <Label htmlFor="set-body-weight" className="flex items-center gap-2">
                     <Scale className="h-4 w-4 text-primary" aria-hidden="true" />
                     Peso corporal para este treino (kg)
                  </Label>
                  <Input
                     id="set-body-weight"
                     type="number"
                     value={bodyWeight}
                     onChange={(event) => handleBodyWeightChange(event.target.value)}
                     min={20}
                     max={500}
                     step="any"
                     inputMode="decimal"
                     placeholder="Ex: 75,5"
                  />
                  <p className="text-xs leading-relaxed text-muted-foreground">Exercícios de peso corporal usam este valor como carga inicial.</p>
               </div>
            </div>
         )}

         <div className="form-field">
            <Label htmlFor="set-exercise">Exercício</Label>
            <Select id="set-exercise" value={exerciseId} onChange={(event) => handleExerciseChange(event.target.value)} required>
               <option value="">Selecione o exercício</option>
               {planExercises.map((pe) => (
                  <option key={pe.exerciseId} value={pe.exerciseId}>
                     {pe.exercise.name}
                  </option>
               ))}
            </Select>
         </div>

         {/* Inline history */}
         {exerciseId && (
            <div className="text-xs text-muted-foreground">
               {loadingHistory ? (
                  <span className="animate-pulse">Carregando histórico...</span>
               ) : lastSession ? (
                  <div className="flex items-start gap-1.5 p-2 rounded-md bg-secondary/40">
                     <History className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/70" />
                     <div>
                        <span className="font-medium text-foreground/80">Última vez: </span>
                        {lastSession.sets.map((s, i) => (
                           <span key={i}>
                              {i > 0 && <span className="mx-0.5 text-muted-foreground/50">·</span>}
                              <span className="text-foreground/90">{s.reps}×{s.weight}kg</span>
                           </span>
                        ))}
                     </div>
                  </div>
               ) : (
                  <div className="flex items-center gap-1.5 p-2 rounded-md bg-secondary/40">
                     <History className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                     <span>Sem histórico anterior</span>
                  </div>
               )}
            </div>
         )}

         <div className="grid grid-cols-1 gap-4 min-[380px]:grid-cols-2">
            <div className="form-field">
               <Label htmlFor="set-reps" className="text-xs">Repetições</Label>
               <Input id="set-reps" type="number" value={reps} onChange={(event) => { repsTouchedRef.current = true; setReps(event.target.value); }} min={1} inputMode="numeric" required />
            </div>
            <div className="form-field">
               <Label htmlFor="set-weight" className="text-xs">Carga (kg)</Label>
               <Input id="set-weight" type="number" value={weight} onChange={(event) => { weightTouchedRef.current = true; setWeight(event.target.value); }} min={0} step="any" inputMode="decimal" required />
               {isBodyWeightExercise && currentBodyWeight != null && (
                  <Button type="button" variant="secondary" size="sm" className="h-auto min-h-11 w-full whitespace-normal sm:min-h-10" onClick={applyBodyWeight} disabled={parsedWeight === currentBodyWeight}>
                     {parsedWeight === currentBodyWeight ? 'Peso aplicado' : `Usar ${formatKilograms(currentBodyWeight)} kg`}
                  </Button>
               )}
               {isBodyWeightExercise && bodyWeightStatus === 'empty' && currentBodyWeight == null && (
                  <p className="text-xs leading-relaxed text-muted-foreground">
                     Informe o peso acima ou <Link to="/body-weight" className="font-semibold text-primary hover:underline">registre seu peso</Link>.
                  </p>
               )}
            </div>
         </div>
         {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
         <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button type="submit" size="sm" className="min-h-11 flex-1" disabled={!canSave || saving}>
               {saving ? 'Salvando…' : 'Salvar série'}
            </Button>
            <Button type="button" size="sm" variant="outline" className="min-h-11" onClick={onCancel}>
               Cancelar
            </Button>
         </div>
      </form>
   );
}
