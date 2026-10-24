// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AddSetForm } from './AddSetForm';
import { bodyWeightApi } from '@/services/bodyWeightService';
import { workoutLogApi } from '@/services/workoutLogService';

vi.mock('@/services/bodyWeightService', () => ({ bodyWeightApi: { getAll: vi.fn() } }));
vi.mock('@/services/workoutLogService', () => ({ workoutLogApi: { getExerciseLastSession: vi.fn() } }));

const exercises = [
   { id: 'ex-1', name: 'Flexão de braços', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BODYWEIGHT' },
   { id: 'ex-2', name: 'Rosca direta', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'DUMBBELL' },
];

beforeEach(() => {
   vi.resetAllMocks();
   vi.mocked(bodyWeightApi.getAll).mockResolvedValue({ data: { data: [{ weight: 80.2 }] } } as never);
   vi.mocked(workoutLogApi.getExerciseLastSession).mockResolvedValue({ data: { success: true, data: null } } as never);
});
afterEach(cleanup);

describe('registering workout sets', () => {
   it('uses the recorded body weight for catalog exercises and saves the chosen rest interval', async () => {
      const save = vi.fn().mockResolvedValue(undefined);
      render(<MemoryRouter><AddSetForm planExercises={[]} catalogExercises={exercises} onSave={save} onCancel={vi.fn()} /></MemoryRouter>);
      await screen.findByText('80,2 kg');
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'flexao' } });
      fireEvent.click(screen.getByRole('option', { name: /Flexão/ }));
      expect((screen.getByLabelText('Carga (kg)') as HTMLInputElement).value).toBe('80.2');
      fireEvent.change(screen.getByLabelText('Descanso após a série (segundos)'), { target: { value: '0' } });
      fireEvent.click(screen.getByRole('button', { name: 'Salvar série' }));
      await waitFor(() => expect(save).toHaveBeenCalledExactlyOnceWith('ex-1', 10, 80.2, 0));
   });

   it('keeps the planned reps, weight and rest interval for workouts with a ficha', async () => {
      const save = vi.fn().mockResolvedValue(undefined);
      const planExercises = [{ id: 'pe-1', exerciseId: 'ex-2', exercise: exercises[1], sets: 3, reps: '8–12', weight: 25, restSeconds: 90, order: 0 }];
      render(<MemoryRouter><AddSetForm planExercises={planExercises} onSave={save} onCancel={vi.fn()} /></MemoryRouter>);
      fireEvent.change(screen.getByLabelText('Exercício'), { target: { value: 'ex-2' } });
      fireEvent.click(screen.getByRole('button', { name: 'Salvar série' }));
      await waitFor(() => expect(save).toHaveBeenCalledExactlyOnceWith('ex-2', 8, 25, 90));
   });
});
