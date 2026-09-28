import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getApiErrorMessage } from '@/lib/api';

interface GoalDialogProps {
   open: boolean;
   onClose: () => void;
   onSave: (data: { goal: string; initialWeight: string; targetWeight: string; height: string }) => Promise<void>;
   defaultValues?: { goal?: string | null; initialWeight?: number | null; targetWeight?: number | null; height?: number | null };
   latestWeight?: number;
}

export function GoalDialog({ open, onClose, onSave, defaultValues, latestWeight }: GoalDialogProps) {
   const [form, setForm] = useState({ goal: '', initialWeight: '', targetWeight: '', height: '' });
   const [submitting, setSubmitting] = useState(false);
   const [error, setError] = useState('');

   useEffect(() => {
      if (open) {
         setError('');
         setForm({
            goal: defaultValues?.goal || '',
            initialWeight: defaultValues?.initialWeight?.toString()
               || latestWeight?.toString() || '',
            targetWeight: defaultValues?.targetWeight?.toString() || '',
            height: defaultValues?.height?.toString() || '',
         });
      }
   }, [open, defaultValues, latestWeight]);

   const handleClose = () => {
      setForm({ goal: '', initialWeight: '', targetWeight: '', height: '' });
      onClose();
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      setError('');
      try {
         await onSave(form);
         handleClose();
      } catch (err: unknown) {
         setError(getApiErrorMessage(err, 'Não foi possível salvar sua meta.'));
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <Dialog open={open} onClose={handleClose} className="sm:max-w-md">
            <DialogHeader>
               <DialogTitle>Definir meta</DialogTitle>
               <p className="text-sm text-muted-foreground">Use estes dados para contextualizar sua evolução.</p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
               <div className="form-field">
                  <Label htmlFor="goal">Objetivo</Label>
                  <Select id="goal" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}>
                     <option value="">Selecione</option>
                     <option value="BULK">Ganho de Massa</option>
                     <option value="CUT">Perda de Gordura</option>
                     <option value="MAINTAIN">Manutenção</option>
                  </Select>
               </div>
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="form-field">
                     <Label htmlFor="initial-weight">Peso inicial (kg)</Label>
                     <Input
                        id="initial-weight"
                        type="number"
                        step="0.1"
                        value={form.initialWeight}
                        onChange={(e) => setForm({ ...form, initialWeight: e.target.value })}
                     />
                  </div>
                  <div className="form-field">
                     <Label htmlFor="target-weight">Peso alvo (kg)</Label>
                     <Input
                        id="target-weight"
                        type="number"
                        step="0.1"
                        value={form.targetWeight}
                        onChange={(e) => setForm({ ...form, targetWeight: e.target.value })}
                     />
                  </div>
               </div>
               <div className="form-field">
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input
                     id="height"
                     type="number"
                     step="1"
                     placeholder="Ex: 175"
                     value={form.height}
                     onChange={(e) => setForm({ ...form, height: e.target.value })}
                  />
               </div>
               {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
               <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>Cancelar</Button>
                  <Button type="submit" disabled={submitting}>{submitting ? 'Salvando…' : 'Salvar meta'}</Button>
               </div>
            </form>
      </Dialog>
   );
}
