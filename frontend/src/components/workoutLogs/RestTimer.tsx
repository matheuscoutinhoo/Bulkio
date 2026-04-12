import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Play, Pause, RotateCcw, X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RestTimerProps {
   initialSeconds: number;
   exerciseName: string;
   onClose: () => void;
}

export function RestTimer({ initialSeconds, exerciseName, onClose }: RestTimerProps) {
   const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
   const [remaining, setRemaining] = useState(initialSeconds);
   const [running, setRunning] = useState(true);
   const [finished, setFinished] = useState(false);
   const audioRef = useRef<AudioContext | null>(null);

   const playBeep = useCallback(() => {
      try {
         const ctx = audioRef.current ?? new AudioContext();
         audioRef.current = ctx;
         const osc = ctx.createOscillator();
         const gain = ctx.createGain();
         osc.connect(gain);
         gain.connect(ctx.destination);
         osc.frequency.value = 880;
         gain.gain.value = 0.3;
         osc.start();
         osc.stop(ctx.currentTime + 0.15);
         setTimeout(() => {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.frequency.value = 1100;
            gain2.gain.value = 0.3;
            osc2.start();
            osc2.stop(ctx.currentTime + 0.2);
         }, 200);
      } catch {
         // Audio not supported
      }
   }, []);

   useEffect(() => {
      if (!running || finished) return;

      const interval = setInterval(() => {
         setRemaining((prev) => {
            if (prev <= 1) {
               clearInterval(interval);
               setRunning(false);
               setFinished(true);
               playBeep();
               return 0;
            }
            return prev - 1;
         });
      }, 1000);

      return () => clearInterval(interval);
   }, [running, finished, playBeep]);

   useEffect(() => {
      return () => {
         if (audioRef.current) {
            audioRef.current.close();
         }
      };
   }, []);

   const handleReset = () => {
      setRemaining(totalSeconds);
      setRunning(true);
      setFinished(false);
   };

   const handleAdjust = (delta: number) => {
      const newTotal = Math.max(5, totalSeconds + delta);
      setTotalSeconds(newTotal);
      setRemaining((prev) => Math.max(0, prev + delta));
   };

   const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;
   const minutes = Math.floor(remaining / 60);
   const seconds = remaining % 60;

   const circumference = 2 * Math.PI * 54;
   const strokeOffset = circumference * (1 - progress);

   return createPortal(
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
         <div className="fixed inset-0 bg-black/60 animate-fade-in" onClick={onClose} />
         <div
            className={cn(
               'relative z-50 w-full sm:w-auto sm:min-w-80 rounded-t-2xl sm:rounded-2xl border bg-background p-6 shadow-2xl animate-timer-slide-up sm:animate-scale-in',
               finished && 'animate-timer-pulse',
            )}
         >
            <button
               onClick={onClose}
               className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
            >
               <X className="h-4 w-4" />
            </button>

            <div className="text-center space-y-1 mb-5">
               <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Descanso</p>
               <p className="text-sm font-medium text-foreground truncate max-w-60 mx-auto">{exerciseName}</p>
            </div>

            {/* Circular progress */}
            <div className="flex justify-center mb-5">
               <div className="relative w-32 h-32 sm:w-36 sm:h-36">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
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
                        className={cn(
                           'text-3xl sm:text-4xl font-bold tabular-nums',
                           finished && 'text-success',
                        )}
                     >
                        {minutes}:{seconds.toString().padStart(2, '0')}
                     </span>
                     {finished && (
                        <span className="text-xs text-success font-medium mt-0.5">Pronto!</span>
                     )}
                  </div>
               </div>
            </div>

            {/* Time adjust */}
            <div className="flex items-center justify-center gap-3 mb-5">
               <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => handleAdjust(-15)}
               >
                  <Minus className="h-3.5 w-3.5" />
               </Button>
               <span className="text-xs text-muted-foreground w-16 text-center">
                  {Math.floor(totalSeconds / 60)}:{(totalSeconds % 60).toString().padStart(2, '0')}
               </span>
               <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => handleAdjust(15)}
               >
                  <Plus className="h-3.5 w-3.5" />
               </Button>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
               {!finished ? (
                  <Button
                     size="lg"
                     variant={running ? 'outline' : 'default'}
                     className="rounded-full px-8"
                     onClick={() => setRunning(!running)}
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
                     <Button
                        className="rounded-full px-6"
                        onClick={onClose}
                     >
                        Continuar
                     </Button>
                  </>
               )}
            </div>
         </div>
      </div>,
      document.body,
   );
}
