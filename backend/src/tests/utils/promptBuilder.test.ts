import { describe, it, expect } from 'vitest';
import { buildPrompt } from '../../utils/promptBuilder';

const mockExercises = [
   { index: 0, name: 'Supino Reto', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL' },
   { index: 1, name: 'Puxada Frontal', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'CABLE' },
];

const emptyUser = {
   goal: null as string | null,
   initialWeight: null as number | null,
   targetWeight: null as number | null,
   height: null as number | null,
   currentWeight: null as number | null,
   weeklyFrequency: 0,
   muscleDistribution: {} as Record<string, number>,
   relevantPRs: [] as { name: string; weight: number; reps: number }[],
};

describe('buildPrompt', () => {
   it('should include indexed exercises in the prompt', () => {
      const prompt = buildPrompt(mockExercises, { ...emptyUser }, {
         level: 'INTERMEDIATE',
         focus: 'Peito',
      });

      expect(prompt).toContain('0|Supino Reto');
      expect(prompt).toContain('1|Puxada Frontal');
   });

   it('should include user goal in prompt', () => {
      const prompt = buildPrompt(mockExercises, { ...emptyUser, goal: 'BULK', initialWeight: 80, targetWeight: 85, height: 180 }, {
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
      const prompt = buildPrompt(mockExercises, { ...emptyUser }, {
         level: 'BEGINNER',
         focus: 'Peito e costas',
      });

      expect(prompt).toContain('Peito e costas');
      expect(prompt).toContain('N:Ini');
   });

   it('should set correct sets range per level', () => {
      const beginnerPrompt = buildPrompt(mockExercises, { ...emptyUser }, {
         level: 'BEGINNER', focus: 'Pernas',
      });
      const advancedPrompt = buildPrompt(mockExercises, { ...emptyUser }, {
         level: 'ADVANCED', focus: 'Peito',
      });

      expect(beginnerPrompt).toContain('2-3');
      expect(advancedPrompt).toContain('4-5');
   });

   it('should use compact JSON format with index-based keys', () => {
      const prompt = buildPrompt(mockExercises, { ...emptyUser }, {
         level: 'INTERMEDIATE', focus: 'Peito',
      });

      expect(prompt).toContain('"i"');
      expect(prompt).toContain('"s"');
      expect(prompt).toContain('"r"');
      expect(prompt).toContain('"d"');
   });

   it('should include description when provided', () => {
      const prompt = buildPrompt(mockExercises, { ...emptyUser }, {
         level: 'INTERMEDIATE',
         focus: 'Peito',
         description: 'Prefiro exercícios com halteres',
      });

      expect(prompt).toContain('Prefiro exercícios com halteres');
   });

   it('should use abbreviated muscle group, type and equipment', () => {
      const prompt = buildPrompt(mockExercises, { ...emptyUser }, {
         level: 'INTERMEDIATE', focus: 'Peito',
      });

      expect(prompt).toContain('|Pe|C|B');
      expect(prompt).toContain('|Co|C|Ca');
   });

   it('should include muscle distribution when available', () => {
      const prompt = buildPrompt(mockExercises, {
         ...emptyUser,
         muscleDistribution: { CHEST: 24, BACK: 20, LEGS: 18 },
      }, { level: 'INTERMEDIATE', focus: 'Peito' });

      expect(prompt).toContain('V:Pe24,Co20,Pr18');
      expect(prompt).toContain('Priorizar');
   });

   it('should include relevant PRs when available', () => {
      const prompt = buildPrompt(mockExercises, {
         ...emptyUser,
         relevantPRs: [
            { name: 'Supino Reto', weight: 80, reps: 6 },
            { name: 'Supino Inc H', weight: 32, reps: 8 },
         ],
      }, { level: 'INTERMEDIATE', focus: 'Peito' });

      expect(prompt).toContain('PR:Supino Reto/80x6,Supino Inc H/32x8');
   });

   it('should include current weight and frequency in profile', () => {
      const prompt = buildPrompt(mockExercises, {
         ...emptyUser,
         currentWeight: 82,
         weeklyFrequency: 4,
      }, { level: 'INTERMEDIATE', focus: 'Peito' });

      expect(prompt).toContain('PA:82');
      expect(prompt).toContain('Fr:4');
   });

   it('should not include science line when no context data', () => {
      const prompt = buildPrompt(mockExercises, { ...emptyUser }, {
         level: 'INTERMEDIATE', focus: 'Peito',
      });

      expect(prompt).not.toContain('Priorizar');
      expect(prompt).not.toContain('V:');
      expect(prompt).not.toContain('PR:');
   });
});
