import { useEffect, useState } from 'react';
import { workoutLogApi, type WorkoutLog } from '@/services/workoutLogService';
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
   onCreated: (log: WorkoutLog) => void;
}

export function LogWorkoutDialog({ open, onClose, onCreated }: LogWorkoutDialogProps) {
   const [plans, setPlans] = useState<WorkoutPlan[]>([]);
   const [selectedPlan, setSelectedPlan] = useState<string>('');
   const [mode, setMode] = useState<'plan' | 'free'>('plan');
   const [plansStatus, setPlansStatus] = useState<'loading' | 'ready' | 'error'>('loading');
   const [notes, setNotes] = useState('');
   const [submitting, setSubmitting] = useState(false);
   const [error, setError] = useState('');

   const resetForm = () => {
      setSelectedPlan('');
      setMode('plan');
      setNotes('');
      setError('');
   };

   const handleClose = () => {
      resetForm();
      onClose();
   };

   useEffect(() => {
      if (!open) return;
      let cancelled = false;
      setPlansStatus('loading');
      setPlans([]);
      workoutPlanApi.getAll({ limit: 50 }).then((res) => {
         if (cancelled) return;
         setPlans(res.data.data as WorkoutPlan[]);
         setPlansStatus('ready');
         if (res.data.data.length === 0) setMode('free');
      }).catch(() => { if (!cancelled) setPlansStatus('error'); });
      return () => { cancelled = true; };
   }, [open]);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if ((mode === 'plan' && !selectedPlan) || submitting) return;
      setSubmitting(true);
      setError('');
      try {
         const now = new Date().toISOString();
         const response = await workoutLogApi.create({
            workoutPlanId: mode === 'plan' ? selectedPlan : null,
            date: now,
            startTime: now,
            isComplete: false,
            notes: notes || undefined,
            exercises: [],
         });
         handleClose();
         onCreated(response.data.data);
         toast.success('Treino iniciado', 'Registre suas séries conforme avança.');
      } catch (err: unknown) {
         setError(getApiErrorMessage(err, 'Não foi possível iniciar o treino.'));
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <Dialog open={open} onClose={handleClose} dismissible={!submitting}>
         <DialogHeader>
            <DialogTitle>Iniciar treino</DialogTitle>
            <p className="text-sm text-muted-foreground">Use uma ficha ou registre os exercícios em um treino livre.</p>
         </DialogHeader>
         <form onSubmit={handleSubmit} className="space-y-5">
            <fieldset disabled={submitting} className="min-w-0 space-y-5">
            <div role="group" aria-label="Tipo de treino" className="grid grid-cols-2 gap-2 rounded-xl border border-border/60 bg-secondary/30 p-1">
               <Button type="button" variant={mode === 'plan' ? 'secondary' : 'ghost'} aria-pressed={mode === 'plan'} onClick={() => { setMode('plan'); setError(''); }}>Com ficha</Button>
               <Button type="button" variant={mode === 'free' ? 'secondary' : 'ghost'} aria-pressed={mode === 'free'} onClick={() => { setMode('free'); setError(''); }}>Treino livre</Button>
            </div>
            {mode === 'plan' ? <div className="form-field">
               <Label htmlFor="workout-plan">Ficha de treino</Label>
               <Select id="workout-plan" value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} required disabled={plansStatus !== 'ready' || plans.length === 0}>
                  <option value="">Selecione uma ficha</option>
                  {plans.map((p) => (
                     <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
               </Select>
               {plansStatus === 'loading' && <p role="status" className="text-xs text-muted-foreground">Carregando fichas…</p>}
               {plansStatus === 'error' && <p role="alert" className="text-sm text-destructive">Não foi possível carregar as fichas. Você pode iniciar um treino livre.</p>}
               {plansStatus === 'ready' && plans.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma ficha cadastrada. Use a opção Treino livre.</p>}
            </div> : <p className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-muted-foreground">Sem ficha vinculada. Após iniciar, selecione os exercícios do catálogo e registre as séries, repetições e cargas.</p>}

            <div className="form-field">
               <Label htmlFor="workout-notes">Observações (opcional)</Label>
               <Textarea id="workout-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Como você está se sentindo hoje?" />
            </div>

            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
               <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
               <Button type="submit" disabled={(mode === 'plan' && !selectedPlan) || submitting}>
                  {submitting ? 'Iniciando…' : 'Iniciar treino'}
               </Button>
            </div>
            </fieldset>
         </form>
      </Dialog>
   );
}
