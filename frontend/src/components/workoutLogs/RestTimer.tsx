import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, RotateCcw, Check, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTitle } from '@/components/ui/dialog';

interface RestTimerProps {
   initialSeconds: number;
   exerciseName: string;
   onClose: () => void;
}

export function RestTimer({ initialSeconds, exerciseName, onClose }: RestTimerProps) {
   const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
   const [remaining, setRemaining] = useState(initialSeconds);
   const [running, setRunning] = useState(initialSeconds > 0);
   const [initialDeadline] = useState(() => Date.now() + initialSeconds * 1000);
   const finished = remaining === 0;
   const deadlineRef = useRef<number | null>(initialSeconds > 0 ? initialDeadline : null);
   const audioRef = useRef<AudioContext | null>(null);

   const playBeep = useCallback(() => {
      try {
         const ctx = audioRef.current ?? new AudioContext();
         audioRef.current = ctx;
         if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
         [880, 1100].forEach((frequency, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = frequency;
            gain.gain.value = 0.3;
            const start = ctx.currentTime + index * 0.2;
            osc.start(start);
            osc.stop(start + 0.15);
         });
      } catch {
         // Audio not supported
      }
   }, []);

   useEffect(() => {
      if (!running) return;
      const tick = () => {
         if (deadlineRef.current == null) return;
         const secondsLeft = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
         setRemaining(secondsLeft);
         if (secondsLeft === 0) {
            deadlineRef.current = null;
            setRunning(false);
            playBeep();
         }
      };
      const interval = setInterval(tick, 250);
      document.addEventListener('visibilitychange', tick);
      window.addEventListener('focus', tick);
      return () => {
         clearInterval(interval);
         document.removeEventListener('visibilitychange', tick);
         window.removeEventListener('focus', tick);
      };
   }, [running, playBeep]);

   useEffect(() => {
      return () => {
         if (audioRef.current) void audioRef.current.close().catch(() => {});
      };
   }, []);

   const handleReset = () => {
      deadlineRef.current = Date.now() + totalSeconds * 1000;
      setRemaining(totalSeconds);
      setRunning(true);
   };

   const handleAdjust = (delta: number) => {
      const newTotal = Math.max(5, totalSeconds + delta);
      const current = deadlineRef.current == null ? remaining : Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      const nextRemaining = Math.max(0, current + newTotal - totalSeconds);
      const shouldRun = nextRemaining > 0 && (running || finished);
      setTotalSeconds(newTotal);
      setRemaining(nextRemaining);
      deadlineRef.current = shouldRun ? Date.now() + nextRemaining * 1000 : null;
      setRunning(shouldRun);
   };

   const handleToggle = () => {
      if (running) {
         setRemaining(Math.max(0, Math.ceil(((deadlineRef.current ?? Date.now()) - Date.now()) / 1000)));
         deadlineRef.current = null;
      } else {
         deadlineRef.current = Date.now() + remaining * 1000;
      }
      setRunning(!running);
   };

   const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;
   const minutes = Math.floor(remaining / 60);
   const seconds = remaining % 60;

   const circumference = 2 * Math.PI * 54;
   const strokeOffset = circumference * (1 - progress);

   return (
         <Dialog open onClose={onClose} dismissible={false}
            className={cn(
               'max-w-sm p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6',
               finished && 'animate-timer-pulse',
            )}
         >
            <div className="text-center space-y-1 mb-5">
               <DialogTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Descanso</DialogTitle>
               <p className="text-sm font-medium text-foreground break-words">{exerciseName}</p>
            </div>

            {/* Circular progress */}
            <div className="flex justify-center mb-5">
               <div className="relative w-32 h-32 sm:w-36 sm:h-36">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
                     <circle
                        cx="60" cy="60" r="54"
                        fill="none"
                        stroke="currentColor"
                        className="text-muted/40"
                        strokeWidth="6"
                     />
                     <circle
                        cx="60" cy="60" r="54"
                        fill="none"
                        stroke="currentColor"
                        className={cn(
                           'transition-all duration-1000 ease-linear',
                           finished ? 'text-success' : remaining <= 5 ? 'text-warning' : 'text-primary',
                        )}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeOffset}
                     />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span
                        aria-live={finished ? 'assertive' : 'off'}
                        className={cn(
                           'text-3xl sm:text-4xl font-bold tabular-nums',
                           finished && 'text-success',
                        )}
                     >
                        {minutes}:{seconds.toString().padStart(2, '0')}
                     </span>
                     <span role="status" className={cn('text-xs font-medium mt-0.5', finished ? 'text-success' : 'text-muted-foreground')}>
                        {finished ? 'Descanso concluído!' : running ? 'Em contagem' : 'Pausado'}
                     </span>
                  </div>
               </div>
            </div>

            {/* Time adjust */}
            <div className="flex items-center justify-center gap-2 mb-5">
               <Button
                  variant="outline"
                  size="sm"
                  className="min-h-11 rounded-full px-3 gap-1.5"
                  aria-label="Diminuir descanso em 15 segundos"
                  disabled={totalSeconds <= 5}
                  onClick={() => handleAdjust(-15)}
               >
                  <Minus className="h-3.5 w-3.5" />
                  <span className="text-xs">15s</span>
               </Button>
               <span className="text-xs text-muted-foreground w-16 text-center tabular-nums">
                  {Math.floor(totalSeconds / 60)}:{(totalSeconds % 60).toString().padStart(2, '0')}
               </span>
               <Button
                  variant="outline"
                  size="sm"
                  className="min-h-11 rounded-full px-3 gap-1.5"
                  aria-label="Aumentar descanso em 15 segundos"
                  onClick={() => handleAdjust(15)}
               >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="text-xs">15s</span>
               </Button>
            </div>

            {/* Controls */}
            <div className="grid gap-3">
               {!finished ? (
                  <Button
                     size="lg"
                     variant={running ? 'outline' : 'default'}
                     className="rounded-full px-8"
                     onClick={handleToggle}
                  >
                     {running ? (
                        <><Pause className="h-4 w-4 mr-2" /> Pausar</>
                     ) : (
                        <><Play className="h-4 w-4 mr-2" /> Retomar</>
                     )}
                  </Button>
               ) : (
                  <>
                     <Button
                        variant="outline"
                        className="rounded-full px-6"
                        onClick={handleReset}
                     >
                        <RotateCcw className="h-4 w-4 mr-2" /> Reiniciar
                     </Button>
                  </>
               )}
               <Button size="lg" className="w-full rounded-full" onClick={onClose}>
                  <Check className="h-4 w-4" aria-hidden="true" /> Finalizar descanso
               </Button>
            </div>
         </Dialog>
   );
}
