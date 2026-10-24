// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExerciseSearchDropdown } from './ExerciseSearchDropdown';
import { Dialog, DialogTitle } from '@/components/ui/dialog';

const exercises = [
   { id: 'ex-1', name: 'Flexão de braços', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BODYWEIGHT' },
   { id: 'ex-2', name: 'Rosca direta', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'DUMBBELL' },
];

afterEach(cleanup);

describe('exercise catalog picker', () => {
   it('finds accented names and groups without requiring accents', () => {
      const selected = vi.fn();
      render(<ExerciseSearchDropdown exercises={exercises} onSelect={selected} />);
      const input = screen.getByRole('combobox');
      fireEvent.change(input, { target: { value: 'biceps' } });
      expect(screen.getAllByRole('option')).toHaveLength(1);
      expect(screen.getByRole('option').textContent).toContain('Rosca direta');
      fireEvent.change(input, { target: { value: 'flexao' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(selected).toHaveBeenCalledExactlyOnceWith(exercises[0]);
   });

   it('lets the keyboard browse available exercises and select the active result', () => {
      const selected = vi.fn();
      render(<ExerciseSearchDropdown exercises={exercises} onSelect={selected} />);
      const input = screen.getByRole('combobox');
      fireEvent.focus(input);
      expect(screen.getAllByRole('option')).toHaveLength(2);
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(screen.getByRole('option', { selected: true }).textContent).toContain('Rosca direta');
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(selected).toHaveBeenCalledExactlyOnceWith(exercises[1]);
      expect(input.getAttribute('aria-expanded')).toBe('false');
   });

   it('searches equipment and closes with Escape without choosing an exercise', () => {
      const selected = vi.fn();
      render(<ExerciseSearchDropdown exercises={exercises} onSelect={selected} />);
      const input = screen.getByRole('combobox');
      fireEvent.change(input, { target: { value: 'halter' } });
      expect(screen.getByRole('option').textContent).toContain('Rosca direta');
      fireEvent.change(input, { target: { value: 'peso corporal' } });
      expect(screen.getByRole('option').textContent).toContain('Flexão de braços');
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(screen.queryByRole('listbox')).toBeNull();
      expect(selected).not.toHaveBeenCalled();
   });

   it('closes the exercise list before dismissing its parent dialog with Escape', () => {
      const close = vi.fn();
      render(<Dialog open onClose={close}><DialogTitle>Escolher exercício</DialogTitle><ExerciseSearchDropdown exercises={exercises} onSelect={vi.fn()} /></Dialog>);
      const input = screen.getByRole('combobox');
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(screen.queryByRole('listbox')).toBeNull();
      expect(close).not.toHaveBeenCalled();
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(close).toHaveBeenCalledOnce();
   });

   it('prevents Enter from submitting the parent form when a search has no results', () => {
      const submit = vi.fn();
      render(<form onSubmit={event => { event.preventDefault(); submit(); }}><ExerciseSearchDropdown exercises={exercises} onSelect={vi.fn()} /></form>);
      const input = screen.getByRole('combobox');
      fireEvent.change(input, { target: { value: 'exercício inexistente' } });
      expect(fireEvent.keyDown(input, { key: 'Enter', cancelable: true })).toBe(false);
      expect(screen.queryByRole('option')).toBeNull();
      expect(submit).not.toHaveBeenCalled();
   });
});
