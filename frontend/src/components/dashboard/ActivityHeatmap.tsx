import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Award, ChevronLeft, ChevronRight } from 'lucide-react';

// Average Brazilian gymgoer: ~156 days/year (3x/week)
const MILESTONES = [
   { threshold: 78, label: 'Acima de 50% dos brasileiros', emoji: '💪' },
   { threshold: 109, label: 'Acima de 70% dos brasileiros', emoji: '🔥' },
   { threshold: 140, label: 'Acima de 90% dos brasileiros', emoji: '🏆' },
   { threshold: 200, label: 'Top 1% do Brasil', emoji: '⭐' },
];

const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface Props {
   yearlyActivity: Record<string, number>;
}

export function ActivityHeatmap({ yearlyActivity }: Props) {
   const [hoveredDay, setHoveredDay] = useState<string | null>(null);
   const [viewDate, setViewDate] = useState(() => new Date());

   const totalDays = useMemo(
      () => Object.values(yearlyActivity).reduce((s, c) => s + (c > 0 ? 1 : 0), 0),
      [yearlyActivity],
   );

   const milestone = useMemo(() => {
      for (let i = MILESTONES.length - 1; i >= 0; i--) {
         if (totalDays >= MILESTONES[i].threshold) return MILESTONES[i];
      }
      return null;
   }, [totalDays]);

   const calendarData = useMemo(() => {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      const firstDayOfWeek = new Date(year, month, 1).getDay();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const toDateKey = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;

      const grid: { day: number; dateKey: string; active: boolean; isToday: boolean; inMonth: boolean; hasLeft: boolean; hasRight: boolean }[][] = [];
      let date = 1 - firstDayOfWeek;

      for (let row = 0; row < 6; row++) {
         const week: typeof grid[0] = [];
         for (let col = 0; col < 7; col++) {
            const d = new Date(year, month, date);
            const key = toDateKey(d);
            week.push({
               day: d.getDate(),
               dateKey: key,
               active: (yearlyActivity[key] || 0) > 0,
               isToday: d.getTime() === today.getTime(),
               inMonth: d.getMonth() === month,
               hasLeft: false, hasRight: false,
            });
            date++;
         }
         grid.push(week);
         if (grid.length >= 5 && new Date(year, month, date).getMonth() !== month) break;
      }

      // Compute streak connections (horizontal only, each row is an independent pill)
      for (let r = 0; r < grid.length; r++) {
         for (let c = 0; c < 7; c++) {
            const cell = grid[r][c];
            if (!cell.active || !cell.inMonth) continue;
            if (c > 0 && grid[r][c - 1].active && grid[r][c - 1].inMonth) cell.hasLeft = true;
            if (c < 6 && grid[r][c + 1].active && grid[r][c + 1].inMonth) cell.hasRight = true;
         }
      }
      return grid;
   }, [viewDate, yearlyActivity]);

   const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
   const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

   return (
      <Card>
         <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
               <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 icon-gradient" />
                  Dias de Treino em {new Date().getFullYear()}
               </CardTitle>
               <span className="text-sm font-semibold text-gradient">{totalDays} dias</span>
            </div>
         </CardHeader>
         <CardContent className="space-y-3">
            {milestone && (
               <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2">
                  <Award className="h-4 w-4 icon-gradient shrink-0" />
                  <span className="text-sm font-medium">
                     {milestone.emoji} {milestone.label}!
                  </span>
               </div>
            )}

            {/* Month navigation */}
            <div className="flex items-center justify-center gap-3 sm:gap-4">
               <Button variant="ghost" size="icon" onClick={prevMonth} className="h-10 w-10" aria-label="Ver mês anterior">
                  <ChevronLeft className="h-4 w-4" />
               </Button>
               <span className="text-sm font-semibold min-w-36 text-center">
                  {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
               </span>
               <Button variant="ghost" size="icon" onClick={nextMonth} className="h-10 w-10" aria-label="Ver próximo mês">
                  <ChevronRight className="h-4 w-4" />
               </Button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 text-center">
               {DAY_NAMES.map((d) => (
                  <span key={d} className="text-xs font-medium text-muted-foreground py-1">{d}</span>
               ))}
            </div>

            {/* Calendar grid */}
            <div role="grid" aria-label={`Atividade em ${MONTH_NAMES[viewDate.getMonth()]} de ${viewDate.getFullYear()}`}>
               {calendarData.map((week, rowIdx) => (
                  <div key={rowIdx} className="grid grid-cols-7">
                     {week.map((cell, colIdx) => {
                        const showBand = cell.active && cell.inMonth && (cell.hasLeft || cell.hasRight);
                        return (
                           <div
                              key={colIdx}
                              className="relative flex items-center justify-center h-10"
                              onMouseEnter={() => cell.inMonth ? setHoveredDay(cell.dateKey) : undefined}
                              onMouseLeave={() => setHoveredDay(null)}
                           >
                              {/* Streak pill band */}
                              {showBand && (
                                 <div
                                    className="absolute top-1/2 -translate-y-1/2 h-9 bg-primary/25"
                                    style={{
                                       left: cell.hasLeft ? 0 : 'calc(50% - 18px)',
                                       right: cell.hasRight ? 0 : 'calc(50% - 18px)',
                                       borderTopLeftRadius: cell.hasLeft ? 0 : 9999,
                                       borderBottomLeftRadius: cell.hasLeft ? 0 : 9999,
                                       borderTopRightRadius: cell.hasRight ? 0 : 9999,
                                       borderBottomRightRadius: cell.hasRight ? 0 : 9999,
                                    }}
                                 />
                              )}
                              {/* Day circle */}
                              <span
                                 className={`relative z-10 w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors ${!cell.inMonth
                                    ? 'text-muted-foreground/25'
                                    : cell.isToday && cell.active
                                       ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/30'
                                       : cell.isToday
                                          ? 'ring-2 ring-orange-500 text-foreground font-bold'
                                          : cell.active
                                             ? 'bg-primary text-primary-foreground font-medium'
                                             : 'text-foreground'
                                    }`}
                              >
                                 {cell.day}
                              </span>
                           </div>
                        );
                     })}
                  </div>
               ))}
            </div>

            {/* Hover info */}
            {hoveredDay && (
               <p className="text-center text-xs text-muted-foreground">
                  {hoveredDay.split('-')[2]}/{hoveredDay.split('-')[1]} — {yearlyActivity[hoveredDay] || 0} treino{(yearlyActivity[hoveredDay] || 0) !== 1 ? 's' : ''}
               </p>
            )}

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 pt-1 text-xs text-muted-foreground">
               <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-primary" />
                  <span>Treino</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>Hoje</span>
               </div>
            </div>
         </CardContent>
      </Card>
   );
}
