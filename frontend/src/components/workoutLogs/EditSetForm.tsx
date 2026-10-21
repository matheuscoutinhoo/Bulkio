import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getApiErrorMessage } from '@/lib/api';
import { formatNumberInput, parseOptionalNonNegativeNumber } from '@/lib/workoutForm';
import type { WorkoutLogSet } from '@/services/workoutLogService';

interface EditSetFormProps {
   set: WorkoutLogSet;
   onSave: (reps: number, weight: number) => Promise<void>;
   onCancel: () => void;
}

export function EditSetForm({ set, onSave, onCancel }: EditSetFormProps) {
   const id = useId();
   const [reps, setReps] = useState(String(set.reps));
   const [weight, setWeight] = useState(formatNumberInput(set.weight));
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState('');
   const parsedReps = Number(reps);
   const parsedWeight = parseOptionalNonNegativeNumber(weight);
   const canSave = reps.trim() !== '' && Number.isInteger(parsedReps) && parsedReps >= 0 && parsedWeight != null;

   const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      if (!canSave || parsedWeight == null || saving) return;
      setSaving(true);
      setError('');
      try {
         await onSave(parsedReps, parsedWeight);
      } catch (err) {
         setError(getApiErrorMessage(err, 'Não foi possível atualizar a série. Tente novamente.'));
      } finally {
         setSaving(false);
      }
   };

   return (
      <form onSubmit={handleSubmit} aria-label={`Editar série ${set.setNumber}`} className="space-y-3 rounded-xl border border-primary/30 bg-background p-3">
         <p className="text-sm font-semibold">Editar série {set.setNumber}</p>
         <fieldset disabled={saving} className="grid min-w-0 grid-cols-2 gap-3">
            <div className="form-field">
               <Label htmlFor={`${id}-reps`}>Repetições</Label>
               <Input id={`${id}-reps`} type="number" inputMode="numeric" min={0} step={1} required autoFocus value={reps} onChange={(event) => setReps(event.target.value)} />
            </div>
            <div className="form-field">
               <Label htmlFor={`${id}-weight`}>Carga (kg)</Label>
               <Input id={`${id}-weight`} type="text" inputMode="decimal" required value={weight} onChange={(event) => setWeight(event.target.value)} />
            </div>
         </fieldset>
         {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
         <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" disabled={saving} onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={!canSave || saving}>{saving ? 'Salvando…' : 'Salvar série'}</Button>
         </div>
      </form>
   );
}
