import { useEffect, useState } from 'react';
import { dashboardApi, type ExerciseProgression } from '@/services/dashboardService';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useChartColors } from '@/lib/useChartColors';
import { muscleGroupLabels } from '@/lib/exerciseLabels';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import {
   AreaChart,
   Area,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
} from 'recharts';

interface ExerciseProgressionDialogProps {
   exercise: { id: string; name: string; muscleGroup: string } | null;
   open: boolean;
   onClose: () => void;
}

export function ExerciseProgressionDialog({ exercise, open, onClose }: ExerciseProgressionDialogProps) {
   const [data, setData] = useState<ExerciseProgression[]>([]);
   const [loading, setLoading] = useState(false);
   const colors = useChartColors();

   useEffect(() => {
      if (open && exercise) {
         setLoading(true);
         dashboardApi
            .getExerciseProgression(exercise.id)
            .then((res) => setData(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
      } else {
         setData([]);
      }
   }, [open, exercise]);

   if (!exercise) return null;

   const chartData = data.map((d) => ({
      date: format(new Date(d.date), 'dd/MM', { locale: ptBR }),
      fullDate: format(new Date(d.date), "dd 'de' MMMM", { locale: ptBR }),
      maxWeight: d.maxWeight,
      totalVolume: d.totalVolume,
      sets: d.sets.length,
   }));

   const firstWeight = data.length > 0 ? data[0].maxWeight : 0;
   const lastWeight = data.length > 0 ? data[data.length - 1].maxWeight : 0;
   const weightDiff = lastWeight - firstWeight;
   const weightDiffPercent = firstWeight > 0 ? ((weightDiff / firstWeight) * 100).toFixed(1) : '0';

   const firstVolume = data.length > 0 ? data[0].totalVolume : 0;
   const lastVolume = data.length > 0 ? data[data.length - 1].totalVolume : 0;
   const volumeDiff = lastVolume - firstVolume;
   const volumeDiffPercent = firstVolume > 0 ? ((volumeDiff / firstVolume) * 100).toFixed(1) : '0';

   const maxWeightEver = data.length > 0 ? Math.max(...data.map((d) => d.maxWeight)) : 0;

   // Detect stagnation: count consecutive recent sessions without weight increase
   const stagnantSessions = (() => {
      if (data.length < 3) return 0;
      let count = 0;
      for (let i = data.length - 1; i >= 1; i--) {
         if (data[i].maxWeight <= data[i - 1].maxWeight) {
            count++;
         } else {
            break;
         }
      }
      return count;
   })();
   const isStagnant = stagnantSessions >= 3;

   return (
      <Dialog open={open} onClose={onClose} className="sm:max-w-2xl">
         <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2">
               {exercise.name}
               <Badge variant="outline" className="text-xs font-normal">
                  {muscleGroupLabels[exercise.muscleGroup]}
               </Badge>
            </DialogTitle>
            <p className="text-sm text-muted-foreground">Progressão de carga ao longo do tempo</p>
         </DialogHeader>

         {loading ? (
            <div className="flex justify-center py-12">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
         ) : data.length === 0 ? (
            <div className="text-center py-12">
               <p className="text-muted-foreground">Nenhum treino registrado para este exercício.</p>
               <p className="text-xs text-muted-foreground mt-1">Complete treinos com este exercício para ver a progressão.</p>
            </div>
         ) : (
            <div className="space-y-4 overflow-y-auto max-h-[65vh] sm:max-h-[70vh] pr-1">
               {/* Progression highlight */}
               {data.length >= 2 && (
                  <div className={`rounded-lg p-3 sm:p-4 border ${weightDiff > 0
                     ? 'bg-emerald-500/10 border-emerald-500/30'
                     : weightDiff < 0
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-primary/10 border-primary/30'
                     }`}>
                     <div className="flex items-center gap-2 mb-1">
                        {weightDiff > 0 ? (
                           <TrendingUp className="h-5 w-5 text-emerald-500" />
                        ) : weightDiff < 0 ? (
                           <TrendingDown className="h-5 w-5 text-red-500" />
                        ) : (
                           <Minus className="h-5 w-5 icon-gradient" />
                        )}
                        <span className="font-semibold text-sm sm:text-base">
                           {weightDiff > 0
                              ? `Você progrediu ${weightDiff.toFixed(1)}kg (+${weightDiffPercent}%) desde o início!`
                              : weightDiff < 0
                                 ? `Carga reduziu ${Math.abs(weightDiff).toFixed(1)}kg (${weightDiffPercent}%) desde o início`
                                 : 'Carga estável desde o início'}
                        </span>
                     </div>
                     <p className="text-xs text-muted-foreground">
                        De {firstWeight}kg para {lastWeight}kg em {data.length} treinos
                        {maxWeightEver > lastWeight && ` • Pico: ${maxWeightEver}kg`}
                     </p>
                  </div>
               )}

               {/* Stagnation warning */}
               {isStagnant && (
                  <div className="rounded-lg p-3 sm:p-4 border bg-amber-500/10 border-amber-500/30">
                     <div className="flex items-start gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                           <span className="font-semibold text-sm sm:text-base">
                              Sem progressão há {stagnantSessions} treinos seguidos
                           </span>
                           <p className="text-xs text-muted-foreground mt-1">Algumas dicas para quebrar o platô:</p>
                        </div>
                     </div>
                     <ul className="text-xs text-muted-foreground space-y-1 ml-7 list-disc">
                        <li>Aumente levemente a carga (1-2kg) mesmo que reduza repetições</li>
                        <li>Adicione uma série extra ao exercício</li>
                        <li>Varie o tempo sob tensão (excêntrica mais lenta)</li>
                        <li>Garanta descanso adequado entre séries ({'>'}90s para força)</li>
                        <li>Revise sua alimentação — proteína e calorias suficientes?</li>
                     </ul>
                  </div>
               )}

               {/* Stats cards */}
               <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="rounded-lg bg-secondary/30 p-2.5 sm:p-3 text-center">
                     <p className="text-lg sm:text-xl font-bold">{lastWeight}<span className="text-xs font-normal text-muted-foreground">kg</span></p>
                     <p className="text-xs text-muted-foreground">Carga atual</p>
                  </div>
                  <div className="rounded-lg bg-secondary/30 p-2.5 sm:p-3 text-center">
                     <p className="text-lg sm:text-xl font-bold">{maxWeightEver}<span className="text-xs font-normal text-muted-foreground">kg</span></p>
                     <p className="text-xs text-muted-foreground">Carga máxima</p>
                  </div>
                  <div className="rounded-lg bg-secondary/30 p-2.5 sm:p-3 text-center">
                     <p className="text-lg sm:text-xl font-bold">{data.length}</p>
                     <p className="text-xs text-muted-foreground">Treinos</p>
                  </div>
               </div>

               {/* Weight progression chart */}
               <div>
                  <h3 className="text-sm font-medium mb-2">Evolução de Carga Máxima</h3>
                  <div className="aspect-video w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                           <defs>
                              <linearGradient id="gradMaxWeight" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="0%" stopColor={colors.gradientFrom} stopOpacity={0.8} />
                                 <stop offset="45%" stopColor={colors.primary} stopOpacity={0.25} />
                                 <stop offset="100%" stopColor={colors.gradientTo} stopOpacity={0.6} />
                              </linearGradient>
                           </defs>
                           <CartesianGrid horizontal={true} vertical={false} stroke={colors.grid} strokeOpacity={0.6} />
                           <XAxis
                              dataKey="date"
                              tick={{ fill: colors.axis, fontSize: 11 }}
                              axisLine={false}
                              tickLine={false}
                           />
                           <YAxis
                              tick={{ fill: colors.axis, fontSize: 11 }}
                              axisLine={false}
                              tickLine={false}
                              unit="kg"
                              width={50}
                           />
                           <Tooltip
                              contentStyle={{
                                 backgroundColor: colors.tooltipBg,
                                 borderColor: colors.tooltipBorder,
                                 borderRadius: 10,
                                 fontSize: 12,
                                 boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                              }}
                              formatter={(value) => [`${value}kg`, 'Carga máx.']}
                              labelFormatter={(_label, payload) => {
                                 if (payload?.[0]?.payload?.fullDate) return payload[0].payload.fullDate;
                                 return _label;
                              }}
                           />
                           <Area
                              type="monotone"
                              dataKey="maxWeight"
                              stroke={colors.primary}
                              strokeWidth={2}
                              fill="url(#gradMaxWeight)"
                              dot={false}
                              activeDot={{ r: 5, strokeWidth: 2, stroke: colors.primary, fill: colors.tooltipBg }}
                           />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               {/* Volume progression chart */}
               <div>
                  <h3 className="text-sm font-medium mb-2">Evolução de Volume Total</h3>
                  <p className="text-xs text-muted-foreground mb-2">Volume = Σ(repetições × carga) por sessão</p>
                  <div className="aspect-video w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                           <defs>
                              <linearGradient id="gradVolume" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="0%" stopColor={colors.gradientFromSecondary} stopOpacity={0.7} />
                                 <stop offset="45%" stopColor={colors.secondary} stopOpacity={0.2} />
                                 <stop offset="100%" stopColor={colors.gradientTo} stopOpacity={0.5} />
                              </linearGradient>
                           </defs>
                           <CartesianGrid horizontal={true} vertical={false} stroke={colors.grid} strokeOpacity={0.6} />
                           <XAxis
                              dataKey="date"
                              tick={{ fill: colors.axis, fontSize: 11 }}
                              axisLine={false}
                              tickLine={false}
                           />
                           <YAxis
                              tick={{ fill: colors.axis, fontSize: 11 }}
                              axisLine={false}
                              tickLine={false}
                              unit="kg"
                              width={55}
                           />
                           <Tooltip
                              contentStyle={{
                                 backgroundColor: colors.tooltipBg,
                                 borderColor: colors.tooltipBorder,
                                 borderRadius: 10,
                                 fontSize: 12,
                                 boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                              }}
                              formatter={(value) => [`${value}kg`, 'Volume']}
                              labelFormatter={(_label, payload) => {
                                 if (payload?.[0]?.payload?.fullDate) return payload[0].payload.fullDate;
                                 return _label;
                              }}
                           />
                           <Area
                              type="monotone"
                              dataKey="totalVolume"
                              stroke={colors.secondary}
                              strokeWidth={2}
                              fill="url(#gradVolume)"
                              dot={false}
                              activeDot={{ r: 5, strokeWidth: 2, stroke: colors.secondary, fill: colors.tooltipBg }}
                           />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               {/* Volume progression message */}
               {data.length >= 2 && volumeDiff !== 0 && (
                  <div className="text-xs text-muted-foreground text-center pb-1">
                     Volume {volumeDiff > 0 ? 'aumentou' : 'diminuiu'} {Math.abs(Number(volumeDiffPercent))}% desde o primeiro treino
                  </div>
               )}
            </div>
         )}
      </Dialog>
   );
}
