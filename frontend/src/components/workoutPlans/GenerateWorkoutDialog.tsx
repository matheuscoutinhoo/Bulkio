import { useState } from 'react';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { workoutPlanApi } from '@/services/workoutPlanService';
import { Sparkles, Loader2 } from 'lucide-react';

interface GenerateWorkoutDialogProps {
   open: boolean;
   onClose: () => void;
   onGenerated: () => void;
}

const levelLabels: Record<string, string> = {
   BEGINNER: 'Iniciante',
   INTERMEDIATE: 'Intermediário',
   ADVANCED: 'Avançado',
};

export function GenerateWorkoutDialog({ open, onClose, onGenerated }: GenerateWorkoutDialogProps) {
   const [level, setLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');
   const [focus, setFocus] = useState('');
   const [description, setDescription] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   const resetForm = () => {
      setLevel('INTERMEDIATE');
      setFocus('');
      setDescription('');
      setError('');
   };

   const handleClose = () => {
      resetForm();
      onClose();
   };

   const handleGenerate = async () => {
      setLoading(true);
      setError('');
      try {
         await workoutPlanApi.generate({
            level,
            focus: focus.trim(),
            description: description.trim() || undefined,
         });
         onGenerated();
         handleClose();
      } catch (err: any) {
         setError(err?.response?.data?.message || 'Erro ao gerar ficha. Tente novamente.');
      } finally {
         setLoading(false);
      }
   };

   return (
      <Dialog open={open} onClose={handleClose} className="sm:max-w-md">
         <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
               <Sparkles className="h-5 w-5 icon-gradient" />
               Gerar Ficha com IA
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
               Configure suas preferências e deixe a IA criar sua ficha de treino.
            </p>
         </DialogHeader>

         <div className="space-y-4 py-2">
            <div className="space-y-2">
               <Label>Nível</Label>
               <Select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as typeof level)}
               >
                  {Object.entries(levelLabels).map(([value, label]) => (
                     <option key={value} value={value}>{label}</option>
                  ))}
               </Select>
            </div>

            <div className="space-y-2">
               <Label>Foco muscular</Label>
               <Input
                  placeholder="Ex: Peito e costas, Pernas, Superior..."
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  maxLength={100}
               />
            </div>

            <div className="space-y-2">
               <Label>Preferências <span className="text-muted-foreground font-normal">(opcional)</span></Label>
               <textarea
                  className="flex w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Ex: Prefiro exercícios com halteres, tenho lesão no ombro..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={3}
               />
            </div>

            {error && (
               <p className="text-sm text-destructive">{error}</p>
            )}
         </div>

         <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
               Cancelar
            </Button>
            <Button onClick={handleGenerate} disabled={loading || !focus.trim()}>
               {loading ? (
                  <>
                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                     Gerando...
                  </>
               ) : (
                  <>
                     <Sparkles className="h-4 w-4 mr-2" />
                     Gerar Ficha
                  </>
               )}
            </Button>
         </div>
      </Dialog>
   );
}
