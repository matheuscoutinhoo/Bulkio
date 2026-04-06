import { useEffect, useState, useCallback } from 'react';
import { bodyWeightApi, type BodyWeightRecord } from '@/services/bodyWeightService';
import { authApi, type UpdateProfileData } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
   ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useChartColors } from '@/lib/useChartColors';

const goalLabels: Record<string, string> = {
   BULK: 'Ganho de Massa',
   CUT: 'Perda de Gordura',
   MAINTAIN: 'Manutenção',
};

export default function BodyWeightPage() {
   const { user, setUser } = useAuthStore();
   const chart = useChartColors();
   const [records, setRecords] = useState<BodyWeightRecord[]>([]);
   const [loading, setLoading] = useState(true);
   const [newWeight, setNewWeight] = useState('');
   const [showGoals, setShowGoals] = useState(false);
   const [goalForm, setGoalForm] = useState({
      goal: user?.goal || '',
      initialWeight: user?.initialWeight?.toString() || '',
      targetWeight: user?.targetWeight?.toString() || '',
   });

   const fetchRecords = useCallback(async () => {
      setLoading(true);
      try {
         const res = await bodyWeightApi.getAll({ limit: 100 });
         setRecords(res.data.data);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => { fetchRecords(); }, [fetchRecords]);

   const handleAddWeight = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newWeight) return;
      try {
         await bodyWeightApi.create({ weight: parseFloat(newWeight) });
         setNewWeight('');
         fetchRecords();
      } catch (err) {
         console.error(err);
      }
   };

   const handleDelete = async (id: string) => {
      try {
         await bodyWeightApi.delete(id);
         fetchRecords();
      } catch (err) {
         console.error(err);
      }
   };

   const handleSaveGoals = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
         const data: UpdateProfileData = {
            goal: goalForm.goal || null,
            initialWeight: goalForm.initialWeight ? parseFloat(goalForm.initialWeight) : null,
            targetWeight: goalForm.targetWeight ? parseFloat(goalForm.targetWeight) : null,
         };
         const res = await authApi.updateProfile(data);
         setUser(res.data.data);
         setShowGoals(false);
      } catch (err) {
         console.error(err);
      }
   };

   const chartData = [...records]
      .reverse()
      .map((r) => ({
         date: format(new Date(r.date), 'dd/MM', { locale: ptBR }),
         weight: r.weight,
      }));

   const latestWeight = records[0]?.weight;
   const previousWeight = records[1]?.weight;
   const diff = latestWeight && previousWeight ? latestWeight - previousWeight : 0;

   return (
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold">Peso Corporal</h1>
               <p className="text-muted-foreground">Acompanhe sua evolução</p>
            </div>
            <Button variant="outline" onClick={() => setShowGoals(true)}>
               <Target className="h-4 w-4 mr-2" /> Definir Meta
            </Button>
         </div>

         {/* Stats */}
         <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card>
               <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Peso Atual</p>
                  <p className="text-2xl font-bold">{latestWeight ? `${latestWeight}kg` : '-'}</p>
               </CardContent>
            </Card>
            <Card>
               <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Variação</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                     {diff !== 0 && (
                        diff > 0
                           ? <TrendingUp className="h-5 w-5 text-success" />
                           : <TrendingDown className="h-5 w-5 text-destructive" />
                     )}
                     {diff !== 0 ? `${diff > 0 ? '+' : ''}${diff.toFixed(1)}kg` : '-'}
                  </p>
               </CardContent>
            </Card>
            <Card>
               <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Objetivo</p>
                  <p className="text-2xl font-bold">
                     {user?.goal ? goalLabels[user.goal] || user.goal : '-'}
                  </p>
               </CardContent>
            </Card>
            <Card>
               <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Meta</p>
                  <p className="text-2xl font-bold">
                     {user?.targetWeight ? `${user.targetWeight}kg` : '-'}
                  </p>
               </CardContent>
            </Card>
         </div>

         {/* Add weight form */}
         <Card>
            <CardContent className="pt-6">
               <form onSubmit={handleAddWeight} className="flex gap-3 items-end">
                  <div className="flex-1 space-y-2">
                     <Label>Registrar Peso (kg)</Label>
                     <Input
                        type="number"
                        step="0.1"
                        placeholder="Ex: 75.5"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                        required
                     />
                  </div>
                  <Button type="submit" disabled={!newWeight}>
                     <Plus className="h-4 w-4 mr-2" /> Registrar
                  </Button>
               </form>
            </CardContent>
         </Card>

         {/* Chart */}
         {chartData.length > 1 && (
            <Card>
               <CardHeader>
                  <CardTitle className="text-lg">Evolução do Peso</CardTitle>
               </CardHeader>
               <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                     <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                        <XAxis dataKey="date" stroke={chart.axis} fontSize={12} />
                        <YAxis stroke={chart.axis} fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} />
                        <Tooltip contentStyle={{ backgroundColor: chart.tooltipBg, border: `1px solid ${chart.tooltipBorder}` }} />
                        <Line type="monotone" dataKey="weight" stroke={chart.primary} strokeWidth={2} dot={{ fill: chart.primary }} />
                        {user?.targetWeight && (
                           <ReferenceLine
                              y={user.targetWeight}
                              stroke="#22c55e"
                              strokeDasharray="3 3"
                              label={{ value: 'Meta', fill: '#22c55e', fontSize: 12 }}
                           />
                        )}
                     </LineChart>
                  </ResponsiveContainer>
               </CardContent>
            </Card>
         )}

         {/* History */}
         <Card>
            <CardHeader>
               <CardTitle className="text-lg">Histórico</CardTitle>
            </CardHeader>
            <CardContent>
               {loading ? (
                  <div className="flex justify-center py-8">
                     <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
               ) : records.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nenhum registro de peso</p>
               ) : (
                  <div className="space-y-1">
                     {records.map((record) => (
                        <div
                           key={record.id}
                           className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors"
                        >
                           <div>
                              <span className="font-medium">{record.weight}kg</span>
                              <span className="text-sm text-muted-foreground ml-3">
                                 {format(new Date(record.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                              </span>
                           </div>
                           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(record.id)}>
                              <Trash2 className="h-3 w-3" />
                           </Button>
                        </div>
                     ))}
                  </div>
               )}
            </CardContent>
         </Card>

         {/* Goals Dialog */}
         {showGoals && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
               <div className="fixed inset-0 bg-black/80" onClick={() => setShowGoals(false)} />
               <div className="relative z-50 w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
                  <h2 className="text-lg font-semibold mb-4">Definir Meta</h2>
                  <form onSubmit={handleSaveGoals} className="space-y-4">
                     <div className="space-y-2">
                        <Label>Objetivo</Label>
                        <Select value={goalForm.goal} onChange={(e) => setGoalForm({ ...goalForm, goal: e.target.value })}>
                           <option value="">Selecione</option>
                           <option value="BULK">Ganho de Massa</option>
                           <option value="CUT">Perda de Gordura</option>
                           <option value="MAINTAIN">Manutenção</option>
                        </Select>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                           <Label>Peso Inicial (kg)</Label>
                           <Input
                              type="number"
                              step="0.1"
                              value={goalForm.initialWeight}
                              onChange={(e) => setGoalForm({ ...goalForm, initialWeight: e.target.value })}
                           />
                        </div>
                        <div className="space-y-2">
                           <Label>Peso Alvo (kg)</Label>
                           <Input
                              type="number"
                              step="0.1"
                              value={goalForm.targetWeight}
                              onChange={(e) => setGoalForm({ ...goalForm, targetWeight: e.target.value })}
                           />
                        </div>
                     </div>
                     <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowGoals(false)}>Cancelar</Button>
                        <Button type="submit">Salvar</Button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
}
