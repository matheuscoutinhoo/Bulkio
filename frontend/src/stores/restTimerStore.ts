import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RestTimerSession {
   id: string;
   ownerId: string;
   exerciseName: string;
   totalSeconds: number;
   remainingSeconds: number;
   deadline: number | null;
}

interface RestTimerState {
   timer: RestTimerSession | null;
   start: (ownerId: string, seconds: number, exerciseName: string) => void;
   pause: () => void;
   resume: () => void;
   adjust: (delta: number) => void;
   restart: () => void;
   finish: () => void;
   completeIfElapsed: (id: string) => boolean;
}

export function getRestTimerRemaining(timer: RestTimerSession, now = Date.now()): number {
   return timer.deadline == null
      ? timer.remainingSeconds
      : Math.min(timer.totalSeconds, Math.max(0, Math.ceil((timer.deadline - now) / 1000)));
}

function isRestTimerSession(value: unknown): value is RestTimerSession {
   if (!value || typeof value !== 'object') return false;
   const timer = value as RestTimerSession;
   return typeof timer.id === 'string' && timer.id.length > 0
      && typeof timer.ownerId === 'string' && timer.ownerId.length > 0
      && typeof timer.exerciseName === 'string'
      && Number.isInteger(timer.totalSeconds) && timer.totalSeconds > 0
      && Number.isInteger(timer.remainingSeconds) && timer.remainingSeconds >= 0
      && timer.remainingSeconds <= timer.totalSeconds
      && (timer.deadline === null || (typeof timer.deadline === 'number' && Number.isFinite(timer.deadline) && timer.deadline > 0));
}

export const useRestTimerStore = create<RestTimerState>()(
   persist(
      (set, get) => ({
         timer: null,
         start: (ownerId, seconds, exerciseName) => {
            if (!ownerId || !Number.isInteger(seconds) || seconds <= 0) return;
            // Save the absolute deadline immediately: mobile pages may be killed without a lifecycle event.
            set({ timer: {
               id: crypto.randomUUID(),
               ownerId,
               exerciseName,
               totalSeconds: seconds,
               remainingSeconds: seconds,
               deadline: Date.now() + seconds * 1000,
            } });
         },
         pause: () => {
            const timer = get().timer;
            if (timer?.deadline == null) return;
            set({ timer: { ...timer, remainingSeconds: getRestTimerRemaining(timer), deadline: null } });
         },
         resume: () => {
            const timer = get().timer;
            if (!timer || timer.deadline != null || timer.remainingSeconds === 0) return;
            set({ timer: { ...timer, deadline: Date.now() + timer.remainingSeconds * 1000 } });
         },
         adjust: (delta) => {
            const timer = get().timer;
            if (!timer || !Number.isInteger(delta)) return;
            const now = Date.now();
            const remaining = getRestTimerRemaining(timer, now);
            const totalSeconds = Math.max(5, timer.totalSeconds + delta);
            const remainingSeconds = Math.max(0, remaining + totalSeconds - timer.totalSeconds);
            const running = remainingSeconds > 0 && (timer.deadline != null || remaining === 0);
            set({ timer: { ...timer, totalSeconds, remainingSeconds, deadline: running ? now + remainingSeconds * 1000 : null } });
         },
         restart: () => {
            const timer = get().timer;
            if (!timer) return;
            set({ timer: { ...timer, remainingSeconds: timer.totalSeconds, deadline: Date.now() + timer.totalSeconds * 1000 } });
         },
         finish: () => set({ timer: null }),
         completeIfElapsed: (id) => {
            const timer = get().timer;
            if (!timer || timer.id !== id || timer.deadline == null || timer.deadline > Date.now()) return false;
            set({ timer: { ...timer, remainingSeconds: 0, deadline: null } });
            return true;
         },
      }),
      {
         name: 'bulkio-rest-timer',
         version: 1,
         partialize: (state) => ({ timer: state.timer }),
         merge: (persisted, current) => {
            const timer = (persisted as { timer?: unknown } | undefined)?.timer;
            return { ...current, timer: isRestTimerSession(timer) ? timer : null };
         },
      },
   ),
);
