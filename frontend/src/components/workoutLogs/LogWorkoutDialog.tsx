import { useEffect, useState } from 'react';
import { workoutLogApi } from '@/services/workoutLogService';
import { workoutPlanApi, type WorkoutPlan } from '@/services/workoutPlanService';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/stores/toastStore';
import { getApiErrorMessage } from '@/lib/api';

interface LogWorkoutDialogProps {
   open: boolean;
   onClose: () => void;
   onCreated: () => void;
}

export function LogWorkoutDialog({ open, onClose, onCreated }: LogWorkoutDialogProps) {
   const [plans, setPlans] = useState<WorkoutPlan[]>([]);
   const [selectedPlan, setSelectedPlan] = useState<string>('');
   const [notes, setNotes] = useState('');
   const [submitting, setSubmitting] = useState(false);
   const [error, setError] = useState('');

   const resetForm = () => {
      setSelectedPlan('');
      setNotes('');
      setError('');
   };

   const handleClose = () => {
      resetForm();
      onClose();
   };

   useEffect(() => {
      if (open) {
         workoutPlanApi.getAll({ limit: 50 }).then((res) => {
            setPlans(res.data.data as WorkoutPlan[]);
         }).catch(console.error);
      }
   }, [open]);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedPlan) return;
      setSubmitting(true);
      try {
         const now = new Date().toISOString();
         await workoutLogApi.create({
            workoutPlanId: selectedPlan,
            date: now,
            startTime: now,
            isComplete: false,
            notes: notes || undefined,
            exercises: [],
         });
         handleClose();
         onCreated();
         toast.success('Treino iniciado', 'Abra o treino no histórico para registrar suas séries.');
      } catch (err: unknown) {
         setError(getApiErrorMessage(err, 'Não foi possível iniciar o treino.'));
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <Dialog open={open} onClose={handleClose}>
         <DialogHeader>
            <DialogTitle>Iniciar treino</DialogTitle>
            <p className="text-sm text-muted-foreground">Escolha uma ficha e registre as séries conforme avança.</p>
         </DialogHeader>
         <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-field">
               <Label htmlFor="workout-plan">Ficha de treino</Label>
               <Select id="workout-plan" value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} required>
                  <option value="">Selecione uma ficha</option>
                  {plans.map((p) => (
                     <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
               </Select>
            </div>

            <div className="form-field">
               <Label htmlFor="workout-notes">Observações (opcional)</Label>
               <Textarea id="workout-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Como você está se sentindo hoje?" />
            </div>

            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
               <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
               <Button type="submit" disabled={!selectedPlan || submitting}>
                  {submitting ? 'Iniciando…' : 'Iniciar treino'}
               </Button>
            </div>
         </form>
      </Dialog>
   );
}
