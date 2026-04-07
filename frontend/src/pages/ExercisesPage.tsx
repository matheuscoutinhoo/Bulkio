import { useEffect, useState, useCallback } from 'react';
import { exerciseApi, type Exercise, type ExerciseFilters } from '@/services/exerciseService';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ExerciseDetailModal } from '@/components/exercises/ExerciseDetailModal';
import { Search, Dumbbell } from 'lucide-react';
import { muscleGroupLabels, typeLabels, equipmentLabels, muscleGroups, types, equipments } from '@/lib/exerciseLabels';

export default function ExercisesPage() {
   const [exercises, setExercises] = useState<Exercise[]>([]);
   const [loading, setLoading] = useState(true);
   const [filters, setFilters] = useState<ExerciseFilters>({ page: 1, limit: 51 });
   const [search, setSearch] = useState('');
   const [debouncedSearch, setDebouncedSearch] = useState('');
   const [total, setTotal] = useState(0);
   const [totalPages, setTotalPages] = useState(1);
   const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

   useEffect(() => {
      const timer = setTimeout(() => {
         setDebouncedSearch(search);
         setFilters((f) => (f.page !== 1 ? { ...f, page: 1 } : f));
      }, 300);
      return () => clearTimeout(timer);
   }, [search]);

   const fetchExercises = useCallback(async () => {
      if (exercises.length === 0) setLoading(true);
      try {
         const params: ExerciseFilters = { ...filters };
         if (debouncedSearch) params.search = debouncedSearch;
         const res = await exerciseApi.getAll(params);
         setExercises(res.data.data);
         setTotal(res.data.pagination.total);
         setTotalPages(res.data.pagination.totalPages);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   }, [filters, debouncedSearch]);

   useEffect(() => {
      fetchExercises();
   }, [fetchExercises]);

   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Exercícios</h1>
            <p className="text-muted-foreground text-sm sm:text-base">{total} exercícios disponíveis</p>
         </div>

         {/* Filters */}
         <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-45 sm:min-w-50">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input
                  placeholder="Buscar exercício..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
               />
            </div>
            <Select
               value={filters.muscleGroup || ''}
               onChange={(e) => setFilters((f) => ({ ...f, muscleGroup: e.target.value || undefined, page: 1 }))}
               className="w-full sm:w-40"
            >
               <option value="">Grupo Muscular</option>
               {muscleGroups.map((g) => (
                  <option key={g} value={g}>{muscleGroupLabels[g]}</option>
               ))}
            </Select>
            <Select
               value={filters.type || ''}
               onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value || undefined, page: 1 }))}
               className="w-[calc(50%-6px)] sm:w-36"
            >
               <option value="">Tipo</option>
               {types.map((t) => (
                  <option key={t} value={t}>{typeLabels[t]}</option>
               ))}
            </Select>
            <Select
               value={filters.equipment || ''}
               onChange={(e) => setFilters((f) => ({ ...f, equipment: e.target.value || undefined, page: 1 }))}
               className="w-[calc(50%-6px)] sm:w-36"
            >
               <option value="">Equipamento</option>
               {equipments.map((e) => (
                  <option key={e} value={e}>{equipmentLabels[e]}</option>
               ))}
            </Select>
         </div>

         {/* Exercise list */}
         {loading ? (
            <div className="flex justify-center py-12">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
         ) : exercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
               <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
               <h3 className="text-lg font-medium">Nenhum exercício encontrado</h3>
               <p className="text-muted-foreground text-sm mt-1">Tente alterar os filtros</p>
            </div>
         ) : (
            <>
               <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {exercises.map((exercise) => (
                     <Card key={exercise.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setSelectedExercise(exercise)}>
                        <CardContent className="p-4 sm:p-5">
                           <div className="space-y-2 min-w-0">
                              <h3 className="font-medium text-sm sm:text-base truncate">{exercise.name}</h3>
                              <div className="flex flex-wrap gap-1.5">
                                 <Badge variant="secondary" className="text-xs">{muscleGroupLabels[exercise.muscleGroup]}</Badge>
                                 <Badge variant="outline" className="text-xs">{typeLabels[exercise.type]}</Badge>
                                 <Badge variant="outline" className="text-xs">{equipmentLabels[exercise.equipment]}</Badge>
                              </div>
                              {exercise.description && (
                                 <p className="text-xs text-muted-foreground line-clamp-2">{exercise.description}</p>
                              )}
                           </div>
                        </CardContent>
                     </Card>
                  ))}
               </div>

               {/* Pagination */}
               {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                     <Button
                        variant="outline"
                        size="sm"
                        disabled={filters.page === 1}
                        onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))}
                     >
                        Anterior
                     </Button>
                     <span className="text-sm text-muted-foreground">
                        Página {filters.page} de {totalPages}
                     </span>
                     <Button
                        variant="outline"
                        size="sm"
                        disabled={filters.page === totalPages}
                        onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}
                     >
                        Próxima
                     </Button>
                  </div>
               )}
            </>
         )}

         <ExerciseDetailModal
            exercise={selectedExercise}
            open={!!selectedExercise}
            onClose={() => setSelectedExercise(null)}
         />
      </div>
   );
}
