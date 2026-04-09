import { useEffect, useState, useCallback } from 'react';
import { workoutLogApi, type WorkoutLog } from '@/services/workoutLogService';
import { workoutPlanApi, type WorkoutPlanExercise } from '@/services/workoutPlanService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Plus, ChevronDown, ChevronUp, Check, Trash2, Clock, CheckCircle, HelpCircle } from 'lucide-react';
import { ExerciseDetailModal } from '@/components/exercises/ExerciseDetailModal';
import { ExerciseProgressionDialog } from '@/components/exercises/ExerciseProgressionDialog';
import { LogWorkoutDialog } from '@/components/workoutLogs/LogWorkoutDialog';
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
   const [progressionExercise, setProgressionExercise] = useState<{ id: string; name: string; muscleGroup: string } | null>(null);

   // Add set form state
   const [addingSetFor, setAddingSetFor] = useState<string | null>(null);
   const [planExercises, setPlanExercises] = useState<WorkoutPlanExercise[]>([]);
   const [newSetExerciseId, setNewSetExerciseId] = useState('');
   const [newSetReps, setNewSetReps] = useState('10');
   const [newSetWeight, setNewSetWeight] = useState('0');
   const [savingSet, setSavingSet] = useState(false);

   const fetchLogs = useCallback(async (silent = false) => {
      if (!silent) setLoading(true);
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
         fetchLogs(true);
      } catch (err) {
         console.error(err);
      }
   };

   const handleStartAddSet = async (log: WorkoutLog) => {
      if (addingSetFor === log.id) {
         setAddingSetFor(null);
         return;
      }
      setAddingSetFor(log.id);
      setNewSetExerciseId('');
      setNewSetReps('10');
      setNewSetWeight('0');
      if (log.workoutPlan) {
         try {
            const res = await workoutPlanApi.getById(log.workoutPlan.id);
            setPlanExercises(res.data.data.exercises);
         } catch (err) {
            console.error(err);
            setPlanExercises([]);
         }
      }
   };

   const handleSaveSet = async (logId: string) => {
      const log = logs.find((l) => l.id === logId);
      if (!log || !newSetExerciseId) return;
      const reps = parseInt(newSetReps) || 0;
      const weight = parseFloat(newSetWeight) || 0;
      setSavingSet(true);
      try {
         // Build updated exercises array
         const existingExercises = log.exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            order: ex.order,
            notes: ex.notes ?? undefined,
            sets: ex.sets.map((s) => ({
               setNumber: s.setNumber,
               reps: s.reps,
               weight: s.weight,
            })),
         }));

         const existingExIndex = existingExercises.findIndex((e) => e.exerciseId === newSetExerciseId);
         if (existingExIndex >= 0) {
            // Add set to existing exercise
            const ex = existingExercises[existingExIndex];
            ex.sets.push({
               setNumber: ex.sets.length + 1,
               reps,
               weight,
            });
         } else {
            // Add new exercise entry
            existingExercises.push({
               exerciseId: newSetExerciseId,
               order: existingExercises.length,
               notes: undefined,
               sets: [{ setNumber: 1, reps, weight }],
            });
         }

         const res = await workoutLogApi.update(logId, { exercises: existingExercises });
         setLogs((prev) => prev.map((l) => l.id === logId ? res.data.data : l));
         setNewSetReps('10');
         setNewSetWeight('0');
      } catch (err) {
         console.error(err);
      } finally {
         setSavingSet(false);
      }
   };

   const handleCompleteWorkout = async (logId: string) => {
      try {
         const now = new Date().toISOString();
         const res = await workoutLogApi.update(logId, { isComplete: true, endTime: now });
         setLogs((prev) => prev.map((l) => l.id === logId ? res.data.data : l));
         setAddingSetFor(null);
      } catch (err) {
         console.error(err);
      }
   };

   const handleReopenWorkout = async (logId: string) => {
      try {
         const res = await workoutLogApi.update(logId, { isComplete: false, endTime: null });
         setLogs((prev) => prev.map((l) => l.id === logId ? res.data.data : l));
      } catch (err) {
         console.error(err);
      }
   };

   return (
      <div className="space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
               <h1 className="text-2xl sm:text-3xl font-bold">Histórico de Treinos</h1>
               <p className="text-muted-foreground text-sm sm:text-base">Todos os treinos realizados</p>
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
               <CardContent className="p-5 sm:p-6 py-12 text-center">
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
                                    <div className="flex flex-wrap items-center gap-2">
                                       <CardTitle className="text-sm sm:text-base">
                                          {format(new Date(log.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                                       </CardTitle>
                                       {log.isComplete ? (
                                          <Badge className="bg-success/20 text-success text-xs">
                                             <Check className="h-3 w-3 mr-1" /> Completo
                                          </Badge>
                                       ) : (
                                          <Badge variant="outline" className="text-xs">Em andamento</Badge>
                                       )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                                       {log.workoutPlan && (
                                          <span>{log.workoutPlan.name}</span>
                                       )}
                                       {log.exercises.length > 0 && (
                                          <span>{log.exercises.length} exercícios</span>
                                       )}
                                       {log.exercises.length > 0 && (
                                          <span>{log.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)} séries</span>
                                       )}
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
                              <div className="flex gap-1">
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(log.id)}
                                    className="hover:text-primary"
                                 >
                                    <Trash2 className="h-4 w-4" />
                                 </Button>
                              </div>
                           </div>
                        </CardHeader>
                        {expandedLog === log.id && (
                           <CardContent>
                              {log.notes && (
                                 <p className="text-sm text-muted-foreground mb-3 p-2 bg-secondary/30 rounded">
                                    📝 {log.notes}
                                 </p>
                              )}

                              {/* Sets visual dashboard */}
                              {log.exercises.length > 0 ? (
                                 <div className="space-y-3 mb-4">
                                    {log.exercises.map((logEx) => (
                                       <div key={logEx.id} className="p-3 rounded-lg bg-secondary/30">
                                          <div className="flex items-center justify-between gap-2 mb-2">
                                             <div className="flex items-center gap-2 min-w-0">
                                                <span
                                                   className="font-medium text-sm cursor-pointer hover:text-primary transition-colors truncate"
                                                   onClick={() => setProgressionExercise(logEx.exercise)}
                                                >
                                                   {logEx.exercise.name}
                                                </span>
                                                <Badge variant="outline" className="text-xs shrink-0">
                                                   {muscleGroupLabels[logEx.exercise.muscleGroup]}
                                                </Badge>
                                                <Button
                                                   variant="ghost"
                                                   size="icon"
                                                   className="h-6 w-6 shrink-0 hover:text-primary"
                                                   onClick={() => setSelectedExercise(logEx.exercise)}
                                                >
                                                   <HelpCircle className="h-3.5 w-3.5" />
                                                </Button>
                                             </div>
                                             <Badge className="bg-primary/10 text-primary text-xs">
                                                {logEx.sets.length} {logEx.sets.length === 1 ? 'série' : 'séries'}
                                             </Badge>
                                          </div>
                                          <div className="grid grid-cols-3 gap-1 text-xs text-muted-foreground font-medium mb-1">
                                             <span>Série</span>
                                             <span>Reps</span>
                                             <span>Carga (kg)</span>
                                          </div>
                                          {logEx.sets.map((set) => (
                                             <div key={set.id} className="grid grid-cols-3 gap-1 text-sm py-1 border-t border-border/50">
                                                <span className="text-muted-foreground">{set.setNumber}</span>
                                                <span className="font-medium">{set.reps}</span>
                                                <span className="font-medium">{set.weight}kg</span>
                                             </div>
                                          ))}
                                       </div>
                                    ))}
                                 </div>
                              ) : (
                                 <p className="text-sm text-muted-foreground text-center py-4 mb-4">
                                    Nenhuma série registrada ainda. Comece registrando sua primeira série!
                                 </p>
                              )}

                              {/* Actions */}
                              {!log.isComplete ? (
                                 <div className="space-y-3">
                                    {addingSetFor === log.id ? (
                                       <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
                                          <div className="space-y-2">
                                             <Label className="text-xs">Exercício</Label>
                                             <Select
                                                value={newSetExerciseId}
                                                onChange={(e) => setNewSetExerciseId(e.target.value)}
                                             >
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
                                                <Input
                                                   type="number"
                                                   value={newSetReps}
                                                   onChange={(e) => setNewSetReps(e.target.value)}
                                                   min={0}
                                                />
                                             </div>
                                             <div className="space-y-1">
                                                <Label className="text-xs">Carga (kg)</Label>
                                                <Input
                                                   type="number"
                                                   value={newSetWeight}
                                                   onChange={(e) => setNewSetWeight(e.target.value)}
                                                   min={0}
                                                   step={0.5}
                                                />
                                             </div>
                                          </div>
                                          <div className="flex gap-2">
                                             <Button
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleSaveSet(log.id)}
                                                disabled={!newSetExerciseId || savingSet}
                                             >
                                                {savingSet ? 'Salvando...' : 'Salvar Série'}
                                             </Button>
                                             <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setAddingSetFor(null)}
                                             >
                                                Cancelar
                                             </Button>
                                          </div>
                                       </div>
                                    ) : (
                                       <div className="flex gap-2">
                                          <Button
                                             variant="outline"
                                             className="flex-1"
                                             onClick={() => handleStartAddSet(log)}
                                          >
                                             <Plus className="h-4 w-4 mr-2" /> Registrar Série
                                          </Button>
                                          {log.exercises.length > 0 && (
                                             <Button
                                                variant="default"
                                                onClick={() => handleCompleteWorkout(log.id)}
                                             >
                                                <CheckCircle className="h-4 w-4 mr-2" /> Finalizar
                                             </Button>
                                          )}
                                       </div>
                                    )}
                                 </div>
                              ) : (
                                 <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-2"
                                    onClick={() => handleReopenWorkout(log.id)}
                                 >
                                    Reabrir Treino
                                 </Button>
                              )}
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

         <LogWorkoutDialog
            open={showCreate}
            onClose={() => setShowCreate(false)}
            onCreated={fetchLogs}
         />

         <ExerciseDetailModal
            exercise={selectedExercise}
            open={!!selectedExercise}
            onClose={() => setSelectedExercise(null)}
         />

         <ExerciseProgressionDialog
            exercise={progressionExercise}
            open={!!progressionExercise}
            onClose={() => setProgressionExercise(null)}
         />
      </div>
   );
}
