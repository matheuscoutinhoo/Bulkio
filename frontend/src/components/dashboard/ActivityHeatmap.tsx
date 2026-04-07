import { useMemo, useState } from 'react';
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

const SHORT_MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

interface Props {
   yearlyActivity: Record<string, number>;
}

function getIntensity(count: number): string {
   if (count === 0) return 'bg-muted-foreground/15';
   if (count === 1) return 'bg-primary/30';
   if (count === 2) return 'bg-primary/55';
   return 'bg-primary/85';
}

function formatDateLabel(dateStr: string): string {
   const [, month, day] = dateStr.split('-');
   return `${day} ${SHORT_MONTHS[parseInt(month, 10) - 1]}`;
}

export function ActivityHeatmap({ yearlyActivity }: Props) {
   const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

   const { weeks, totalDays, milestone, monthPositions } = useMemo(() => {
      const year = new Date().getFullYear();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const jan1 = new Date(year, 0, 1);
      const startDay = jan1.getDay();

      const allWeeks: { date: string; count: number; future: boolean }[][] = [];
      let currentWeek: { date: string; count: number; future: boolean }[] = [];

      for (let i = 0; i < startDay; i++) {
         currentWeek.push({ date: '', count: 0, future: true });
      }

      let lastMonth = -1;
      const daysInYear = ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 366 : 365;

      for (let d = 0; d < daysInYear; d++) {
         const date = new Date(year, 0, 1 + d);
         const key = date.toISOString().split('T')[0];

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

      // Month label positions
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

      let currentMilestone = null;
      for (let i = MILESTONES.length - 1; i >= 0; i--) {
         if (total >= MILESTONES[i].threshold) {
            currentMilestone = MILESTONES[i];
            break;
         }
      }

      return {
         weeks: allWeeks,
         totalDays: total,
         milestone: currentMilestone,
         monthPositions: mPositions,
      };
   }, [yearlyActivity]);

   const totalWeeks = weeks.length;

   return (
      <Card>
         <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
               <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Dias de Treino em {new Date().getFullYear()}
               </CardTitle>
               <span className="text-sm font-semibold text-primary">{totalDays} dias</span>
            </div>
         </CardHeader>
         <CardContent className="space-y-3">
            {milestone && (
               <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2">
                  <Award className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-medium">
                     {milestone.emoji} {milestone.label}!
                  </span>
               </div>
            )}

            {/* Heatmap grid */}
            <div className="relative">
               {/* Month labels */}
               <div
                  className="grid mb-1"
                  style={{ gridTemplateColumns: `repeat(${totalWeeks}, 1fr)` }}
               >
                  {monthPositions.map((m, i) => (
                     <span
                        key={i}
                        className="text-[10px] text-muted-foreground"
                        style={{ gridColumnStart: m.col + 1 }}
                     >
                        {m.label}
                     </span>
                  ))}
               </div>

               {/* Grid of weeks */}
               <div
                  className="grid gap-[3px]"
                  style={{ gridTemplateColumns: `repeat(${totalWeeks}, 1fr)` }}
               >
                  {weeks.map((week, wi) => (
                     <div key={wi} className="grid grid-rows-7 gap-[3px]">
                        {Array.from({ length: 7 }).map((_, ri) => {
                           const day = week[ri];
                           if (!day) return <div key={ri} className="aspect-square w-full" />;
                           return (
                              <div
                                 key={ri}
                                 className={`aspect-square w-full rounded-[3px] transition-colors ${
                                    day.date === ''
                                       ? 'bg-transparent'
                                       : getIntensity(day.count)
                                 }`}
                                 onMouseEnter={(e) => {
                                    if (!day.date) return;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const parentRect = e.currentTarget.closest('.relative')!.getBoundingClientRect();
                                    setHoveredDay({
                                       date: day.date,
                                       count: day.count,
                                       x: rect.left - parentRect.left + rect.width / 2,
                                       y: rect.top - parentRect.top - 4,
                                    });
                                 }}
                                 onMouseLeave={() => setHoveredDay(null)}
                              />
                           );
                        })}
                     </div>
                  ))}
               </div>

               {/* Tooltip */}
               {hoveredDay && (
                  <div
                     className="absolute pointer-events-none z-10 bg-popover border border-border text-popover-foreground text-xs font-medium px-2 py-1 rounded-md shadow-md -translate-x-1/2 -translate-y-full"
                     style={{ left: hoveredDay.x, top: hoveredDay.y }}
                  >
                     {formatDateLabel(hoveredDay.date)} — {hoveredDay.count} treino{hoveredDay.count !== 1 ? 's' : ''}
                  </div>
               )}

               {/* Legend */}
               <div className="flex items-center justify-end gap-1 mt-2">
                  <span className="text-[10px] text-muted-foreground mr-1">Menos</span>
                  <div className="h-[10px] w-[10px] rounded-[2px] bg-muted-foreground/15" />
                  <div className="h-[10px] w-[10px] rounded-[2px] bg-primary/30" />
                  <div className="h-[10px] w-[10px] rounded-[2px] bg-primary/55" />
                  <div className="h-[10px] w-[10px] rounded-[2px] bg-primary/85" />
                  <span className="text-[10px] text-muted-foreground ml-1">Mais</span>
               </div>
            </div>
         </CardContent>
      </Card>
   );
}
