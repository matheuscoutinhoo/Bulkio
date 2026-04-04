import { useEffect, useState, useCallback } from 'react';
import { exerciseApi, type Exercise, type ExerciseFilters } from '@/services/exerciseService';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Dumbbell } from 'lucide-react';

const muscleGroupLabels: Record<string, string> = {
   CHEST: 'Peito', BACK: 'Costas', LEGS: 'Pernas', SHOULDERS: 'Ombros',
   BICEPS: 'Bíceps', TRICEPS: 'Tríceps', ABS: 'Abdômen', CARDIO: 'Cardio',
   GLUTES: 'Glúteos', FOREARMS: 'Antebraço', TRAPS: 'Trapézio', CALVES: 'Panturrilha',
   FULL_BODY: 'Full Body',
};

const typeLabels: Record<string, string> = {
   COMPOUND: 'Composto', ISOLATED: 'Isolado', CARDIO: 'Cardio',
};

const equipmentLabels: Record<string, string> = {
   BARBELL: 'Barra', DUMBBELL: 'Halter', MACHINE: 'Máquina', CABLE: 'Cabo',
   BODYWEIGHT: 'Peso Corp.', KETTLEBELL: 'Kettlebell', BAND: 'Elástico', OTHER: 'Outro',
};

const muscleGroups = ['CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'ABS', 'CARDIO', 'GLUTES', 'FOREARMS', 'TRAPS', 'CALVES', 'FULL_BODY'];
const types = ['COMPOUND', 'ISOLATED', 'CARDIO'];
const equipments = ['BARBELL', 'DUMBBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT', 'KETTLEBELL', 'BAND', 'OTHER'];

export default function ExercisesPage() {
   const [exercises, setExercises] = useState<Exercise[]>([]);
   const [loading, setLoading] = useState(true);
   const [filters, setFilters] = useState<ExerciseFilters>({ page: 1, limit: 50 });
   const [search, setSearch] = useState('');
   const [showCreate, setShowCreate] = useState(false);
   const [total, setTotal] = useState(0);
   const [totalPages, setTotalPages] = useState(1);

   const fetchExercises = useCallback(async () => {
      setLoading(true);
      try {
         const params: ExerciseFilters = { ...filters };
         if (search) params.search = search;
         const res = await exerciseApi.getAll(params);
         setExercises(res.data.data);
         setTotal(res.data.pagination.total);
         setTotalPages(res.data.pagination.totalPages);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   }, [filters, search]);

   useEffect(() => {
      fetchExercises();
   }, [fetchExercises]);

   const handleSearch = () => {
      setFilters((f) => ({ ...f, page: 1 }));
   };

   const handleCreateExercise = async (data: {
      name: string; muscleGroup: string; type: string; equipment: string; description?: string;
   }) => {
      try {
         await exerciseApi.create(data);
         setShowCreate(false);
         fetchExercises();
      } catch (err) {
         console.error(err);
      }
   };

   return (
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold">Exercícios</h1>
               <p className="text-muted-foreground">{total} exercícios disponíveis</p>
            </div>
            <Button onClick={() => setShowCreate(true)}>
               <Plus className="h-4 w-4 mr-2" /> Novo Exercício
            </Button>
         </div>

         {/* Filters */}
         <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input
                  placeholder="Buscar exercício..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9"
               />
            </div>
            <Select
               value={filters.muscleGroup || ''}
               onChange={(e) => setFilters((f) => ({ ...f, muscleGroup: e.target.value || undefined, page: 1 }))}
               className="w-40"
            >
               <option value="">Grupo Muscular</option>
               {muscleGroups.map((g) => (
                  <option key={g} value={g}>{muscleGroupLabels[g]}</option>
               ))}
            </Select>
            <Select
               value={filters.type || ''}
               onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value || undefined, page: 1 }))}
               className="w-36"
            >
               <option value="">Tipo</option>
               {types.map((t) => (
                  <option key={t} value={t}>{typeLabels[t]}</option>
               ))}
            </Select>
            <Select
               value={filters.equipment || ''}
               onChange={(e) => setFilters((f) => ({ ...f, equipment: e.target.value || undefined, page: 1 }))}
               className="w-36"
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
         ) : (
            <>
               <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {exercises.map((exercise) => (
                     <Card key={exercise.id} className="hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                           <div className="flex items-start justify-between">
                              <div className="space-y-1 min-w-0">
                                 <h3 className="font-medium text-sm truncate">{exercise.name}</h3>
                                 <div className="flex flex-wrap gap-1">
                                    <Badge variant="secondary" className="text-xs">{muscleGroupLabels[exercise.muscleGroup]}</Badge>
                                    <Badge variant="outline" className="text-xs">{typeLabels[exercise.type]}</Badge>
                                    <Badge variant="outline" className="text-xs">{equipmentLabels[exercise.equipment]}</Badge>
                                 </div>
                                 {exercise.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{exercise.description}</p>
                                 )}
                              </div>
                              {exercise.isCustom && (
                                 <Badge className="text-xs shrink-0 ml-2">Custom</Badge>
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

         {/* Create Exercise Dialog */}
         <CreateExerciseDialog
            open={showCreate}
            onClose={() => setShowCreate(false)}
            onCreate={handleCreateExercise}
         />
      </div>
   );
}

function CreateExerciseDialog({
   open,
   onClose,
   onCreate,
}: {
   open: boolean;
   onClose: () => void;
   onCreate: (data: any) => void;
}) {
   const [form, setForm] = useState({
      name: '',
      muscleGroup: 'CHEST',
      type: 'COMPOUND',
      equipment: 'BARBELL',
      description: '',
   });

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onCreate(form);
      setForm({ name: '', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL', description: '' });
   };

   return (
      <Dialog open={open} onClose={onClose}>
         <DialogHeader>
            <DialogTitle>Novo Exercício</DialogTitle>
         </DialogHeader>
         <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
               <Label>Nome</Label>
               <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-3 gap-3">
               <div className="space-y-2">
                  <Label>Grupo Muscular</Label>
                  <Select value={form.muscleGroup} onChange={(e) => setForm({ ...form, muscleGroup: e.target.value })}>
                     {muscleGroups.map((g) => (
                        <option key={g} value={g}>{muscleGroupLabels[g]}</option>
                     ))}
                  </Select>
               </div>
               <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                     {types.map((t) => (
                        <option key={t} value={t}>{typeLabels[t]}</option>
                     ))}
                  </Select>
               </div>
               <div className="space-y-2">
                  <Label>Equipamento</Label>
                  <Select value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })}>
                     {equipments.map((e) => (
                        <option key={e} value={e}>{equipmentLabels[e]}</option>
                     ))}
                  </Select>
               </div>
            </div>
            <div className="space-y-2">
               <Label>Descrição (opcional)</Label>
               <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
               <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
               <Button type="submit" disabled={!form.name}>Criar</Button>
            </div>
         </form>
      </Dialog>
   );
}
