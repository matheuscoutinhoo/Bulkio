import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { workoutLogApi, type WorkoutLog } from '@/services/workoutLogService';
import { workoutPlanApi, type WorkoutPlanExercise } from '@/services/workoutPlanService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ChevronDown, ChevronUp, Check, Trash2, Clock, CheckCircle, HelpCircle, History, Pencil, Search, Dumbbell } from 'lucide-react';
import { ExerciseDetailModal } from '@/components/exercises/ExerciseDetailModal';
import { ExerciseProgressionDialog } from '@/components/exercises/ExerciseProgressionDialog';
import { LogWorkoutDialog } from '@/components/workoutLogs/LogWorkoutDialog';
import { AddSetForm } from '@/components/workoutLogs/AddSetForm';
import { useRestTimerStore } from '@/stores/restTimerStore';
import { useAuthStore } from '@/stores/authStore';
import { EditSetForm } from '@/components/workoutLogs/EditSetForm';
import { formatKilograms } from '@/lib/workoutForm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { muscleGroupLabels } from '@/lib/exerciseLabels';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/feedback';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from '@/stores/toastStore';
import { SectionOverview, OverviewMetric } from '@/components/ui/section-overview';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { normalizeSearch } from '@/lib/search';

export default function WorkoutLogsPage() {
   const [searchParams] = useSearchParams();
   const [logs, setLogs] = useState<WorkoutLog[]>([]);
   const [loading, setLoading] = useState(true);
   const [loadError, setLoadError] = useState(false);
   const [expandedLog, setExpandedLog] = useState<string | null>(() => searchParams.get('workout'));
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
   const [editingSet, setEditingSet] = useState<string | null>(null);
   const [loadingPlan, setLoadingPlan] = useState(false);
   const [savingSet, setSavingSet] = useState(false);
   const [search, setSearch] = useState('');
   const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'complete'>('all');
   const visibleLogs = logs.filter(log => (statusFilter === 'all' || log.isComplete === (statusFilter === 'complete'))
      && normalizeSearch([log.workoutPlan?.name, log.notes, format(new Date(log.date), 'dd/MM/yyyy'), ...log.exercises.map(item => item.exercise.name)].join(' ')).includes(normalizeSearch(search)))
      .sort((a, b) => Number(a.isComplete) - Number(b.isComplete));

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
      setLoadingPlan(true);
      setPlanExercises([]);
      if (log.workoutPlan) {
         try {
            const res = await workoutPlanApi.getById(log.workoutPlan.id);
            setPlanExercises(res.data.data.exercises);
            setAddingSetFor(log.id);
         } catch (err) {
            console.error(err);
            toast.error('Não foi possível carregar os exercícios da ficha');
         } finally {
            setLoadingPlan(false);
         }
      } else {
         setLoadingPlan(false);
         toast.info('Este treino não possui uma ficha vinculada');
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
            notes: s.notes ?? undefined,
         })),
      }));

      const existingExIndex = existingExercises.findIndex((e) => e.exerciseId === exerciseId);
      if (existingExIndex >= 0) {
         const ex = existingExercises[existingExIndex];
         ex.sets.push({ setNumber: ex.sets.length + 1, reps, weight, notes: undefined });
      } else {
         existingExercises.push({
            exerciseId,
            order: existingExercises.length,
            notes: undefined,
            sets: [{ setNumber: 1, reps, weight, notes: undefined }],
         });
      }

      setSavingSet(true);
      try {
         const res = await workoutLogApi.update(logId, { exercises: existingExercises });
         setLogs((prev) => prev.map((l) => l.id === logId ? res.data.data : l));
      } finally {
         setSavingSet(false);
      }

      // Trigger rest timer
      const planEx = planExercises.find((pe) => pe.exerciseId === exerciseId);
      const userId = useAuthStore.getState().user?.id;
      if (userId && planEx && planEx.restSeconds > 0) {
         useRestTimerStore.getState().start(userId, planEx.restSeconds, planEx.exercise.name);
      }
      toast.success('Série registrada');
   };

   const handleUpdateSet = async (log: WorkoutLog, setId: string, reps: number, weight: number) => {
      const exercises = log.exercises.map((exercise) => ({
         exerciseId: exercise.exerciseId,
         order: exercise.order,
         notes: exercise.notes ?? undefined,
         sets: exercise.sets.map((set) => ({
            setNumber: set.setNumber,
            reps: set.id === setId ? reps : set.reps,
            weight: set.id === setId ? weight : set.weight,
            notes: set.notes ?? undefined,
         })),
      }));
      const res = await workoutLogApi.update(log.id, { exercises });
      setLogs((previous) => previous.map((entry) => entry.id === log.id ? res.data.data : entry));
      setEditingSet(null);
      toast.success('Série atualizada');
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
         <PageHeader title="Histórico de treinos" description="Sessões em andamento e concluídas, com séries, repetições e cargas." actions={<Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> Registrar treino</Button>} />

         {!loading && !loadError && logs.length > 0 && <>
            <SectionOverview icon={Dumbbell} eyebrow="Resumo" title="Sessões registradas" description="Repetições e cargas podem ser editadas em cada série, inclusive nos treinos concluídos.">
               <OverviewMetric value={logs.filter(log => !log.isComplete).length} label="em andamento nesta página" />
               <OverviewMetric value={logs.filter(log => log.isComplete).length} label="concluídos nesta página" />
            </SectionOverview>
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
               <div className="flex rounded-xl border border-border/60 bg-secondary/30 p-1" role="group" aria-label="Filtrar treinos por status">
                  {([['all', 'Todos'], ['active', 'Em andamento'], ['complete', 'Concluídos']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={statusFilter === value} onClick={() => setStatusFilter(value)} className={`min-h-11 flex-1 rounded-lg px-3 text-xs font-semibold transition-colors sm:text-sm ${statusFilter === value ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{label}</button>)}
               </div>
               <div className="relative w-full xl:max-w-sm"><Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" /><Input aria-label="Buscar treinos nesta página" className="pl-10" placeholder="Buscar ficha, exercício ou data" value={search} onChange={event => setSearch(event.target.value)} /></div>
            </div>
            {totalPages > 1 && <p className="text-xs text-muted-foreground">Busca e filtros aplicados aos treinos desta página.</p>}
         </>}

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
                  {visibleLogs.length === 0 && <EmptyState compact icon={Search} title="Nenhum treino encontrado" description="Tente outro termo ou selecione um status diferente." actionLabel="Limpar filtros" onAction={() => { setSearch(''); setStatusFilter('all'); }} />}
                  {visibleLogs.map((log) => (
                     <Card key={log.id} className={`overflow-hidden ${!log.isComplete ? 'border-primary/35 bg-primary/[0.025]' : ''}`}>
                        <CardHeader>
                           <div className="flex min-w-0 items-center justify-between gap-2">
                              <button
                                 type="button"
                                 className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg text-left"
                                 onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                 aria-expanded={expandedLog === log.id}
                                 aria-controls={`log-${log.id}`}
                              >
                                 {expandedLog === log.id ? (
                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                 ) : (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                 )}
                                 <div className="min-w-0">
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
                              <div className="flex shrink-0 gap-1">
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteTarget(log.id)}
                                    className="hover:text-destructive"
                                    aria-label="Excluir treino"
                                    disabled={editingSet !== null}
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
                                          <div className="flex items-start justify-between gap-2 mb-2">
                                             <div className="flex flex-wrap items-center gap-2 min-w-0">
                                                <button
                                                   type="button"
                                                   className="min-h-11 w-full text-left font-medium text-sm hover:text-primary transition-colors break-words sm:w-auto"
                                                   onClick={() => setProgressionExercise(logEx.exercise)}
                                                >
                                                   {logEx.exercise.name}
                                                </button>
                                                <Badge variant="outline" className="text-xs shrink-0">
                                                   {muscleGroupLabels[logEx.exercise.muscleGroup]}
                                                </Badge>
                                                <Button
                                                   variant="ghost"
                                                   size="icon"
                                                   className="h-11 w-11 shrink-0 hover:text-primary sm:h-8 sm:w-8"
                                                   onClick={() => setSelectedExercise(logEx.exercise)}
                                                   aria-label={`Ver detalhes de ${logEx.exercise.name}`}
                                                >
                                                   <HelpCircle className="h-3.5 w-3.5" />
                                                </Button>
                                             </div>
                                             <Badge className="shrink-0 bg-primary/10 text-gradient text-xs">
                                                {logEx.sets.length} {logEx.sets.length === 1 ? 'série' : 'séries'}
                                             </Badge>
                                          </div>
                                          <Table aria-label={`Séries de ${logEx.exercise.name}`} className="table-fixed [&_th]:px-1 [&_td]:px-1 sm:[&_th]:px-3 sm:[&_td]:px-3">
                                             <TableHeader><TableRow><TableHead className="w-10 sm:w-16">Série</TableHead><TableHead className="text-right">Reps</TableHead><TableHead className="text-right">Carga (kg)</TableHead><TableHead className="w-14 sm:w-20"><span className="sr-only">Ações</span></TableHead></TableRow></TableHeader>
                                             <TableBody>
                                             {logEx.sets.map((set) => (
                                                <TableRow key={set.id}>
                                                   {editingSet === set.id ? (
                                                      <TableCell colSpan={4}><EditSetForm set={set} onSave={(reps, weight) => handleUpdateSet(log, set.id, reps, weight)} onCancel={() => setEditingSet(null)} /></TableCell>
                                                   ) : (
                                                      <>
                                                         <TableCell className="text-muted-foreground tabular-nums">{set.setNumber}</TableCell>
                                                         <TableCell className="text-right font-medium tabular-nums">{set.reps}</TableCell>
                                                         <TableCell className="text-right font-medium tabular-nums break-words">{formatKilograms(set.weight)}</TableCell>
                                                         <TableCell><Button type="button" variant="ghost" size="icon" disabled={editingSet !== null || savingSet} onClick={() => setEditingSet(set.id)} aria-label={`Editar série ${set.setNumber} de ${logEx.exercise.name}`} className="text-primary">
                                                            <Pencil className="h-4 w-4" aria-hidden="true" />
                                                         </Button></TableCell>
                                                      </>
                                                   )}
                                                </TableRow>
                                             ))}
                                             </TableBody>
                                          </Table>
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
                                          disabled={editingSet !== null}
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
                                             disabled={editingSet !== null || loadingPlan}
                                          >
                                             <Plus className="h-4 w-4" /> {loadingPlan ? 'Carregando…' : 'Registrar série'}
                                          </Button>
                                          {log.exercises.length > 0 && (
                                             <Button
                                                variant="default"
                                                onClick={() => handleCompleteWorkout(log.id)}
                                                disabled={editingSet !== null}
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
                                    disabled={editingSet !== null}
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
            onCreated={(logId) => { setExpandedLog(logId); void fetchLogs(); }}
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

         <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Excluir treino do histórico?" description="As séries, cargas e recordes vinculados a este treino serão removidos. Esta ação não pode ser desfeita." />
      </div>
   );
}
