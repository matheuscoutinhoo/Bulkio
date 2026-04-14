import { useEffect, useState } from 'react';
import { dashboardApi, type DashboardStats } from '@/services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Flame, Trophy, Dumbbell, Activity, Scale } from 'lucide-react';
import {
   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
   AreaChart, Area, PieChart, Pie, Cell, Legend, Sector,
} from 'recharts';
import { ExerciseProgressionDialog } from '@/components/exercises/ExerciseProgressionDialog';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { muscleGroupLabels } from '@/lib/exerciseLabels';
import { useChartColors } from '@/lib/useChartColors';

// Purple shades: darkest → lightest (readable in both themes)
const PURPLE_SHADES = [
   '#4c1d95', '#5b21b6', '#6d28d9', '#7c3aed',
   '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe',
];

function getShadeByPercent(percent: number, maxPercent: number): string {
   if (maxPercent === 0) return PURPLE_SHADES[Math.floor(PURPLE_SHADES.length / 2)];
   const ratio = percent / maxPercent;
   const index = Math.round((1 - ratio) * (PURPLE_SHADES.length - 1));
   return PURPLE_SHADES[index];
}

export default function DashboardPage() {
   const [stats, setStats] = useState<DashboardStats | null>(null);
   const [loading, setLoading] = useState(true);
   const [selectedExercise, setSelectedExercise] = useState<{ id: string; name: string; muscleGroup: string } | null>(null);
   const chart = useChartColors();

   useEffect(() => {
      dashboardApi.getStats()
         .then((res) => setStats(res.data.data))
         .catch(console.error)
         .finally(() => setLoading(false));
   }, []);

   if (loading) {
      return (
         <div className="space-y-3 sm:space-y-6 animate-fade-in">
            <div>
               <div className="skeleton h-8 w-40 mb-2" />
               <div className="skeleton h-4 w-56" />
            </div>
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 stagger-children">
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

   if (!stats) return <p className="text-muted-foreground">Erro ao carregar dashboard.</p>;

   const muscleDataRaw = Object.entries(stats.muscleDistribution).map(([key, value]) => ({
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
   const maxPercent = muscleData.length > 0 ? muscleData[0].percent : 0;

   const bodyWeightData = stats.bodyWeight.history.map((bw) => ({
      date: new Date(bw.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      weight: bw.weight,
   }));

   const weekDiff = stats.weeklyWorkouts.current - stats.weeklyWorkouts.previous;

   return (
      <div className="space-y-3 sm:space-y-6 animate-fade-in-up">
         <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Visão geral do seu progresso</p>
         </div>

         {/* Stats cards */}
         <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 stagger-children">
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
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
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium">Streak</CardTitle>
                  <Flame className="h-4 w-4 text-orange-500" />
               </CardHeader>
               <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{stats.streak}</div>
                  <p className="text-xs text-muted-foreground">dias consecutivos</p>
               </CardContent>
            </Card>

            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium">Volume Total (30d)</CardTitle>
                  <Dumbbell className="h-4 w-4 icon-gradient" />
               </CardHeader>
               <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{stats.totalVolume.toLocaleString('pt-BR')}kg</div>
                  <p className="text-xs text-muted-foreground">peso total levantado</p>
               </CardContent>
            </Card>

            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
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

         {/* Charts */}
         <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            {/* Muscle distribution */}
            <Card>
               <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Distribuição Muscular (30d)</CardTitle>
               </CardHeader>
               <CardContent>
                  {muscleData.length > 0 ? (
                     <div className="w-full aspect-4/3 min-h-50 max-h-70">
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie
                                 data={muscleData}
                                 cx="50%"
                                 cy="50%"
                                 innerRadius="40%"
                                 outerRadius="70%"
                                 paddingAngle={2}
                                 dataKey="sets"
                                 nameKey="name"
                                 stroke="none"
                                 activeShape={(props: any) => <Sector {...props} stroke="none" />}
                              >
                                 {muscleData.map((entry, index) => (
                                    <Cell key={index} fill={getShadeByPercent(entry.percent, maxPercent)} />
                                 ))}
                              </Pie>
                              <Tooltip content={({ active, payload }) => {
                                 if (!active || !payload?.length) return null;
                                 const d = payload[0].payload;
                                 return (
                                    <div className="rounded-xl border bg-background px-3.5 py-2.5 text-sm shadow-lg">
                                       <p className="font-semibold">{d.name}</p>
                                       <div className="flex items-center gap-2 mt-0.5 text-muted-foreground">
                                          <span>{d.sets} séries</span>
                                          <span className="text-[10px]">•</span>
                                          <span className="font-medium text-foreground">{d.percent}%</span>
                                       </div>
                                    </div>
                                 );
                              }} />
                              <Legend
                                 verticalAlign="bottom"
                                 iconType="circle"
                                 iconSize={8}
                                 wrapperStyle={{ fontSize: '12px', paddingTop: '12px', lineHeight: '22px' }}
                                 formatter={(value: string) => {
                                    const item = muscleData.find((d) => d.name === value);
                                    return <span className="text-muted-foreground">{item ? `${value} ${item.percent}%` : value}</span>;
                                 }}
                              />
                           </PieChart>
                        </ResponsiveContainer>
                     </div>
                  ) : (
                     <p className="text-muted-foreground text-sm text-center py-12">Nenhum treino registrado</p>
                  )}
               </CardContent>
            </Card>

            {/* Body weight chart */}
            <Card>
               <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Evolução do Peso Corporal</CardTitle>
               </CardHeader>
               <CardContent>
                  {bodyWeightData.length > 0 ? (
                     <div className="w-full aspect-video min-h-45 max-h-75">
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={bodyWeightData}>
                              <defs>
                                 <linearGradient id="gradDashWeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={chart.gradientFrom} stopOpacity={0.8} />
                                    <stop offset="45%" stopColor={chart.primary} stopOpacity={0.25} />
                                    <stop offset="100%" stopColor={chart.gradientTo} stopOpacity={0.6} />
                                 </linearGradient>
                              </defs>
                              <CartesianGrid horizontal={true} vertical={false} stroke={chart.grid} strokeOpacity={0.6} />
                              <XAxis dataKey="date" tick={{ fill: chart.axis, fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={30} />
                              <YAxis tick={{ fill: chart.axis, fontSize: 11 }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} width={40} tickFormatter={(v) => `${v}kg`} />
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
                              <Area type="monotone" dataKey="weight" stroke={chart.primary} strokeWidth={2} fill="url(#gradDashWeight)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: chart.primary, fill: chart.tooltipBg }} />
                           </AreaChart>
                        </ResponsiveContainer>
                     </div>
                  ) : (
                     <p className="text-muted-foreground text-sm text-center py-12">Nenhum registro de peso</p>
                  )}
               </CardContent>
            </Card>
         </div>

         {/* Muscle volume bar chart */}
         {muscleData.length > 0 && (
            <Card>
               <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Volume por Grupo Muscular</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Séries nos últimos 30 dias</p>
               </CardHeader>
               <CardContent>
                  <div className="w-full aspect-5/2 min-h-45 max-h-75">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={muscleData} barCategoryGap="25%">
                           <defs>
                              <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="0%" stopColor={chart.secondary} stopOpacity={0.95} />
                                 <stop offset="100%" stopColor={chart.primary} stopOpacity={0.7} />
                              </linearGradient>
                           </defs>
                           <CartesianGrid horizontal={true} vertical={false} stroke={chart.grid} strokeOpacity={0.5} />
                           <XAxis dataKey="name" tick={{ fill: chart.axis, fontSize: 11 }} axisLine={false} tickLine={false} interval={0} height={32} />
                           <YAxis tick={{ fill: chart.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
                           <Tooltip
                              cursor={{ fill: chart.grid, opacity: 0.15 }}
                              content={({ active, payload }) => {
                                 if (!active || !payload?.length) return null;
                                 const d = payload[0].payload;
                                 return (
                                    <div className="rounded-xl border bg-background px-3.5 py-2.5 text-sm shadow-lg">
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
                           <Bar dataKey="sets" fill="url(#gradBar)" radius={[6, 6, 0, 0]} maxBarSize={48} activeBar={false} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </CardContent>
            </Card>
         )}

         {/* Personal Records */}
         {stats.personalRecords.length > 0 && (
            <Card>
               <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                     <Trophy className="h-5 w-5 text-yellow-500" />
                     Records Pessoais
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-2 text-xs font-medium uppercase tracking-wide text-gradient hidden sm:grid">
                     <span>Exercício</span>
                     <span>Carga</span>
                     <span>Reps</span>
                  </div>
                  <div className="divide-y divide-border/50">
                     {stats.personalRecords.map((pr) => (
                        <div key={pr.id} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto] gap-3 sm:gap-4 items-center px-4 py-3 hover:bg-secondary/20 transition-colors">
                           <div className="min-w-0">
                              <p className="font-medium text-sm cursor-pointer hover:text-primary transition-colors truncate" onClick={() => setSelectedExercise(pr.exercise)}>{pr.exercise.name}</p>
                              <Badge variant="secondary" className="mt-1 text-xs">
                                 {muscleGroupLabels[pr.exercise.muscleGroup] || pr.exercise.muscleGroup}
                              </Badge>
                           </div>
                           <p className="text-lg font-bold text-gradient whitespace-nowrap">{pr.weight}kg</p>
                           <p className="text-sm text-muted-foreground hidden sm:block">{pr.reps} reps</p>
                        </div>
                     ))}
                  </div>
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
