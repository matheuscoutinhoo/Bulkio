// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RestTimer } from './RestTimer';

describe('rest timer', () => {
   beforeEach(() => { vi.useFakeTimers(); });
   afterEach(() => { cleanup(); vi.useRealTimers(); });

   it('keeps counting after backdrop clicks, Escape and parent renders; ends only with the finish button', () => {
      const onClose = vi.fn();
      const view = render(<RestTimer initialSeconds={60} exerciseName="Supino" onClose={onClose} />);
      act(() => { vi.advanceTimersByTime(5000); });
      fireEvent.click(screen.getByRole('dialog').previousElementSibling!);
      fireEvent.keyDown(document, { key: 'Escape' });
      view.rerender(<RestTimer initialSeconds={60} exerciseName="Supino" onClose={() => onClose()} />);
      act(() => { vi.advanceTimersByTime(5000); });
      expect(screen.getByText('0:50')).toBeTruthy();
      expect(onClose).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button', { name: 'Finalizar descanso' }));
      expect(onClose).toHaveBeenCalledTimes(1);
   });

   it('catches up after a suspended tab and keeps the completed timer open', () => {
      const onClose = vi.fn();
      render(<RestTimer initialSeconds={60} exerciseName="Supino" onClose={onClose} />);
      vi.setSystemTime(Date.now() + 90000);
      fireEvent(document, new Event('visibilitychange'));
      expect(screen.getByText('0:00')).toBeTruthy();
      expect(screen.getByRole('status').textContent).toBe('Descanso concluído!');
      expect(onClose).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button', { name: 'Reiniciar' }));
      act(() => { vi.advanceTimersByTime(1000); });
      expect(screen.getByText('0:59')).toBeTruthy();
   });

   it('pauses, adjusts and resumes without counting paused time', () => {
      render(<RestTimer initialSeconds={60} exerciseName="Supino" onClose={vi.fn()} />);
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
      render(<RestTimer initialSeconds={5} exerciseName="Supino" onClose={vi.fn()} />);
      act(() => { vi.advanceTimersByTime(5000); });
      fireEvent.click(screen.getByRole('button', { name: 'Aumentar descanso em 15 segundos' }));
      expect(screen.getByText('0:15')).toBeTruthy();
      act(() => { vi.advanceTimersByTime(1000); });
      expect(screen.getByText('0:14')).toBeTruthy();
   });
});
