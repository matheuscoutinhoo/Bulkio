import { useEffect, useState, useCallback } from 'react';
import { workoutLogApi, type WorkoutLog } from '@/services/workoutLogService';
import { workoutPlanApi, type WorkoutPlanExercise } from '@/services/workoutPlanService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ChevronDown, ChevronUp, Check, Trash2, Clock, CheckCircle, HelpCircle, History } from 'lucide-react';
import { ExerciseDetailModal } from '@/components/exercises/ExerciseDetailModal';
import { ExerciseProgressionDialog } from '@/components/exercises/ExerciseProgressionDialog';
import { LogWorkoutDialog } from '@/components/workoutLogs/LogWorkoutDialog';
import { AddSetForm } from '@/components/workoutLogs/AddSetForm';
import { RestTimer } from '@/components/workoutLogs/RestTimer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { muscleGroupLabels } from '@/lib/exerciseLabels';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/feedback';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from '@/stores/toastStore';

export default function WorkoutLogsPage() {
   const [logs, setLogs] = useState<WorkoutLog[]>([]);
   const [loading, setLoading] = useState(true);
   const [loadError, setLoadError] = useState(false);
   const [expandedLog, setExpandedLog] = useState<string | null>(null);
   const [showCreate, setShowCreate] = useState(false);
   const [page, setPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
   const [deleting, setDeleting] = useState(false);
   const [selectedExercise, setSelectedExercise] = useState<{ id: string; name: string; muscleGroup: string; type?: string; equipment?: string } | null>(null);
   const [progressionExercise, setProgressionExercise] = useState<{ id: string; name: string; muscleGroup: string } | null>(null);

   // Add set form state
   const [addingSetFor, setAddingSetFor] = useState<string | null>(null);
   const [planExercises, setPlanExercises] = useState<WorkoutPlanExercise[]>([]);

   // Rest timer state
   const [restTimer, setRestTimer] = useState<{ seconds: number; exerciseName: string } | null>(null);

   const fetchLogs = useCallback(async (silent = false) => {
      if (!silent) setLoading(true);
      setLoadError(false);
      try {
         const res = await workoutLogApi.getAll({ page, limit: 20 });
         setLogs(res.data.data);
         setTotalPages(res.data.pagination.totalPages);
      } catch (err) {
         console.error(err);
         setLoadError(true);
         toast.error('Não foi possível carregar o histórico');
      } finally {
         setLoading(false);
      }
   }, [page]);

   useEffect(() => { fetchLogs(); }, [fetchLogs]);

   const handleDelete = async () => {
      if (!deleteTarget) return;
      setDeleting(true);
      try {
         await workoutLogApi.delete(deleteTarget);
         setDeleteTarget(null);
         await fetchLogs(true);
         toast.success('Treino excluído do histórico');
      } catch (err) {
         console.error(err);
         toast.error('Não foi possível excluir o treino');
      } finally {
         setDeleting(false);
      }
   };

   const handleStartAddSet = async (log: WorkoutLog) => {
      if (addingSetFor === log.id) {
         setAddingSetFor(null);
         return;
      }
      setAddingSetFor(log.id);
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

   const handleSaveSet = async (logId: string, exerciseId: string, reps: number, weight: number) => {
      const log = logs.find((l) => l.id === logId);
      if (!log) return;

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

      const existingExIndex = existingExercises.findIndex((e) => e.exerciseId === exerciseId);
      if (existingExIndex >= 0) {
         const ex = existingExercises[existingExIndex];
         ex.sets.push({ setNumber: ex.sets.length + 1, reps, weight });
      } else {
         existingExercises.push({
            exerciseId,
            order: existingExercises.length,
            notes: undefined,
            sets: [{ setNumber: 1, reps, weight }],
         });
      }

      const res = await workoutLogApi.update(logId, { exercises: existingExercises });
      setLogs((prev) => prev.map((l) => l.id === logId ? res.data.data : l));

      // Trigger rest timer
      const planEx = planExercises.find((pe) => pe.exerciseId === exerciseId);
      if (planEx && planEx.restSeconds > 0) {
         setRestTimer({ seconds: planEx.restSeconds, exerciseName: planEx.exercise.name });
      }
      toast.success('Série registrada');
   };

   const handleCompleteWorkout = async (logId: string) => {
      try {
         const now = new Date().toISOString();
         const res = await workoutLogApi.update(logId, { isComplete: true, endTime: now });
         setLogs((prev) => prev.map((l) => l.id === logId ? res.data.data : l));
         setAddingSetFor(null);
         toast.success('Treino finalizado', 'Seu progresso e recordes foram atualizados.');
      } catch (err) {
         console.error(err);
         toast.error('Não foi possível finalizar o treino');
      }
   };

   const handleReopenWorkout = async (logId: string) => {
      try {
         const res = await workoutLogApi.update(logId, { isComplete: false, endTime: null });
         setLogs((prev) => prev.map((l) => l.id === logId ? res.data.data : l));
         toast.info('Treino reaberto');
      } catch (err) {
         console.error(err);
         toast.error('Não foi possível reabrir o treino');
      }
   };

   return (
      <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
         <PageHeader title="Histórico de treinos" description="Registre séries, acompanhe sessões em andamento e consulte sua evolução." actions={<Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> Registrar treino</Button>} />

         {loading ? (
            <LoadingState label="Carregando seu histórico" />
         ) : loadError ? (
            <ErrorState message="Não foi possível carregar seu histórico." onRetry={() => fetchLogs()} />
         ) : logs.length === 0 ? (
            <Card>
               <CardContent className="p-0">
                  <EmptyState icon={History} title="Seu histórico começa aqui" description="Registre um treino para acompanhar séries, cargas, duração e recordes pessoais." actionLabel="Registrar primeiro treino" onAction={() => setShowCreate(true)} />
               </CardContent>
            </Card>
         ) : (
            <>
               <div className="space-y-4">
                  {logs.map((log) => (
                     <Card key={log.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                           <div className="flex items-center justify-between">
                              <button
                                 type="button"
                                 className="flex min-h-11 flex-1 items-center gap-3 rounded-lg text-left"
                                 onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                 aria-expanded={expandedLog === log.id}
                                 aria-controls={`log-${log.id}`}
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
                              </button>
                              <div className="flex gap-1">
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteTarget(log.id)}
                                    className="hover:text-destructive"
                                    aria-label="Excluir treino"
                                 >
                                    <Trash2 className="h-4 w-4" />
                                 </Button>
                              </div>
                           </div>
                        </CardHeader>
                        {expandedLog === log.id && (
                           <CardContent id={`log-${log.id}`} className="animate-fade-in-down border-t border-border/60 pt-4 sm:pt-5">
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
                                                   aria-label={`Ver detalhes de ${logEx.exercise.name}`}
                                                >
                                                   <HelpCircle className="h-3.5 w-3.5" />
                                                </Button>
                                             </div>
                                             <Badge className="bg-primary/10 text-gradient text-xs">
                                                {logEx.sets.length} {logEx.sets.length === 1 ? 'série' : 'séries'}
                                             </Badge>
                                          </div>
                                          <div className="grid grid-cols-3 gap-1 px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-gradient">
                                             <span>Série</span>
                                             <span>Reps</span>
                                             <span>Carga (kg)</span>
                                          </div>
                                          <div className="divide-y divide-border/50">
                                             {logEx.sets.map((set) => (
                                                <div key={set.id} className="grid grid-cols-3 gap-1 px-2 py-1.5 text-sm">
                                                   <span className="text-muted-foreground">{set.setNumber}</span>
                                                   <span className="font-medium">{set.reps}</span>
                                                   <span className="font-medium">{set.weight}kg</span>
                                                </div>
                                             ))}
                                          </div>
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
                                       <AddSetForm
                                          planExercises={planExercises}
                                          onSave={(exerciseId, reps, weight) => handleSaveSet(log.id, exerciseId, reps, weight)}
                                          onCancel={() => setAddingSetFor(null)}
                                       />
                                    ) : (
                                       <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
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

         {restTimer && (
            <RestTimer
               initialSeconds={restTimer.seconds}
               exerciseName={restTimer.exerciseName}
               onClose={() => setRestTimer(null)}
            />
         )}

         <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Excluir treino do histórico?" description="As séries, cargas e recordes vinculados a este treino serão removidos. Esta ação não pode ser desfeita." />
      </div>
   );
}
