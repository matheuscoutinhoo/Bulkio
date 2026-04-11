import { describe, it, expect } from 'vitest';
import { buildPrompt } from '../../utils/promptBuilder';

const mockExercises = [
   { id: 'ex-1', name: 'Supino Reto', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL' },
   { id: 'ex-2', name: 'Puxada Frontal', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'CABLE' },
];

describe('buildPrompt', () => {
   it('should include all exercises in the prompt', () => {
      const prompt = buildPrompt(mockExercises, { goal: null, initialWeight: null, targetWeight: null, height: null }, {
         level: 'INTERMEDIATE',
      });

      expect(prompt).toContain('ex-1');
      expect(prompt).toContain('ex-2');
      expect(prompt).toContain('Supino Reto');
      expect(prompt).toContain('Puxada Frontal');
   });

   it('should include user goal in prompt', () => {
      const prompt = buildPrompt(mockExercises, { goal: 'BULK', initialWeight: 80, targetWeight: 85, height: 180 }, {
         level: 'ADVANCED',
      });

      expect(prompt).toContain('Ganho de Massa');
      expect(prompt).toContain('180cm');
      expect(prompt).toContain('80kg');
      expect(prompt).toContain('85kg');
      expect(prompt).toContain('Avançado');
   });

   it('should include focus when provided', () => {
      const prompt = buildPrompt(mockExercises, { goal: null, initialWeight: null, targetWeight: null, height: null }, {
         level: 'BEGINNER',
         focus: 'Peito e costas',
      });

      expect(prompt).toContain('Peito e costas');
      expect(prompt).toContain('Iniciante');
   });

   it('should set correct sets range per level', () => {
      const beginnerPrompt = buildPrompt(mockExercises, { goal: null, initialWeight: null, targetWeight: null, height: null }, {
         level: 'BEGINNER',
      });
      const advancedPrompt = buildPrompt(mockExercises, { goal: null, initialWeight: null, targetWeight: null, height: null }, {
         level: 'ADVANCED',
      });

      expect(beginnerPrompt).toContain('2-3');
      expect(advancedPrompt).toContain('4-5');
   });

   it('should request JSON format', () => {
      const prompt = buildPrompt(mockExercises, { goal: null, initialWeight: null, targetWeight: null, height: null }, {
         level: 'INTERMEDIATE',
      });

      expect(prompt).toContain('JSON');
      expect(prompt).toContain('"exerciseId"');
   });

   it('should include description when provided', () => {
      const prompt = buildPrompt(mockExercises, { goal: null, initialWeight: null, targetWeight: null, height: null }, {
         level: 'INTERMEDIATE',
         description: 'Prefiro exercícios com halteres',
      });

      expect(prompt).toContain('Prefiro exercícios com halteres');
      expect(prompt).toContain('UMA ficha de treino');
   });
});
