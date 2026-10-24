import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, LoaderCircle, MoveHorizontal, RotateCcw, UserRound } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getMuscleDistribution, MUSCLE_COLORS, UNTRAINED_COLOR } from './muscleDistribution';
import type { MuscleScene } from './muscleBodyScene';

interface Props {
   distribution: Record<string, number>;
}

export function MuscleBodyMap({ distribution }: Props) {
   const { entries, total } = useMemo(() => getMuscleDistribution(distribution), [distribution]);
   const [selected, setSelected] = useState<string | null>(null);
   const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
   const [attempt, setAttempt] = useState(0);
   const host = useRef<HTMLDivElement>(null);
   const scene = useRef<MuscleScene | null>(null);
   const helpId = useId();
   const titleId = useId();
   const selectedEntry = entries.find(entry => entry.group === selected);

   useEffect(() => {
      let cancelled = false;
      let instance: MuscleScene | null = null;
      setStatus('loading');
      void import('./muscleBodyScene').then(({ createMuscleScene }) => {
         if (cancelled || !host.current) return;
         instance = createMuscleScene(host.current, setSelected,
            () => { if (!cancelled) setStatus('ready'); },
            () => {
               if (!cancelled) {
                  setStatus('error');
                  instance?.dispose();
                  instance = null;
                  scene.current = null;
               }
            });
         scene.current = instance;
      }).catch(() => { if (!cancelled) setStatus('error'); });
      return () => {
         cancelled = true;
         instance?.dispose();
         scene.current = null;
      };
   }, [attempt]);

   useEffect(() => { scene.current?.update(entries, selected); }, [entries, selected, status]);

   return (
      <Card aria-labelledby={titleId}>
         <CardHeader className="sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
               <CardTitle id={titleId} className="text-base sm:text-lg">Distribuição Muscular (30d)</CardTitle>
               <p className="text-sm text-muted-foreground">Seu treino, visto de todos os ângulos.</p>
            </div>
            <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-foreground">
               {total.toLocaleString('pt-BR')} {total === 1 ? 'série registrada' : 'séries registradas'}
            </span>
         </CardHeader>
         <CardContent>
            <div className="grid gap-5 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] sm:gap-8">
               <div className="min-w-0">
                  <div className="relative overflow-hidden rounded-xl border border-border/50 bg-[radial-gradient(ellipse_at_center,var(--color-secondary),var(--color-card)_75%)]">
                     <span className="pointer-events-none absolute left-4 top-3 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground">MAPA MUSCULAR · 3D</span>
                     <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 z-10" disabled={status !== 'ready'} aria-label="Restaurar posição inicial" onClick={() => { scene.current?.view('front'); setSelected(null); }}><RotateCcw className="h-4 w-4" /></Button>
                     <div
                        ref={host}
                        role="group"
                        tabIndex={status === 'ready' ? 0 : -1}
                        aria-label="Modelo corporal 3D rotacionável"
                        aria-describedby={helpId}
                        className="h-85 w-full select-none cursor-grab outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary active:cursor-grabbing sm:h-120"
                        onKeyDown={event => {
                           if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                              event.preventDefault();
                              scene.current?.rotate(event.key === 'ArrowLeft' ? Math.PI / 8 : -Math.PI / 8);
                           } else if (event.key === 'Home') {
                              event.preventDefault();
                              scene.current?.view('front');
                           }
                        }}
                     />
                     {status === 'loading' && (
                        <div role="status" className="absolute inset-0 flex items-center justify-center gap-2 bg-card/80 text-sm text-muted-foreground">
                           <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" /> Carregando modelo 3D…
                        </div>
                     )}
                     {status === 'error' && (
                        <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/95 px-6 text-center">
                           <UserRound className="h-10 w-10 text-muted-foreground" />
                           <p className="text-sm font-medium">Visualização 3D indisponível</p>
                           <p className="max-w-64 text-xs text-muted-foreground">Você ainda pode consultar as séries de cada grupo na lista.</p>
                           <Button variant="outline" size="sm" onClick={() => setAttempt(value => value + 1)}>Tentar novamente</Button>
                        </div>
                     )}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2" aria-label="Controles do modelo corporal">
                     <Button type="button" variant="outline" size="icon" disabled={status !== 'ready'} aria-label="Girar corpo para a esquerda" onClick={() => scene.current?.rotate(Math.PI / 8)}><ChevronLeft className="h-4 w-4" /></Button>
                     <Button type="button" variant="secondary" size="sm" disabled={status !== 'ready'} onClick={() => scene.current?.view('front')}>Frente</Button>
                     <Button type="button" variant="secondary" size="sm" disabled={status !== 'ready'} onClick={() => scene.current?.view('back')}>Costas</Button>
                     <Button type="button" variant="outline" size="icon" disabled={status !== 'ready'} aria-label="Girar corpo para a direita" onClick={() => scene.current?.rotate(-Math.PI / 8)}><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                  <p id={helpId} className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
                     <MoveHorizontal className="h-3.5 w-3.5 shrink-0" /> Arraste para girar ou use as setas do teclado.
                  </p>
               </div>

               <div className="flex min-w-0 flex-col">
                  <div className="mb-3 flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                     <span>Grupo muscular</span><span>Séries · %</span>
                  </div>
                  <ul className="grid grid-cols-1 gap-1 min-[480px]:grid-cols-2 sm:grid-cols-1" aria-label="Séries por grupo muscular">
                     {entries.map(entry => (
                        <li key={entry.group}>
                           <button
                              type="button"
                              aria-pressed={selected === entry.group}
                              aria-label={`${entry.name}: ${entry.sets} séries, ${entry.percent}%${entry.mapped ? '' : ', sem região específica no mapa'}`}
                              onClick={() => setSelected(selected === entry.group ? null : entry.group)}
                              className={cn('flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left text-xs transition-colors hover:bg-secondary/70 sm:text-sm', selected === entry.group && 'bg-primary/10 ring-1 ring-primary/30')}
                           >
                              <span className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/10" style={{ backgroundColor: entry.color }} />
                              <span className="min-w-0 flex-1 truncate">{entry.name}</span>
                              <span className="shrink-0 font-medium tabular-nums">{entry.sets.toLocaleString('pt-BR')}</span>
                              <span className="w-8 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">{entry.percent}%</span>
                           </button>
                        </li>
                     ))}
                  </ul>
                  <div role="status" aria-live="polite" aria-atomic="true" className="mt-3 min-h-14 rounded-lg bg-secondary/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                     {selectedEntry ? <><span className="font-semibold text-foreground">{selectedEntry.name}</span> · {selectedEntry.sets} séries nos últimos 30 dias.{!selectedEntry.mapped && ' Categoria sem região específica no mapa.'}</>
                        : total === 0 ? 'Sem dados de treino. Conclua um treino para visualizar os grupos mais trabalhados.'
                           : 'Selecione um grupo na lista ou toque no corpo para consultar suas séries.'}
                  </div>
               </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-4 text-[11px] text-muted-foreground">
               <div className="flex items-center gap-2"><span>Menos séries</span><span className="h-2.5 w-28 rounded-full sm:w-40" style={{ background: `linear-gradient(to right, ${MUSCLE_COLORS.join(', ')})` }} /><span>Mais séries</span></div>
               <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: UNTRAINED_COLOR }} /> Sem séries / sem região</span>
            </div>
            {entries.some(entry => !entry.mapped) && <p className="mt-2 text-[11px] text-muted-foreground">Cardio, Full Body e categorias sem região específica entram no total, mas não alteram as cores do corpo.</p>}
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">Mapa esquemático dos grupos registrados. Não estima o recrutamento de músculos secundários.</p>
         </CardContent>
      </Card>
   );
}
