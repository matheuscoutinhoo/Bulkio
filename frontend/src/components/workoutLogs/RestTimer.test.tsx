// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RestTimer } from './RestTimer';
import { useRestTimerStore } from '@/stores/restTimerStore';
import { useAuthStore } from '@/stores/authStore';

const user = { id: 'timer-user', username: 'test', email: 'test@example.test' };

function restoreStoredTimer(saved: string) {
   useRestTimerStore.setState({ timer: null });
   localStorage.setItem('bulkio-rest-timer', saved);
   void useRestTimerStore.persist.rehydrate();
}

describe('rest timer', () => {
   beforeEach(() => {
      vi.useFakeTimers();
      useRestTimerStore.getState().finish();
      useAuthStore.getState().setAuth(user, 'test-token');
   });
   afterEach(() => {
      cleanup();
      useRestTimerStore.getState().finish();
      vi.useRealTimers();
   });

   it('keeps counting after backdrop clicks, Escape and parent renders; ends only with the finish button', () => {
      useRestTimerStore.getState().start(user.id, 60, 'Supino');
      const view = render(<RestTimer />);
      act(() => { vi.advanceTimersByTime(5000); });
      fireEvent.click(screen.getByRole('dialog').previousElementSibling!);
      fireEvent.keyDown(document, { key: 'Escape' });
      view.rerender(<RestTimer />);
      act(() => { vi.advanceTimersByTime(5000); });
      expect(screen.getByText('0:50')).toBeTruthy();
      expect(useRestTimerStore.getState().timer).not.toBeNull();
      fireEvent.click(screen.getByRole('button', { name: 'Finalizar descanso' }));
      expect(useRestTimerStore.getState().timer).toBeNull();
      expect(screen.queryByRole('dialog')).toBeNull();
      const saved = localStorage.getItem('bulkio-rest-timer')!;
      act(() => { restoreStoredTimer(saved); });
      expect(screen.queryByRole('dialog')).toBeNull();
   });

   it('catches up after a suspended tab and keeps the completed timer open', () => {
      useRestTimerStore.getState().start(user.id, 60, 'Supino');
      render(<RestTimer />);
      vi.setSystemTime(Date.now() + 90000);
      fireEvent(document, new Event('visibilitychange'));
      expect(screen.getByText('0:00')).toBeTruthy();
      expect(screen.getByRole('status').textContent).toBe('Descanso concluído!');
      expect(screen.getByRole('dialog')).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: 'Reiniciar' }));
      act(() => { vi.advanceTimersByTime(1000); });
      expect(screen.getByText('0:59')).toBeTruthy();
   });

   it('pauses, adjusts and resumes without counting paused time', () => {
      useRestTimerStore.getState().start(user.id, 60, 'Supino');
      render(<RestTimer />);
      act(() => { vi.advanceTimersByTime(10000); });
      fireEvent.click(screen.getByRole('button', { name: 'Pausar' }));
      act(() => { vi.advanceTimersByTime(30000); });
      expect(screen.getByText('0:50')).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: 'Aumentar descanso em 15 segundos' }));
      expect(screen.getByText('1:05')).toBeTruthy();
      expect(screen.getByText('Pausado')).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: 'Retomar' }));
      act(() => { vi.advanceTimersByTime(5000); });
      expect(screen.getByText('1:00')).toBeTruthy();
   });

   it('restarts the countdown when adding time after completion', () => {
      useRestTimerStore.getState().start(user.id, 5, 'Supino');
      render(<RestTimer />);
      act(() => { vi.advanceTimersByTime(5000); });
      fireEvent.click(screen.getByRole('button', { name: 'Aumentar descanso em 15 segundos' }));
      expect(screen.getByText('0:15')).toBeTruthy();
      act(() => { vi.advanceTimersByTime(1000); });
      expect(screen.getByText('0:14')).toBeTruthy();
   });

   it.each(['pageshow', 'focus', 'resume'])('immediately accounts for locked time on %s without waiting for an interval', (event) => {
      useRestTimerStore.getState().start(user.id, 60, 'Supino');
      render(<RestTimer />);
      vi.setSystemTime(Date.now() + 25000);
      fireEvent(event === 'resume' ? document : window, new Event(event));
      expect(screen.getByText('0:35')).toBeTruthy();
   });

   it('restores the original deadline after the mobile OS discards and reloads the page', () => {
      useRestTimerStore.getState().start(user.id, 60, 'Supino');
      const deadline = useRestTimerStore.getState().timer!.deadline;
      const view = render(<RestTimer />);
      act(() => { vi.advanceTimersByTime(10000); });
      const saved = localStorage.getItem('bulkio-rest-timer')!;
      view.unmount();
      vi.setSystemTime(Date.now() + 25000);
      restoreStoredTimer(saved);
      render(<RestTimer />);
      expect(screen.getByText('0:25')).toBeTruthy();
      expect(screen.getByText('Supino')).toBeTruthy();
      expect(useRestTimerStore.getState().timer!.deadline).toBe(deadline);
   });

   it('restores a completed rest when its deadline passed while the page was discarded', () => {
      useRestTimerStore.getState().start(user.id, 60, 'Supino');
      const saved = localStorage.getItem('bulkio-rest-timer')!;
      vi.setSystemTime(Date.now() + 90000);
      restoreStoredTimer(saved);
      render(<RestTimer />);
      expect(screen.getByText('0:00')).toBeTruthy();
      expect(screen.getByRole('status').textContent).toBe('Descanso concluído!');
      expect(useRestTimerStore.getState().timer!.deadline).toBeNull();
      expect(useRestTimerStore.getState().timer!.remainingSeconds).toBe(0);
   });

   it('preserves an explicitly paused rest across a reload and only counts again after resuming', () => {
      useRestTimerStore.getState().start(user.id, 60, 'Supino');
      const view = render(<RestTimer />);
      act(() => { vi.advanceTimersByTime(10000); });
      fireEvent.click(screen.getByRole('button', { name: 'Pausar' }));
      const saved = localStorage.getItem('bulkio-rest-timer')!;
      view.unmount();
      vi.setSystemTime(Date.now() + 120000);
      restoreStoredTimer(saved);
      render(<RestTimer />);
      expect(screen.getByText('0:50')).toBeTruthy();
      expect(screen.getByText('Pausado')).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: 'Retomar' }));
      act(() => { vi.advanceTimersByTime(5000); });
      expect(screen.getByText('0:45')).toBeTruthy();
   });

   it('does not show another account’s timer and removes it on logout', () => {
      useRestTimerStore.getState().start('another-user', 60, 'Supino');
      render(<RestTimer />);
      expect(screen.queryByRole('dialog')).toBeNull();
      act(() => { useAuthStore.getState().logout(); });
      expect(useRestTimerStore.getState().timer).toBeNull();
      expect(JSON.parse(localStorage.getItem('bulkio-rest-timer')!).state.timer).toBeNull();
   });
});
