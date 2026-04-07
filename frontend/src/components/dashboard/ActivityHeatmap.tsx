import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Award } from 'lucide-react';

// Average Brazilian gymgoer: ~156 days/year (3x/week)
// Milestones based on percentile above that average
const MILESTONES = [
   { threshold: 78, label: 'Acima de 50% dos brasileiros', emoji: '💪' },
   { threshold: 109, label: 'Acima de 70% dos brasileiros', emoji: '🔥' },
   { threshold: 140, label: 'Acima de 90% dos brasileiros', emoji: '🏆' },
   { threshold: 200, label: 'Top 1% do Brasil', emoji: '⭐' },
];

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface Props {
   yearlyActivity: Record<string, number>;
}

function getIntensity(count: number): string {
   if (count === 0) return 'bg-secondary/40';
   if (count === 1) return 'bg-primary/30';
   if (count === 2) return 'bg-primary/55';
   return 'bg-primary/85';
}

export function ActivityHeatmap({ yearlyActivity }: Props) {
   const { weeks, totalDays, milestone, monthPositions } = useMemo(() => {
      const year = new Date().getFullYear();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Build weeks array (columns): each week has up to 7 days (rows: Sun=0 to Sat=6)
      const jan1 = new Date(year, 0, 1);
      const startDay = jan1.getDay(); // 0=Sun

      const allWeeks: { date: string; count: number; future: boolean }[][] = [];
      let currentWeek: { date: string; count: number; future: boolean }[] = [];

      // Pad first week with empty slots
      for (let i = 0; i < startDay; i++) {
         currentWeek.push({ date: '', count: 0, future: true });
      }

      // Track where each month starts (column index)
      const monthCols: number[] = [];
      let lastMonth = -1;

      const daysInYear = ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 366 : 365;
      for (let d = 0; d < daysInYear; d++) {
         const date = new Date(year, 0, 1 + d);
         const key = date.toISOString().split('T')[0];
         const month = date.getMonth();

         if (month !== lastMonth) {
            monthCols.push(allWeeks.length + (currentWeek.length > 0 ? 0 : 0));
            lastMonth = month;
         }

         currentWeek.push({
            date: key,
            count: yearlyActivity[key] || 0,
            future: date > today,
         });

         if (currentWeek.length === 7) {
            allWeeks.push(currentWeek);
            currentWeek = [];
         }
      }
      if (currentWeek.length > 0) {
         allWeeks.push(currentWeek);
      }

      // Recalculate month positions accurately
      const mPositions: { label: string; col: number }[] = [];
      let weekIdx = 0;
      let dayIdx = startDay;
      lastMonth = 0;
      mPositions.push({ label: MONTH_LABELS[0], col: 0 });

      for (let d = 0; d < daysInYear; d++) {
         const date = new Date(year, 0, 1 + d);
         const month = date.getMonth();
         if (month !== lastMonth) {
            mPositions.push({ label: MONTH_LABELS[month], col: weekIdx });
            lastMonth = month;
         }
         dayIdx++;
         if (dayIdx === 7) {
            dayIdx = 0;
            weekIdx++;
         }
      }

      const total = Object.values(yearlyActivity).reduce((s, c) => s + (c > 0 ? 1 : 0), 0);

      // Find highest milestone reached
      let currentMilestone = null;
      for (let i = MILESTONES.length - 1; i >= 0; i--) {
         if (total >= MILESTONES[i].threshold) {
            currentMilestone = MILESTONES[i];
            break;
         }
      }

      // Next milestone
      const nextMilestone = MILESTONES.find((m) => total < m.threshold) || null;

      return {
         weeks: allWeeks,
         totalDays: total,
         milestone: currentMilestone,
         nextMilestone,
         monthPositions: mPositions,
      };
   }, [yearlyActivity]);

   return (
      <Card>
         <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
               <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Dias Treinados em {new Date().getFullYear()}
               </CardTitle>
               <span className="text-sm font-semibold text-primary">{totalDays} dias</span>
            </div>
         </CardHeader>
         <CardContent className="space-y-3">
            {/* Milestone notification */}
            {milestone && (
               <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2">
                  <Award className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-medium">
                     {milestone.emoji} {milestone.label}!
                  </span>
               </div>
            )}

            {/* Heatmap grid */}
            <div className="overflow-x-auto">
               <div className="min-w-[700px]">
                  {/* Month labels */}
                  <div className="flex ml-8 mb-1">
                     {monthPositions.map((m, i) => (
                        <span
                           key={i}
                           className="text-[10px] text-muted-foreground"
                           style={{
                              position: 'absolute' as const,
                              marginLeft: `${m.col * 14}px`,
                           }}
                        >
                           {m.label}
                        </span>
                     ))}
                  </div>

                  <div className="flex gap-[2px] mt-4">
                     {/* Day labels */}
                     <div className="flex flex-col gap-[2px] mr-1 shrink-0">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                           <div key={i} className="h-[12px] w-5 text-[9px] text-muted-foreground flex items-center justify-end pr-1">
                              {i % 2 === 1 ? d : ''}
                           </div>
                        ))}
                     </div>

                     {/* Weeks (columns) */}
                     {weeks.map((week, wi) => (
                        <div key={wi} className="flex flex-col gap-[2px]">
                           {week.map((day, di) => (
                              <div
                                 key={di}
                                 className={`h-[12px] w-[12px] rounded-[2px] transition-colors ${
                                    day.date === ''
                                       ? 'bg-transparent'
                                       : day.future
                                          ? 'bg-secondary/20'
                                          : getIntensity(day.count)
                                 }`}
                                 title={day.date ? `${day.date}: ${day.count} treino${day.count !== 1 ? 's' : ''}` : ''}
                              />
                           ))}
                           {/* Pad incomplete weeks */}
                           {week.length < 7 && Array.from({ length: 7 - week.length }).map((_, i) => (
                              <div key={`pad-${i}`} className="h-[12px] w-[12px]" />
                           ))}
                        </div>
                     ))}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-end gap-1 mt-2">
                     <span className="text-[10px] text-muted-foreground mr-1">Menos</span>
                     <div className="h-[10px] w-[10px] rounded-[2px] bg-secondary/40" />
                     <div className="h-[10px] w-[10px] rounded-[2px] bg-primary/30" />
                     <div className="h-[10px] w-[10px] rounded-[2px] bg-primary/55" />
                     <div className="h-[10px] w-[10px] rounded-[2px] bg-primary/85" />
                     <span className="text-[10px] text-muted-foreground ml-1">Mais</span>
                  </div>
               </div>
            </div>
         </CardContent>
      </Card>
   );
}
