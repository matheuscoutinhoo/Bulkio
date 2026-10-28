import type { OnboardingData } from '@/services/authService';
import { parseOptionalNonNegativeNumber } from './workoutForm';

export interface OnboardingDraft {
   step: number;
   height: string;
   weight: string;
   goal: '' | OnboardingData['goal'];
   targetWeight: string;
}

export const EMPTY_ONBOARDING_DRAFT: OnboardingDraft = { step: 0, height: '', weight: '', goal: '', targetWeight: '' };
export const ONBOARDING_STEPS = ['Visão geral', 'Treinos', 'Medidas', 'Objetivo', 'Revisão'];
export const ONBOARDING_GOALS = [
   { value: 'BULK', label: 'Ganho de massa', description: 'Acompanhar o aumento do peso corporal.' },
   { value: 'CUT', label: 'Perda de gordura', description: 'Acompanhar a redução do peso corporal.' },
   { value: 'MAINTAIN', label: 'Manutenção', description: 'Acompanhar a estabilidade do peso corporal.' },
] as const;

export function getOnboardingErrors(draft: OnboardingDraft) {
   const errors: Partial<Record<'height' | 'weight' | 'goal' | 'targetWeight', string>> = {};
   const height = parseOptionalNonNegativeNumber(draft.height);
   const weight = parseOptionalNonNegativeNumber(draft.weight);
   const target = parseOptionalNonNegativeNumber(draft.targetWeight);
   if (height == null || height < 50 || height > 300) errors.height = 'Informe sua altura em centímetros, entre 50 e 300. Exemplo: 176.';
   if (weight == null || weight < 20 || weight > 500) errors.weight = 'Informe seu peso em kg, entre 20 e 500. Exemplo: 75,5.';
   if (!ONBOARDING_GOALS.some(goal => goal.value === draft.goal)) errors.goal = 'Selecione um objetivo para continuar.';
   if (draft.targetWeight.trim() && (target == null || target < 20 || target > 500)) errors.targetWeight = 'Informe uma meta entre 20 e 500 kg ou deixe o campo vazio.';
   return errors;
}

export function getOnboardingPayload(draft: OnboardingDraft): OnboardingData | null {
   if (Object.keys(getOnboardingErrors(draft)).length || !draft.goal) return null;
   return { height: parseOptionalNonNegativeNumber(draft.height)!, weight: parseOptionalNonNegativeNumber(draft.weight)!, goal: draft.goal, targetWeight: parseOptionalNonNegativeNumber(draft.targetWeight) };
}
