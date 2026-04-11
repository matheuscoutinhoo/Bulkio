import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

interface GoalDialogProps {
   open: boolean;
   onClose: () => void;
   onSave: (data: { goal: string; initialWeight: string; targetWeight: string; height: string }) => Promise<void>;
   defaultValues?: { goal?: string | null; initialWeight?: number | null; targetWeight?: number | null; height?: number | null };
   latestWeight?: number;
}

export function GoalDialog({ open, onClose, onSave, defaultValues, latestWeight }: GoalDialogProps) {
   const [form, setForm] = useState({ goal: '', initialWeight: '', targetWeight: '', height: '' });

   useEffect(() => {
      if (open) {
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
      await onSave(form);
      handleClose();
   };

   if (!open) return null;

   return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center">
         <div className="fixed inset-0 bg-black/80 animate-fade-in" onClick={handleClose} />
         <div className="relative z-50 w-[calc(100%-2rem)] sm:w-full max-w-md rounded-lg border bg-background p-4 sm:p-6 shadow-lg mx-auto animate-scale-in">
            <h2 className="text-lg font-semibold mb-4">Definir Meta</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="space-y-2">
                  <Label>Objetivo</Label>
                  <Select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}>
                     <option value="">Selecione</option>
                     <option value="BULK">Ganho de Massa</option>
                     <option value="CUT">Perda de Gordura</option>
                     <option value="MAINTAIN">Manutenção</option>
                  </Select>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                     <Label>Peso Inicial (kg)</Label>
                     <Input
                        type="number"
                        step="0.1"
                        value={form.initialWeight}
                        onChange={(e) => setForm({ ...form, initialWeight: e.target.value })}
                     />
                  </div>
                  <div className="space-y-2">
                     <Label>Peso Alvo (kg)</Label>
                     <Input
                        type="number"
                        step="0.1"
                        value={form.targetWeight}
                        onChange={(e) => setForm({ ...form, targetWeight: e.target.value })}
                     />
                  </div>
               </div>
               <div className="space-y-2">
                  <Label>Altura (cm)</Label>
                  <Input
                     type="number"
                     step="1"
                     placeholder="Ex: 175"
                     value={form.height}
                     onChange={(e) => setForm({ ...form, height: e.target.value })}
                  />
               </div>
               <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
                  <Button type="submit">Salvar</Button>
               </div>
            </form>
         </div>
      </div>,
      document.body,
   );
}
