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
   const [daysPerWeek, setDaysPerWeek] = useState(4);
   const [level, setLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');
   const [focus, setFocus] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   const handleGenerate = async () => {
      setLoading(true);
      setError('');
      try {
         await workoutPlanApi.generate({
            daysPerWeek,
            level,
            focus: focus.trim() || undefined,
         });
         onGenerated();
         onClose();
      } catch (err: any) {
         setError(err?.response?.data?.message || 'Erro ao gerar fichas. Tente novamente.');
      } finally {
         setLoading(false);
      }
   };

   return (
      <Dialog open={open} onClose={onClose} className="sm:max-w-md">
         <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
               <Sparkles className="h-5 w-5 icon-gradient" />
               Gerar Fichas com IA
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
               Configure suas preferências e deixe a IA criar suas fichas de treino.
            </p>
         </DialogHeader>

         <div className="space-y-4 py-2">
            <div className="space-y-2">
               <Label>Dias por Semana</Label>
               <Select
                  value={String(daysPerWeek)}
                  onChange={(e) => setDaysPerWeek(Number(e.target.value))}
               >
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                     <option key={n} value={n}>{n} {n === 1 ? 'dia' : 'dias'}</option>
                  ))}
               </Select>
            </div>

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
               <Label>Foco muscular <span className="text-muted-foreground font-normal">(opcional)</span></Label>
               <Input
                  placeholder="Ex: Peito e costas, Pernas, Superior..."
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  maxLength={100}
               />
            </div>

            {error && (
               <p className="text-sm text-destructive">{error}</p>
            )}
         </div>

         <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
               Cancelar
            </Button>
            <Button onClick={handleGenerate} disabled={loading}>
               {loading ? (
                  <>
                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                     Gerando...
                  </>
               ) : (
                  <>
                     <Sparkles className="h-4 w-4 mr-2" />
                     Gerar Fichas
                  </>
               )}
            </Button>
         </div>
      </Dialog>
   );
}
