import { useEffect, useState, useCallback } from 'react';
import { bodyWeightApi, type BodyWeightRecord } from '@/services/bodyWeightService';
import { authApi, type UpdateProfileData } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoalDialog } from '@/components/bodyWeight/GoalDialog';
import { Plus, Trash2, Target, TrendingUp, TrendingDown, Scale, ArrowUpDown, Goal, Crosshair, Activity, ChartNoAxesColumnIncreasing } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
   AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
   ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useChartColors } from '@/lib/useChartColors';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/feedback';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from '@/stores/toastStore';

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
   const [loadError, setLoadError] = useState(false);
   const [newWeight, setNewWeight] = useState('');
   const [showGoals, setShowGoals] = useState(false);
   const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
   const [submitting, setSubmitting] = useState(false);
   const [deleting, setDeleting] = useState(false);

   const fetchRecords = useCallback(async () => {
      setLoading(true);
      setLoadError(false);
      try {
         const res = await bodyWeightApi.getAll({ limit: 100 });
         setRecords(res.data.data);
      } catch (err) {
         console.error(err);
         setLoadError(true);
         toast.error('Não foi possível carregar os registros de peso');
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => { fetchRecords(); }, [fetchRecords]);

   const handleAddWeight = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newWeight) return;
      setSubmitting(true);
      try {
         await bodyWeightApi.create({ weight: parseFloat(newWeight) });
         setNewWeight('');
         await fetchRecords();
         toast.success('Peso registrado', 'Seu painel de evolução foi atualizado.');
      } catch (err) {
         console.error(err);
         toast.error('Não foi possível registrar o peso');
      } finally {
         setSubmitting(false);
      }
   };

   const handleDelete = async () => {
      if (!deleteTarget) return;
      setDeleting(true);
      try {
         await bodyWeightApi.delete(deleteTarget);
         setDeleteTarget(null);
         await fetchRecords();
         toast.success('Registro de peso excluído');
      } catch (err) {
         console.error(err);
         toast.error('Não foi possível excluir o registro');
      } finally {
         setDeleting(false);
      }
   };

   const handleSaveGoals = async (form: { goal: string; initialWeight: string; targetWeight: string; height: string }) => {
      const data: UpdateProfileData = {
         goal: form.goal || null,
         initialWeight: form.initialWeight ? parseFloat(form.initialWeight) : null,
         targetWeight: form.targetWeight ? parseFloat(form.targetWeight) : null,
         height: form.height ? parseFloat(form.height) : null,
      };
      const res = await authApi.updateProfile(data);
      setUser(res.data.data);

      if (data.initialWeight && records.length === 0) {
         await bodyWeightApi.create({ weight: data.initialWeight });
         fetchRecords();
      }
      toast.success('Meta atualizada');
   };

   const chartData = [...records]
      .reverse()
      .map((r) => ({
         date: format(new Date(r.date), 'dd/MM', { locale: ptBR }),
         weight: r.weight,
      }));

   const latestWeight = records[0]?.weight;
   const oldestWeight = records[records.length - 1]?.weight;
   const diff = latestWeight && oldestWeight && records.length > 1 ? latestWeight - oldestWeight : 0;

   const diffDays = records.length > 1
      ? differenceInDays(new Date(records[0].date), new Date(records[records.length - 1].date))
      : 0;
   const diffTimeLabel = diffDays > 0
      ? diffDays < 30
         ? `em ${diffDays} dia${diffDays > 1 ? 's' : ''}`
         : `em ${Math.round(diffDays / 30)} ${Math.round(diffDays / 30) === 1 ? 'mês' : 'meses'}`
      : '';

   const bmi = latestWeight && user?.height
      ? latestWeight / ((user.height / 100) ** 2)
      : null;

   const getBmiLabel = (value: number) => {
      if (value < 18.5) return { label: 'Abaixo do peso', color: 'text-warning' };
      if (value < 25) return { label: 'Peso normal', color: 'text-success' };
      if (value < 30) return { label: 'Sobrepeso', color: 'text-warning' };
      return { label: 'Obesidade', color: 'text-destructive' };
   };

   return (
      <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
         <PageHeader title="Peso corporal" description="Acompanhe tendências com contexto e mantenha sua meta sempre visível." actions={<Button variant="outline" onClick={() => setShowGoals(true)}><Target className="h-4 w-4" /> Definir meta</Button>} />

         {/* Stats */}
         <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-5 stagger-children">
            <Card className="min-w-0">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium">Peso Atual</CardTitle>
                  <Scale className="h-4 w-4 text-emerald-500" />
               </CardHeader>
               <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{latestWeight ? `${latestWeight}kg` : '-'}</div>
                  <p className="text-xs text-muted-foreground">último registro</p>
               </CardContent>
            </Card>
            <Card className="min-w-0">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium">Variação</CardTitle>
                  <ArrowUpDown className="h-4 w-4 text-blue-500" />
               </CardHeader>
               <CardContent>
                  <div className="text-xl sm:text-2xl font-bold flex items-center gap-1">
                     {diff !== 0 && (
                        diff > 0
                           ? <TrendingUp className="h-4 w-4 text-success" />
                           : <TrendingDown className="h-4 w-4 text-destructive" />
                     )}
                     {diff !== 0 ? `${diff > 0 ? '+' : ''}${diff.toFixed(1)}kg` : '-'}
                  </div>
                  <p className="text-xs text-muted-foreground">{diffTimeLabel || 'desde o primeiro registro'}</p>
               </CardContent>
            </Card>
            <Card className="min-w-0">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium">Objetivo</CardTitle>
                  <Goal className="h-4 w-4 text-orange-500" />
               </CardHeader>
               <CardContent>
                  <div className="text-lg font-bold leading-tight sm:text-xl">
                     {user?.goal ? goalLabels[user.goal] || user.goal : '-'}
                  </div>
                  <p className="text-xs text-muted-foreground">estratégia atual</p>
               </CardContent>
            </Card>
            <Card className="min-w-0">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium">Meta</CardTitle>
                  <Crosshair className="h-4 w-4 icon-gradient" />
               </CardHeader>
               <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                     {user?.targetWeight ? `${user.targetWeight}kg` : '-'}
                  </div>
                  <p className="text-xs text-muted-foreground">peso alvo</p>
               </CardContent>
            </Card>
            <Card className="min-w-0">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium">IMC</CardTitle>
                  <Activity className="h-4 w-4 text-cyan-500" />
               </CardHeader>
               <CardContent>
                  <div className={`text-xl sm:text-2xl font-bold ${bmi ? getBmiLabel(bmi).color : ''}`}>
                     {bmi ? bmi.toFixed(1) : '-'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                     {bmi ? getBmiLabel(bmi).label : 'defina sua altura'}
                  </p>
               </CardContent>
            </Card>
         </div>

         {/* Add weight form */}
         <Card>
            <CardContent className="pt-6">
               <form onSubmit={handleAddWeight} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex-1 space-y-2">
                     <Label htmlFor="new-weight">Peso de hoje (kg)</Label>
                     <Input
                        id="new-weight"
                        type="number"
                        step="0.1"
                        placeholder="Ex: 75.5"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                        required
                        min="20"
                        max="500"
                        inputMode="decimal"
                     />
                  </div>
                  <Button type="submit" disabled={!newWeight || submitting}>
                     <Plus className="h-4 w-4" /> {submitting ? 'Registrando…' : 'Registrar peso'}
                  </Button>
               </form>
            </CardContent>
         </Card>

         {/* Chart */}
         {chartData.length > 1 && (
            <Card>
               <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Evolução do Peso</CardTitle>
               </CardHeader>
               <CardContent>
                  <div
                     className="w-full aspect-video min-h-45 max-h-75"
                     role="img"
                     aria-label="Gráfico da evolução do peso corporal"
                  >
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                           <defs>
                              <linearGradient id="gradBodyWeight" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="0%" stopColor={chart.gradientFrom} stopOpacity={0.8} />
                                 <stop offset="45%" stopColor={chart.primary} stopOpacity={0.25} />
                                 <stop offset="100%" stopColor={chart.gradientTo} stopOpacity={0.6} />
                              </linearGradient>
                           </defs>
                           <CartesianGrid horizontal={true} vertical={false} stroke={chart.grid} strokeOpacity={0.6} />
                           <XAxis dataKey="date" tick={{ fill: chart.axis, fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={30} />
                           <YAxis tick={{ fill: chart.axis, fontSize: 11 }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} width={45} tickFormatter={(v) => `${v}kg`} />
                           <Tooltip
                              content={({ active, payload, label }) => {
                                 if (!active || !payload?.length) return null;
                                 return (
                                    <div className="rounded-xl border bg-background px-3.5 py-2.5 text-sm shadow-lg">
                                       <p className="text-muted-foreground text-xs">{label}</p>
                                       <p className="font-semibold text-base">{payload[0].value}kg</p>
                                    </div>
                                 );
                              }}
                           />
                           <Area type="monotone" dataKey="weight" stroke={chart.primary} strokeWidth={2} fill="url(#gradBodyWeight)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: chart.primary, fill: chart.tooltipBg }} />
                           {user?.targetWeight && (
                              <ReferenceLine
                                 y={user.targetWeight}
                                 stroke="#22c55e"
                                 strokeDasharray="6 4"
                                 label={{ value: 'Meta', fill: '#22c55e', fontSize: 12 }}
                              />
                           )}
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </CardContent>
            </Card>
         )}

         {/* History */}
         <Card>
            <CardHeader>
               <CardTitle className="text-base sm:text-lg">Histórico</CardTitle>
            </CardHeader>
            <CardContent>
               {loading ? (
                  <LoadingState label="Carregando registros" />
               ) : loadError ? (
                  <ErrorState message="Não foi possível carregar o histórico de peso." onRetry={fetchRecords} />
               ) : records.length === 0 ? (
                  <EmptyState compact icon={ChartNoAxesColumnIncreasing} title="Nenhum peso registrado" description="Adicione seu peso de hoje para começar a visualizar a tendência." />
               ) : (
                  <div>
                     <div className="grid grid-cols-[1fr_1fr_auto] gap-4 px-4 py-2 text-xs font-medium uppercase tracking-wide text-gradient">
                        <span>Peso</span>
                        <span>Data</span>
                        <span className="w-8" />
                     </div>
                     <div className="divide-y divide-border/60">
                        {records.map((record) => (
                           <div
                              key={record.id}
                              className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center px-4 py-3 hover:bg-secondary/20 transition-colors"
                           >
                              <span className="font-medium">{record.weight}kg</span>
                              <span className="text-sm text-muted-foreground">
                                 <span className="sm:hidden">{format(new Date(record.date), 'dd/MM/yyyy')}</span>
                                 <span className="hidden sm:inline">{format(new Date(record.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                              </span>
                              <Button variant="ghost" size="icon" className="h-10 w-10 hover:text-destructive" onClick={() => setDeleteTarget(record.id)} aria-label={`Excluir registro de ${record.weight}kg`}>
                                 <Trash2 className="h-3 w-3" />
                              </Button>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </CardContent>
         </Card>

         <GoalDialog
            open={showGoals}
            onClose={() => setShowGoals(false)}
            onSave={handleSaveGoals}
            defaultValues={user ?? undefined}
            latestWeight={records[0]?.weight}
         />
         <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Excluir registro de peso?" description="Este ponto será removido do histórico e dos gráficos. Esta ação não pode ser desfeita." />
      </div>
   );
}
