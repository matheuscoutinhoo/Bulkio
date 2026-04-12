import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { History } from 'lucide-react';
import type { WorkoutPlanExercise } from '@/services/workoutPlanService';
import { workoutLogApi, type ExerciseLastSession } from '@/services/workoutLogService';

interface AddSetFormProps {
   planExercises: WorkoutPlanExercise[];
   onSave: (exerciseId: string, reps: number, weight: number) => Promise<void>;
   onCancel: () => void;
}

export function AddSetForm({ planExercises, onSave, onCancel }: AddSetFormProps) {
   const [exerciseId, setExerciseId] = useState('');
   const [reps, setReps] = useState('10');
   const [weight, setWeight] = useState('0');
   const [saving, setSaving] = useState(false);
   const [lastSession, setLastSession] = useState<ExerciseLastSession | null>(null);
   const [loadingHistory, setLoadingHistory] = useState(false);

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
                  setReps(String(lastSet.reps));
                  setWeight(String(lastSet.weight));
               }
            }
         })
         .catch(() => { if (!cancelled) setLastSession(null); })
         .finally(() => { if (!cancelled) setLoadingHistory(false); });

      return () => { cancelled = true; };
   }, [exerciseId]);

   const handleSave = async () => {
      if (!exerciseId) return;
      setSaving(true);
      try {
         await onSave(exerciseId, parseInt(reps) || 0, parseFloat(weight) || 0);
         setReps('10');
         setWeight('0');
      } finally {
         setSaving(false);
      }
   };

   return (
      <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
         <div className="space-y-2">
            <Label className="text-xs">Exercício</Label>
            <Select value={exerciseId} onChange={(e) => setExerciseId(e.target.value)}>
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

         <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
               <Label className="text-xs">Repetições</Label>
               <Input type="number" value={reps} onChange={(e) => setReps(e.target.value)} min={0} />
            </div>
            <div className="space-y-1">
               <Label className="text-xs">Carga (kg)</Label>
               <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} min={0} step={0.5} />
            </div>
         </div>
         <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={handleSave} disabled={!exerciseId || saving}>
               {saving ? 'Salvando...' : 'Salvar Série'}
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel}>
               Cancelar
            </Button>
         </div>
      </div>
   );
}
