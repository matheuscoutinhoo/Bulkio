import { useEffect, useState } from 'react';
import { dashboardApi, type DashboardStats } from '@/services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Flame, Trophy, Weight, Activity } from 'lucide-react';
import {
   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
   LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { ExerciseDetailModal } from '@/components/exercises/ExerciseDetailModal';
import { muscleGroupLabels } from '@/lib/exerciseLabels';

const COLORS = ['#6d28d9', '#22c55e', '#eab308', '#dc2626', '#3b82f6', '#ec4899', '#f97316', '#14b8a6', '#8b5cf6', '#06b6d4', '#a855f7', '#f43f5e', '#10b981'];

export default function DashboardPage() {
   const [stats, setStats] = useState<DashboardStats | null>(null);
   const [loading, setLoading] = useState(true);
   const [selectedExercise, setSelectedExercise] = useState<{ id: string; name: string; muscleGroup: string } | null>(null);

   useEffect(() => {
      dashboardApi.getStats()
         .then((res) => setStats(res.data.data))
         .catch(console.error)
         .finally(() => setLoading(false));
   }, []);

   if (loading) {
      return (
         <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
         </div>
      );
   }

   if (!stats) return <p className="text-muted-foreground">Erro ao carregar dashboard.</p>;

   const muscleData = Object.entries(stats.muscleDistribution).map(([key, value]) => ({
      name: muscleGroupLabels[key] || key,
      sets: value,
   }));

   const bodyWeightData = stats.bodyWeight.history.map((bw) => ({
      date: new Date(bw.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      weight: bw.weight,
   }));

   const weekDiff = stats.weeklyWorkouts.current - stats.weeklyWorkouts.previous;

   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral do seu progresso</p>
         </div>

         {/* Stats cards */}
         <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Treinos na Semana</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{stats.weeklyWorkouts.current}</div>
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
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Streak</CardTitle>
                  <Flame className="h-4 w-4 text-orange-500" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{stats.streak}</div>
                  <p className="text-xs text-muted-foreground">dias consecutivos</p>
               </CardContent>
            </Card>

            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Volume Total (30d)</CardTitle>
                  <Weight className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{(stats.totalVolume / 1000).toFixed(1)}t</div>
                  <p className="text-xs text-muted-foreground">peso total levantado</p>
               </CardContent>
            </Card>

            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Peso Atual</CardTitle>
                  <Weight className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">
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

         {/* Charts */}
         <div className="grid gap-6 lg:grid-cols-2">
            {/* Muscle distribution */}
            <Card>
               <CardHeader>
                  <CardTitle className="text-lg">Distribuição Muscular (30d)</CardTitle>
               </CardHeader>
               <CardContent>
                  {muscleData.length > 0 ? (
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                           <Pie
                              data={muscleData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                              outerRadius={100}
                              dataKey="sets"
                           >
                              {muscleData.map((_entry, index) => (
                                 <Cell key={index} fill={COLORS[index % COLORS.length]} />
                              ))}
                           </Pie>
                           <Tooltip />
                        </PieChart>
                     </ResponsiveContainer>
                  ) : (
                     <p className="text-muted-foreground text-sm text-center py-12">Nenhum treino registrado</p>
                  )}
               </CardContent>
            </Card>

            {/* Body weight chart */}
            <Card>
               <CardHeader>
                  <CardTitle className="text-lg">Evolução do Peso Corporal</CardTitle>
               </CardHeader>
               <CardContent>
                  {bodyWeightData.length > 0 ? (
                     <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={bodyWeightData}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                           <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} />
                           <YAxis stroke="#a1a1aa" fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} />
                           <Tooltip
                              contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid #27272a' }}
                           />
                           <Line type="monotone" dataKey="weight" stroke="#6d28d9" strokeWidth={2} dot={{ fill: '#6d28d9' }} />
                        </LineChart>
                     </ResponsiveContainer>
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
                  <CardTitle className="text-lg">Volume por Grupo Muscular (séries nos últimos 30d)</CardTitle>
               </CardHeader>
               <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                     <BarChart data={muscleData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} />
                        <YAxis stroke="#a1a1aa" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid #27272a' }} />
                        <Bar dataKey="sets" fill="#6d28d9" radius={[4, 4, 0, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
               </CardContent>
            </Card>
         )}

         {/* Personal Records */}
         {stats.personalRecords.length > 0 && (
            <Card>
               <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                     <Trophy className="h-5 w-5 text-yellow-500" />
                     Records Pessoais
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                     {stats.personalRecords.map((pr) => (
                        <div key={pr.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                           <div>
                              <p className="font-medium text-sm cursor-pointer hover:text-primary transition-colors" onClick={() => setSelectedExercise(pr.exercise)}>{pr.exercise.name}</p>
                              <Badge variant="secondary" className="mt-1">
                                 {muscleGroupLabels[pr.exercise.muscleGroup] || pr.exercise.muscleGroup}
                              </Badge>
                           </div>
                           <div className="text-right">
                              <p className="text-lg font-bold text-primary">{pr.weight}kg</p>
                              <p className="text-xs text-muted-foreground">{pr.reps} reps</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
         )}

         <ExerciseDetailModal
            exercise={selectedExercise}
            open={!!selectedExercise}
            onClose={() => setSelectedExercise(null)}
         />
      </div>
   );
}
