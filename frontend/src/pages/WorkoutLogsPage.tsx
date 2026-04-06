import { useEffect, useState, useCallback, useRef } from 'react';
import { workoutLogApi, type WorkoutLog, type CreateWorkoutLogData } from '@/services/workoutLogService';
import { workoutPlanApi, type WorkoutPlan } from '@/services/workoutPlanService';
import { exerciseApi, type Exercise } from '@/services/exerciseService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, ChevronDown, ChevronUp, Check, Trash2, Clock } from 'lucide-react';
import { ExerciseDetailModal } from '@/components/exercises/ExerciseDetailModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { muscleGroupLabels } from '@/lib/exerciseLabels';

export default function WorkoutLogsPage() {
   const [logs, setLogs] = useState<WorkoutLog[]>([]);
   const [loading, setLoading] = useState(true);
   const [expandedLog, setExpandedLog] = useState<string | null>(null);
   const [showCreate, setShowCreate] = useState(false);
   const [page, setPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [selectedExercise, setSelectedExercise] = useState<{ id: string; name: string; muscleGroup: string; type?: string; equipment?: string } | null>(null);

   const fetchLogs = useCallback(async () => {
      setLoading(true);
      try {
         const res = await workoutLogApi.getAll({ page, limit: 20 });
         setLogs(res.data.data);
         setTotalPages(res.data.pagination.totalPages);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   }, [page]);

   useEffect(() => { fetchLogs(); }, [fetchLogs]);

   const handleDelete = async (id: string) => {
      try {
         await workoutLogApi.delete(id);
         fetchLogs();
      } catch (err) {
         console.error(err);
      }
   };

   return (
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold">Histórico de Treinos</h1>
               <p className="text-muted-foreground">Todos os treinos realizados</p>
            </div>
            <Button onClick={() => setShowCreate(true)}>
               <Plus className="h-4 w-4 mr-2" /> Registrar Treino
            </Button>
         </div>

         {loading ? (
            <div className="flex justify-center py-12">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
         ) : logs.length === 0 ? (
            <Card>
               <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Nenhum treino registrado ainda.</p>
                  <Button className="mt-4" onClick={() => setShowCreate(true)}>
                     Registrar Primeiro Treino
                  </Button>
               </CardContent>
            </Card>
         ) : (
            <>
               <div className="space-y-3">
                  {logs.map((log) => (
                     <Card key={log.id}>
                        <CardHeader className="pb-3">
                           <div className="flex items-center justify-between">
                              <div
                                 className="flex items-center gap-3 cursor-pointer flex-1"
                                 onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                              >
                                 {expandedLog === log.id ? (
                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                 ) : (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                 )}
                                 <div>
                                    <div className="flex items-center gap-2">
                                       <CardTitle className="text-base">
                                          {format(new Date(log.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                                       </CardTitle>
                                       {log.isComplete ? (
                                          <Badge className="bg-success/20 text-success text-xs">
                                             <Check className="h-3 w-3 mr-1" /> Completo
                                          </Badge>
                                       ) : (
                                          <Badge variant="outline" className="text-xs">Incompleto</Badge>
                                       )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                       {log.workoutPlan && (
                                          <span>{log.workoutPlan.name}</span>
                                       )}
                                       <span>{log.exercises.length} exercícios</span>
                                       {log.startTime && log.endTime && (
                                          <span className="flex items-center gap-1">
                                             <Clock className="h-3 w-3" />
                                             {Math.round(
                                                (new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / 60000,
                                             )}min
                                          </span>
                                       )}
                                    </div>
                                 </div>
                              </div>
                              <Button
                                 variant="ghost"
                                 size="icon"
                                 onClick={() => handleDelete(log.id)}
                                 className="text-destructive hover:text-destructive"
                              >
                                 <Trash2 className="h-4 w-4" />
                              </Button>
                           </div>
                        </CardHeader>
                        {expandedLog === log.id && (
                           <CardContent>
                              {log.notes && (
                                 <p className="text-sm text-muted-foreground mb-3 p-2 bg-secondary/30 rounded">
                                    📝 {log.notes}
                                 </p>
                              )}
                              <div className="space-y-3">
                                 {log.exercises.map((logEx) => (
                                    <div key={logEx.id} className="p-3 rounded-lg bg-secondary/30">
                                       <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-2">
                                             <span className="font-medium text-sm cursor-pointer hover:text-primary transition-colors" onClick={() => setSelectedExercise(logEx.exercise)}>{logEx.exercise.name}</span>
                                             <Badge variant="outline" className="text-xs">
                                                {muscleGroupLabels[logEx.exercise.muscleGroup]}
                                             </Badge>
                                          </div>
                                       </div>
                                       <div className="grid grid-cols-3 gap-1 text-xs text-muted-foreground font-medium mb-1">
                                          <span>Série</span>
                                          <span>Reps</span>
                                          <span>Carga (kg)</span>
                                       </div>
                                       {logEx.sets.map((set) => (
                                          <div key={set.id} className="grid grid-cols-3 gap-1 text-sm py-1 border-t border-border/50">
                                             <span>{set.setNumber}</span>
                                             <span>{set.reps}</span>
                                             <span>{set.weight}</span>
                                          </div>
                                       ))}
                                       {logEx.notes && (
                                          <p className="text-xs text-muted-foreground mt-1">💬 {logEx.notes}</p>
                                       )}
                                    </div>
                                 ))}
                              </div>
                           </CardContent>
                        )}
                     </Card>
                  ))}
               </div>

               {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                     <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                        Anterior
                     </Button>
                     <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
                     <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                        Próxima
                     </Button>
                  </div>
               )}
            </>
         )}

         <LogWorkoutDialog open={showCreate} onClose={() => setShowCreate(false)} onCreated={fetchLogs} />

         <ExerciseDetailModal
            exercise={selectedExercise}
            open={!!selectedExercise}
            onClose={() => setSelectedExercise(null)}
         />
      </div>
   );
}

interface LogExercise {
   exerciseId: string;
   exerciseName: string;
   sets: { setNumber: number; reps: number; weight: number }[];
}

function LogWorkoutDialog({
   open,
   onClose,
   onCreated,
}: {
   open: boolean;
   onClose: () => void;
   onCreated: () => void;
}) {
   const [plans, setPlans] = useState<WorkoutPlan[]>([]);
   const [selectedPlan, setSelectedPlan] = useState<string>('');
   const [exercises, setExercises] = useState<LogExercise[]>([]);
   const [allExercises, setAllExercises] = useState<Exercise[]>([]);
   const [searchExercise, setSearchExercise] = useState('');
   const [showDropdown, setShowDropdown] = useState(false);
   const [notes, setNotes] = useState('');
   const [isComplete, setIsComplete] = useState(true);
   const [submitting, setSubmitting] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);

   const resetForm = () => {
      setSelectedPlan('');
      setExercises([]);
      setSearchExercise('');
      setShowDropdown(false);
      setNotes('');
      setIsComplete(true);
   };

   const handleClose = () => {
      resetForm();
      onClose();
   };

   useEffect(() => {
      if (open) {
         workoutPlanApi.getAll({ limit: 50 }).then((res) => setPlans(res.data.data)).catch(console.error);
         exerciseApi.getAll({ limit: 300 })
            .then((res) => setAllExercises(res.data.data))
            .catch((err) => console.error('Failed to load exercises:', err));
      }
   }, [open]);

   useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
         if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
            setShowDropdown(false);
         }
      }
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   const loadFromPlan = (planId: string) => {
      setSelectedPlan(planId);
      const plan = plans.find((p) => p.id === planId);
      if (plan) {
         setExercises(
            plan.exercises.map((pe) => ({
               exerciseId: pe.exercise.id,
               exerciseName: pe.exercise.name,
               sets: Array.from({ length: pe.sets }, (_, i) => ({
                  setNumber: i + 1,
                  reps: parseInt(pe.reps) || 10,
                  weight: 0,
               })),
            })),
         );
      }
   };

   const addExercise = (exercise: Exercise) => {
      setExercises((prev) => [
         ...prev,
         {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            sets: [{ setNumber: 1, reps: 10, weight: 0 }],
         },
      ]);
      setSearchExercise('');
      setShowDropdown(false);
   };

   const removeExercise = (index: number) => {
      setExercises((prev) => prev.filter((_, i) => i !== index));
   };

   const addSet = (exerciseIndex: number) => {
      setExercises((prev) =>
         prev.map((e, i) =>
            i === exerciseIndex
               ? {
                  ...e,
                  sets: [
                     ...e.sets,
                     {
                        setNumber: e.sets.length + 1,
                        reps: e.sets[e.sets.length - 1]?.reps || 10,
                        weight: e.sets[e.sets.length - 1]?.weight || 0,
                     },
                  ],
               }
               : e,
         ),
      );
   };

   const updateSet = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: number) => {
      setExercises((prev) =>
         prev.map((e, i) =>
            i === exerciseIndex
               ? {
                  ...e,
                  sets: e.sets.map((s, si) =>
                     si === setIndex ? { ...s, [field]: value } : s,
                  ),
               }
               : e,
         ),
      );
   };

   const removeSet = (exerciseIndex: number, setIndex: number) => {
      setExercises((prev) =>
         prev.map((e, i) =>
            i === exerciseIndex
               ? {
                  ...e,
                  sets: e.sets
                     .filter((_, si) => si !== setIndex)
                     .map((s, si) => ({ ...s, setNumber: si + 1 })),
               }
               : e,
         ),
      );
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (exercises.length === 0) return;
      setSubmitting(true);
      try {
         const now = new Date().toISOString();
         await workoutLogApi.create({
            workoutPlanId: selectedPlan || undefined,
            date: now,
            startTime: now,
            endTime: undefined,
            isComplete,
            notes: notes || undefined,
            exercises: exercises.map((ex, i) => ({
               exerciseId: ex.exerciseId,
               order: i,
               sets: ex.sets,
            })),
         });
         setExercises([]);
         setNotes('');
         setSelectedPlan('');
         handleClose();
         onCreated();
      } catch (err) {
         console.error(err);
      } finally {
         setSubmitting(false);
      }
   };

   const filteredExercises = allExercises.filter(
      (e) => e.name.toLowerCase().includes(searchExercise.toLowerCase()),
   );

   return (
      <Dialog open={open} onClose={handleClose} className="max-w-2xl">
         <DialogHeader>
            <DialogTitle>Registrar Treino</DialogTitle>
         </DialogHeader>
         <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Plan selection */}
            <div className="space-y-2">
               <Label>Carregar de ficha (opcional)</Label>
               <Select value={selectedPlan} onChange={(e) => loadFromPlan(e.target.value)}>
                  <option value="">Treino livre</option>
                  {plans.map((p) => (
                     <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
               </Select>
            </div>

            {/* Add exercise */}
            <div className="space-y-2">
               <Label>Adicionar Exercício</Label>
               <div className="relative" ref={dropdownRef}>
                  <Input
                     placeholder="Buscar exercício..."
                     value={searchExercise}
                     onChange={(e) => { setSearchExercise(e.target.value); setShowDropdown(true); }}
                     onFocus={() => searchExercise && setShowDropdown(true)}
                  />
                  {showDropdown && searchExercise && (
                     <div className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto rounded-md border bg-background shadow-lg">
                        {filteredExercises.slice(0, 8).map((ex) => (
                           <button
                              key={ex.id}
                              type="button"
                              onClick={() => addExercise(ex)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                           >
                              {ex.name}
                           </button>
                        ))}
                        {filteredExercises.length === 0 && (
                           <p className="px-3 py-2 text-sm text-muted-foreground">Nenhum encontrado</p>
                        )}
                     </div>
                  )}
               </div>
            </div>

            {/* Exercise entries */}
            {exercises.map((ex, ei) => (
               <div key={ei} className="p-3 rounded-lg border space-y-2">
                  <div className="flex items-center justify-between">
                     <span className="font-medium text-sm">{ex.exerciseName}</span>
                     <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeExercise(ei)}>
                        <Trash2 className="h-3 w-3" />
                     </Button>
                  </div>
                  <div className="grid grid-cols-[40px_1fr_1fr_40px] gap-1 text-xs text-muted-foreground font-medium">
                     <span>Série</span><span>Reps</span><span>Carga (kg)</span><span></span>
                  </div>
                  {ex.sets.map((set, si) => (
                     <div key={si} className="grid grid-cols-[40px_1fr_1fr_40px] gap-1 items-center">
                        <span className="text-sm text-center text-muted-foreground">{set.setNumber}</span>
                        <Input
                           type="number"
                           className="h-8 text-sm"
                           value={set.reps}
                           onChange={(e) => updateSet(ei, si, 'reps', parseInt(e.target.value) || 0)}
                           min={0}
                        />
                        <Input
                           type="number"
                           className="h-8 text-sm"
                           value={set.weight}
                           onChange={(e) => updateSet(ei, si, 'weight', parseFloat(e.target.value) || 0)}
                           min={0}
                           step={0.5}
                        />
                        <Button
                           type="button"
                           variant="ghost"
                           size="icon"
                           className="h-7 w-7"
                           onClick={() => removeSet(ei, si)}
                           disabled={ex.sets.length <= 1}
                        >
                           <Trash2 className="h-3 w-3" />
                        </Button>
                     </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => addSet(ei)}>
                     + Série
                  </Button>
               </div>
            ))}

            <div className="space-y-2">
               <Label>Observações (opcional)</Label>
               <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anotações do treino..." />
            </div>

            <div className="flex items-center gap-2">
               <input
                  type="checkbox"
                  id="isComplete"
                  checked={isComplete}
                  onChange={(e) => setIsComplete(e.target.checked)}
                  className="rounded"
               />
               <Label htmlFor="isComplete">Marcar como completo</Label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
               <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
               <Button type="submit" disabled={exercises.length === 0 || submitting}>
                  {submitting ? 'Salvando...' : 'Salvar Treino'}
               </Button>
            </div>
         </form>
      </Dialog>
   );
}
