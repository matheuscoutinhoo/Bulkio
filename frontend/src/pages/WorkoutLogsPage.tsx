import { useEffect, useState, useCallback } from 'react';
import { workoutLogApi, type WorkoutLog } from '@/services/workoutLogService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ChevronDown, ChevronUp, Check, Trash2, Clock } from 'lucide-react';
import { ExerciseDetailModal } from '@/components/exercises/ExerciseDetailModal';
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
