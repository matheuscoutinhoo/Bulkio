import { describe, it, expect } from 'vitest';
import { buildPrompt } from '../../utils/promptBuilder';

const mockExercises = [
   { index: 0, name: 'Supino Reto', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL' },
   { index: 1, name: 'Puxada Frontal', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'CABLE' },
];

describe('buildPrompt', () => {
   it('should include indexed exercises in the prompt', () => {
      const prompt = buildPrompt(mockExercises, { goal: null, initialWeight: null, targetWeight: null, height: null }, {
         level: 'INTERMEDIATE',
         focus: 'Peito',
      });

      expect(prompt).toContain('0|Supino Reto');
      expect(prompt).toContain('1|Puxada Frontal');
   });

   it('should include user goal in prompt', () => {
      const prompt = buildPrompt(mockExercises, { goal: 'BULK', initialWeight: 80, targetWeight: 85, height: 180 }, {
         level: 'ADVANCED',
         focus: 'Costas',
      });

      expect(prompt).toContain('O:M');
      expect(prompt).toContain('A:180');
      expect(prompt).toContain('P:80');
      expect(prompt).toContain('Al:85');
      expect(prompt).toContain('N:Av');
   });

   it('should include focus when provided', () => {
      const prompt = buildPrompt(mockExercises, { goal: null, initialWeight: null, targetWeight: null, height: null }, {
         level: 'BEGINNER',
         focus: 'Peito e costas',
      });

      expect(prompt).toContain('Peito e costas');
      expect(prompt).toContain('N:Ini');
   });

   it('should set correct sets range per level', () => {
      const beginnerPrompt = buildPrompt(mockExercises, { goal: null, initialWeight: null, targetWeight: null, height: null }, {
         level: 'BEGINNER', focus: 'Pernas',
      });
      const advancedPrompt = buildPrompt(mockExercises, { goal: null, initialWeight: null, targetWeight: null, height: null }, {
         level: 'ADVANCED', focus: 'Peito',
      });

      expect(beginnerPrompt).toContain('2-3');
      expect(advancedPrompt).toContain('4-5');
   });

   it('should use compact JSON format with index-based keys', () => {
      const prompt = buildPrompt(mockExercises, { goal: null, initialWeight: null, targetWeight: null, height: null }, {
         level: 'INTERMEDIATE', focus: 'Peito',
      });

      expect(prompt).toContain('"i"');
      expect(prompt).toContain('"s"');
      expect(prompt).toContain('"r"');
      expect(prompt).toContain('"d"');
   });

   it('should include description when provided', () => {
      const prompt = buildPrompt(mockExercises, { goal: null, initialWeight: null, targetWeight: null, height: null }, {
         level: 'INTERMEDIATE',
         focus: 'Peito',
         description: 'Prefiro exercícios com halteres',
      });

      expect(prompt).toContain('Prefiro exercícios com halteres');
   });

   it('should use abbreviated muscle group, type and equipment', () => {
      const prompt = buildPrompt(mockExercises, { goal: null, initialWeight: null, targetWeight: null, height: null }, {
         level: 'INTERMEDIATE', focus: 'Peito',
      });

      expect(prompt).toContain('|Pe|C|B');
      expect(prompt).toContain('|Co|C|Ca');
   });
});
