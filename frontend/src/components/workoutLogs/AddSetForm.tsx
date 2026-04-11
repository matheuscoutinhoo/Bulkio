import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import type { WorkoutPlanExercise } from '@/services/workoutPlanService';

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
