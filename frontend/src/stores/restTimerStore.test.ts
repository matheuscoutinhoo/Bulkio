// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getRestTimerRemaining, useRestTimerStore } from './restTimerStore';

describe('persisted rest timer', () => {
   beforeEach(() => { vi.useFakeTimers(); useRestTimerStore.getState().finish(); });
   afterEach(() => { useRestTimerStore.getState().finish(); vi.useRealTimers(); });

   it('persists every control immediately, without relying on a pagehide or unload event', () => {
      const store = useRestTimerStore.getState();
      store.start('user-1', 60, 'Supino');
      const read = () => JSON.parse(localStorage.getItem('bulkio-rest-timer')!).state.timer;
      expect(read().deadline).toBe(Date.now() + 60000);
      vi.setSystemTime(Date.now() + 10000);
      store.adjust(15);
      expect(read().totalSeconds).toBe(75);
      expect(read().deadline).toBe(Date.now() + 65000);
      store.pause();
      expect(read().deadline).toBeNull();
      expect(read().remainingSeconds).toBe(65);
      store.adjust(-15);
      expect(read().remainingSeconds).toBe(50);
      expect(read().deadline).toBeNull();
      vi.setSystemTime(Date.now() + 120000);
      store.resume();
      expect(read().deadline).toBe(Date.now() + 50000);
      store.restart();
      expect(read().deadline).toBe(Date.now() + 60000);
      store.finish();
      expect(read()).toBeNull();
   });

   it('completes an expired session once and does not complete a newer timer', () => {
      const store = useRestTimerStore.getState();
      store.start('user-1', 60, 'Supino');
      const id = useRestTimerStore.getState().timer!.id;
      vi.setSystemTime(Date.now() + 90000);
      expect(store.completeIfElapsed(id)).toBe(true);
      expect(store.completeIfElapsed(id)).toBe(false);
      store.start('user-1', 30, 'Remada');
      expect(store.completeIfElapsed(id)).toBe(false);
      expect(getRestTimerRemaining(useRestTimerStore.getState().timer!)).toBe(30);
   });

   it.each([
      { ownerId: 'user-1' },
      { id: 'old', ownerId: 'user-1', exerciseName: 'Supino', totalSeconds: 60, remainingSeconds: 60, deadline: 'invalid' },
      { id: 'old', ownerId: 'user-1', exerciseName: 'Supino', totalSeconds: 60, remainingSeconds: -1, deadline: null },
   ])('ignores malformed persisted timer data', async (timer) => {
      localStorage.setItem('bulkio-rest-timer', JSON.stringify({ version: 1, state: { timer } }));
      await useRestTimerStore.persist.rehydrate();
      expect(useRestTimerStore.getState().timer).toBeNull();
   });
});
