import { describe, expect, it } from 'vitest';
import { EMPTY_ONBOARDING_DRAFT, getOnboardingErrors, getOnboardingPayload } from './onboarding';

describe('initial setup validation', () => {
   it('accepts decimal commas and an optional weight target', () => {
      const draft = { ...EMPTY_ONBOARDING_DRAFT, height: '176,5', weight: '75,5', goal: 'MAINTAIN' as const };
      expect(getOnboardingPayload(draft)).toEqual({ height: 176.5, weight: 75.5, goal: 'MAINTAIN', targetWeight: null });
      expect(getOnboardingPayload({ ...draft, goal: 'CUT', targetWeight: '72,5' })?.targetWeight).toBe(72.5);
   });
   it('requires height, weight and an explicit goal', () => {
      expect(Object.keys(getOnboardingErrors(EMPTY_ONBOARDING_DRAFT))).toEqual(['height', 'weight', 'goal']);
      expect(getOnboardingPayload(EMPTY_ONBOARDING_DRAFT)).toBeNull();
   });
   it('rejects metres, invalid numbers and out-of-range measurements', () => {
      expect(getOnboardingErrors({ step: 2, height: '1,76', weight: '-10', goal: 'CUT', targetWeight: '501' })).toHaveProperty('height');
      expect(getOnboardingPayload({ step: 4, height: 'NaN', weight: '80', goal: 'CUT', targetWeight: '' })).toBeNull();
      expect(getOnboardingPayload({ step: 4, height: '176', weight: 'Infinity', goal: 'CUT', targetWeight: '' })).toBeNull();
   });
});
