import { useCallback, useEffect, useState } from 'react';
import { dashboardApi, type DashboardStats } from '@/services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Flame, Trophy, Dumbbell, Activity, Scale } from 'lucide-react';
import {
   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
   AreaChart, Area,
} from 'recharts';
import { ExerciseProgressionDialog } from '@/components/exercises/ExerciseProgressionDialog';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { MuscleBodyMap } from '@/components/dashboard/MuscleBodyMap';
import { muscleGroupLabels } from '@/lib/exerciseLabels';
import { useChartColors } from '@/lib/useChartColors';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState, ErrorState } from '@/components/ui/feedback';
import { ChartFrame } from '@/components/ui/chart-frame';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export default function DashboardPage() {
   const user = useAuthStore(state => state.user);
   const [stats, setStats] = useState<DashboardStats | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(false);
   const [selectedExercise, setSelectedExercise] = useState<{ id: string; name: string; muscleGroup: string } | null>(null);
   const chart = useChartColors();

   const loadStats = useCallback(() => {
      setLoading(true);
      setError(false);
      dashboardApi.getStats()
         .then((res) => setStats(res.data.data))
         .catch(() => setError(true))
         .finally(() => setLoading(false));
   }, []);

   useEffect(() => { loadStats(); }, [loadStats]);

   if (loading) {
      return (
         <div className="space-y-6 sm:space-y-8 animate-fade-in">
            <div>
               <div className="skeleton h-8 w-40 mb-2" />
               <div className="skeleton h-4 w-56" />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 stagger-children">
               {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-lg border bg-card p-5 sm:p-6 space-y-3">
                     <div className="skeleton h-4 w-24" />
                     <div className="skeleton h-7 w-16" />
                     <div className="skeleton h-3 w-32" />
                  </div>
               ))}
            </div>
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
               <div className="rounded-lg border bg-card p-5 sm:p-6">
                  <div className="skeleton h-5 w-48 mb-4" />
                  <div className="skeleton w-full aspect-4/3 min-h-50 max-h-70 rounded-lg" />
               </div>
               <div className="rounded-lg border bg-card p-5 sm:p-6">
                  <div className="skeleton h-5 w-48 mb-4" />
                  <div className="skeleton w-full aspect-video min-h-45 max-h-75 rounded-lg" />
               </div>
            </div>
         </div>
      );
   }

   if (error || !stats) return <ErrorState message="Não foi possível carregar seu painel." onRetry={loadStats} />;

   const muscleDataRaw = Object.entries(stats.muscleDistribution).filter(([, value]) => Number.isFinite(value) && value > 0).map(([key, value]) => ({
      name: muscleGroupLabels[key] || key,
      sets: value,
   }));
   const totalSets = muscleDataRaw.reduce((sum, d) => sum + d.sets, 0);
   const muscleData = muscleDataRaw
      .map((d) => ({
         ...d,
         percent: totalSets > 0 ? Math.round((d.sets / totalSets) * 100) : 0,
      }))
      .sort((a, b) => b.percent - a.percent);

   const bodyWeightData = stats.bodyWeight.history.map((bw) => ({
      date: new Date(bw.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      fullDate: new Date(bw.date).toLocaleDateString('pt-BR'),
      weight: bw.weight,
   }));

   const weekDiff = stats.weeklyWorkouts.current - stats.weeklyWorkouts.previous;

   return (
      <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
         <PageHeader title="Resumo" description="Treinos, volume por grupo muscular e histórico de peso." />
         {user?.onboardingStatus === 'SKIPPED' && (!user.height || !user.initialWeight || !user.goal) && <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">Altura, peso e objetivo podem ser preenchidos na configuração inicial.</p><Link to="/onboarding" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Retomar configuração</Link></div>}

         {/* Stats cards */}
         <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 stagger-children">
            <Card>
               <CardHeader className="flex-row items-start justify-between gap-3">
                  <CardTitle className="text-xs sm:text-sm font-medium">Treinos na Semana</CardTitle>
                  <Activity className="h-4 w-4 text-blue-500" />
               </CardHeader>
               <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{stats.weeklyWorkouts.current}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                     {weekDiff >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-success" />
                     ) : (
                        <TrendingDown className="h-3 w-3 text-destructive" />
                     )}
                     {weekDiff >= 0 ? '+' : ''}{weekDiff} vs semana anterior
                  </p>
               </CardContent>
            </Card>

            <Card>
               <CardHeader className="flex-row items-start justify-between gap-3">
                  <CardTitle className="text-xs sm:text-sm font-medium">Streak</CardTitle>
                  <Flame className="h-4 w-4 text-orange-500" />
               </CardHeader>
               <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{stats.streak}</div>
                  <p className="text-xs text-muted-foreground">dias consecutivos</p>
               </CardContent>
            </Card>

            <Card>
               <CardHeader className="flex-row items-start justify-between gap-3">
                  <CardTitle className="text-xs sm:text-sm font-medium">Volume Total (30d)</CardTitle>
                  <Dumbbell className="h-4 w-4 icon-gradient" />
               </CardHeader>
               <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{stats.totalVolume.toLocaleString('pt-BR')}kg</div>
                  <p className="text-xs text-muted-foreground">peso total levantado</p>
               </CardContent>
            </Card>

            <Card>
               <CardHeader className="flex-row items-start justify-between gap-3">
                  <CardTitle className="text-xs sm:text-sm font-medium">Peso Atual</CardTitle>
                  <Scale className="h-4 w-4 text-emerald-500" />
               </CardHeader>
               <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                     {stats.bodyWeight.current ? `${stats.bodyWeight.current.weight}kg` : '-'}
                  </div>
                  {stats.bodyWeight.target && (
                     <p className="text-xs text-muted-foreground">
                        Meta: {stats.bodyWeight.target}kg
                     </p>
                  )}
               </CardContent>
            </Card>
         </div>

         {/* Activity Heatmap */}
         <ActivityHeatmap yearlyActivity={stats.yearlyActivity} />

         <MuscleBodyMap distribution={stats.muscleDistribution} />

         {/* Charts */}
         <div className="grid gap-5 sm:gap-6">
            {/* Body weight chart */}
            <Card>
               <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Evolução do Peso Corporal</CardTitle>
               </CardHeader>
               <CardContent>
                  {bodyWeightData.length > 0 ? (
                     <ChartFrame label="Evolução do peso corporal em kg">
                           <AreaChart data={bodyWeightData} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
                              <defs>
                                 <linearGradient id="gradDashWeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={chart.gradientFrom} stopOpacity={0.8} />
                                    <stop offset="45%" stopColor={chart.primary} stopOpacity={0.25} />
                                    <stop offset="100%" stopColor={chart.gradientTo} stopOpacity={0.6} />
                                 </linearGradient>
                              </defs>
                              <CartesianGrid horizontal={true} vertical={false} stroke={chart.grid} strokeOpacity={0.6} />
                              <XAxis dataKey="date" tick={{ fill: chart.axis, fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={30} padding={{ left: 8, right: 8 }} />
                              <YAxis tick={{ fill: chart.axis, fontSize: 11 }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} width={48} tickFormatter={(v) => Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} />
                              <Tooltip
                                 content={({ active, payload }) => {
                                    if (!active || !payload?.length) return null;
                                    return (
                                       <div role="status" aria-live="polite" className="rounded-xl border bg-background px-3.5 py-2.5 text-sm shadow-lg">
                                          <p className="text-muted-foreground text-xs">{payload[0].payload.fullDate}</p>
                                          <p className="font-semibold text-base">{payload[0].value}kg</p>
                                       </div>
                                    );
                                 }}
                              />
                              <Area isAnimationActive={false} type="monotone" dataKey="weight" stroke={chart.primary} strokeWidth={2} fill="url(#gradDashWeight)" dot={bodyWeightData.length === 1 ? { r: 4, fill: chart.primary } : false} activeDot={{ r: 5, strokeWidth: 2, stroke: chart.primary, fill: chart.tooltipBg }} />
                           </AreaChart>
                     </ChartFrame>
                  ) : (
                     <EmptyState compact icon={Scale} title="Sem registros de peso" description="Registre seu peso para acompanhar a tendência aqui." />
                  )}
               </CardContent>
            </Card>

            {/* Muscle volume bar chart */}
            {muscleData.length > 0 && (
               <Card>
                  <CardHeader>
                     <CardTitle className="text-base sm:text-lg">Volume por Grupo Muscular</CardTitle>
                     <p className="text-xs text-muted-foreground mt-0.5">Séries nos últimos 30 dias</p>
                  </CardHeader>
                  <CardContent>
                     <ChartFrame label="Volume de séries por grupo muscular nos últimos 30 dias" height={Math.max(240, muscleData.length * 36 + 40)}>
                           <BarChart data={muscleData} layout="vertical" barCategoryGap="25%" margin={{ top: 8, right: 20, left: 0, bottom: 8 }}>
                              <defs>
                                 <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={chart.secondary} stopOpacity={0.95} />
                                    <stop offset="100%" stopColor={chart.primary} stopOpacity={0.7} />
                                 </linearGradient>
                              </defs>
                              <CartesianGrid horizontal={false} vertical stroke={chart.grid} strokeOpacity={0.5} />
                              <XAxis type="number" allowDecimals={false} tick={{ fill: chart.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
                              <YAxis type="category" dataKey="name" width={104} interval={0} tick={{ fill: chart.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
                              <Tooltip
                                 cursor={{ fill: chart.grid, opacity: 0.15 }}
                                 content={({ active, payload }) => {
                                    if (!active || !payload?.length) return null;
                                    const d = payload[0].payload;
                                    return (
                                       <div role="status" aria-live="polite" className="rounded-xl border bg-background px-3.5 py-2.5 text-sm shadow-lg">
                                          <p className="font-semibold">{d.name}</p>
                                          <div className="flex items-center gap-2 mt-0.5 text-muted-foreground">
                                             <span>{d.sets} séries</span>
                                             <span className="text-[10px]">•</span>
                                             <span className="font-medium text-foreground">{d.percent}%</span>
                                          </div>
                                       </div>
                                    );
                                 }}
                              />
                              <Bar isAnimationActive={false} dataKey="sets" fill="url(#gradBar)" radius={[0, 6, 6, 0]} maxBarSize={24} activeBar={false} />
                           </BarChart>
                     </ChartFrame>
                  </CardContent>
               </Card>
            )}

         </div>

         {/* Personal Records */}
         {stats.personalRecords.length > 0 && (
            <Card>
               <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                     <Trophy className="h-5 w-5 text-yellow-500" />
                     Recordes pessoais
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <Table aria-label="Recordes pessoais" mobileLayout="cards">
                     <TableHeader><TableRow><TableHead>Exercício</TableHead><TableHead className="text-right">Carga</TableHead><TableHead className="text-right">Reps</TableHead></TableRow></TableHeader>
                     <TableBody>
                     {stats.personalRecords.map((pr) => (
                        <TableRow key={pr.id}>
                           <TableCell className="table-primary w-full">
                              <button type="button" className="block min-h-11 w-full text-left text-sm font-semibold [overflow-wrap:anywhere] hover:text-primary" onClick={() => setSelectedExercise(pr.exercise)}>{pr.exercise.name}</button>
                              <Badge variant="secondary" className="mt-1 text-xs">
                                 {muscleGroupLabels[pr.exercise.muscleGroup] || pr.exercise.muscleGroup}
                              </Badge>
                           </TableCell>
                           <TableCell mobileLabel="Carga" className="table-stat text-right font-semibold tabular-nums whitespace-nowrap"><span className="text-lg sm:text-sm">{pr.weight.toLocaleString('pt-BR')}</span><span className="ml-1 text-xs font-normal text-muted-foreground">kg</span></TableCell>
                           <TableCell mobileLabel="Repetições" className="table-stat text-right font-semibold tabular-nums"><span className="text-lg sm:text-sm">{pr.reps}</span></TableCell>
                        </TableRow>
                     ))}
                     </TableBody>
                  </Table>
               </CardContent>
            </Card>
         )}

         <ExerciseProgressionDialog
            exercise={selectedExercise}
            open={!!selectedExercise}
            onClose={() => setSelectedExercise(null)}
         />
      </div>
   );
}
