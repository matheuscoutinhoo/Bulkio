// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WorkoutLogsPage from './WorkoutLogsPage';
import { workoutLogApi, type WorkoutLog } from '@/services/workoutLogService';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/services/workoutLogService', () => ({ workoutLogApi: { getAll: vi.fn(), update: vi.fn() } }));
vi.mock('@/components/exercises/ExerciseDetailModal', () => ({ ExerciseDetailModal: () => null }));
vi.mock('@/components/exercises/ExerciseProgressionDialog', () => ({ ExerciseProgressionDialog: () => null }));
vi.mock('@/components/workoutLogs/LogWorkoutDialog', () => ({ LogWorkoutDialog: () => null }));

const log: WorkoutLog = {
   id: 'log-1', date: '2026-10-21T12:00:00Z', isComplete: true,
   endTime: '2026-10-21T13:00:00Z', createdAt: '2026-10-21T12:00:00Z', notes: 'Treino completo',
   exercises: [{
      id: 'log-ex-1', exerciseId: 'ex-1', order: 0, notes: 'Pegada aberta',
      exercise: { id: 'ex-1', name: 'Supino', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL' },
      sets: [
         { id: 'set-1', setNumber: 1, reps: 10, weight: 40, notes: 'Aquecimento' },
         { id: 'set-2', setNumber: 2, reps: 8, weight: 50, notes: 'Série principal' },
      ],
   }],
};

async function openEditor() {
   render(<MemoryRouter><WorkoutLogsPage /></MemoryRouter>);
   fireEvent.click(await screen.findByRole('button', { expanded: false }));
   fireEvent.click(screen.getByRole('button', { name: 'Editar série 2 de Supino' }));
}

describe('editing completed workout sets', () => {
   beforeEach(() => {
      vi.resetAllMocks();
      vi.mocked(workoutLogApi.getAll).mockResolvedValue({ data: { data: [structuredClone(log)], pagination: { totalPages: 1 } } } as never);
   });
   afterEach(cleanup);

   it('updates only the selected set, preserves notes and keeps the workout complete', async () => {
      vi.mocked(workoutLogApi.update).mockImplementation(async (_id, data) => ({ data: { data: {
         ...log, exercises: [{ ...log.exercises[0], sets: data.exercises![0].sets.map((set, i) => ({ ...set, id: `updated-${i}` })) }],
      } } }) as never);
      await openEditor();
      fireEvent.change(screen.getByLabelText('Repetições'), { target: { value: '12' } });
      fireEvent.change(screen.getByLabelText('Carga (kg)'), { target: { value: '47,5' } });
      fireEvent.click(screen.getByRole('button', { name: 'Salvar série' }));
      await waitFor(() => expect(screen.queryByRole('form', { name: 'Editar série 2' })).toBeNull());
      expect(workoutLogApi.update).toHaveBeenCalledExactlyOnceWith('log-1', { exercises: [{
         exerciseId: 'ex-1', order: 0, notes: 'Pegada aberta', sets: [
            { setNumber: 1, reps: 10, weight: 40, notes: 'Aquecimento' },
            { setNumber: 2, reps: 12, weight: 47.5, notes: 'Série principal' },
         ],
      }] });
      expect(screen.getByText('Completo')).toBeTruthy();
      expect(screen.getByText('47,5')).toBeTruthy();
      expect(screen.getByRole('button', { expanded: true })).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: 'Editar série 1 de Supino' }));
      expect((screen.getByLabelText('Repetições') as HTMLInputElement).value).toBe('10');
   });

   it('cancels without saving and rejects invalid input', async () => {
      await openEditor();
      fireEvent.change(screen.getByLabelText('Carga (kg)'), { target: { value: '-5' } });
      expect((screen.getByRole('button', { name: 'Salvar série' }) as HTMLButtonElement).disabled).toBe(true);
      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
      expect(workoutLogApi.update).not.toHaveBeenCalled();
      expect(screen.getByText('50')).toBeTruthy();
   });

   it('keeps edited values on failure and allows retrying', async () => {
      vi.mocked(workoutLogApi.update).mockRejectedValueOnce(new Error('Offline'));
      await openEditor();
      fireEvent.change(screen.getByLabelText('Carga (kg)'), { target: { value: '45' } });
      fireEvent.click(screen.getByRole('button', { name: 'Salvar série' }));
      expect(await screen.findByRole('alert')).toBeTruthy();
      expect((screen.getByLabelText('Carga (kg)') as HTMLInputElement).value).toBe('45');
      expect((screen.getByRole('button', { name: 'Salvar série' }) as HTMLButtonElement).disabled).toBe(false);
   });
});
