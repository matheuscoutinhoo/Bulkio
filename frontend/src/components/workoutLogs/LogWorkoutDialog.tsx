import { useEffect, useState } from 'react';
import { workoutLogApi } from '@/services/workoutLogService';
import { workoutPlanApi, type WorkoutPlan } from '@/services/workoutPlanService';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

   const resetForm = () => {
      setSelectedPlan('');
      setNotes('');
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
      } catch (err) {
         console.error(err);
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <Dialog open={open} onClose={handleClose}>
         <DialogHeader>
            <DialogTitle>Registrar Treino</DialogTitle>
         </DialogHeader>
         <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
               <Label>Ficha de Treino</Label>
               <Select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} required>
                  <option value="">Selecione uma ficha</option>
                  {plans.map((p) => (
                     <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
               </Select>
            </div>

            <div className="space-y-2">
               <Label>Observações (opcional)</Label>
               <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anotações do treino..." />
            </div>

            <div className="flex justify-end gap-2 pt-2">
               <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
               <Button type="submit" disabled={!selectedPlan || submitting}>
                  {submitting ? 'Criando...' : 'Iniciar Treino'}
               </Button>
            </div>
         </form>
      </Dialog>
   );
}
