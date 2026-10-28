// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { useOnboardingStore } from './onboardingStore';
import { EMPTY_ONBOARDING_DRAFT } from '@/lib/onboarding';

beforeEach(() => { localStorage.clear(); useOnboardingStore.setState({ drafts: {} }); });
describe('onboarding draft', () => {
   it('restores the current step and entered values after rehydration', async () => {
      useOnboardingStore.getState().initialize('user-a', EMPTY_ONBOARDING_DRAFT);
      useOnboardingStore.getState().updateDraft('user-a', { step: 3, height: '176', weight: '75,5', goal: 'CUT' });
      const saved = localStorage.getItem('bulkio-onboarding')!;
      useOnboardingStore.setState({ drafts: {} });
      localStorage.setItem('bulkio-onboarding', saved);
      await useOnboardingStore.persist.rehydrate();
      useOnboardingStore.getState().initialize('user-a', EMPTY_ONBOARDING_DRAFT);
      expect(useOnboardingStore.getState().drafts['user-a']).toMatchObject({ step: 3, height: '176', weight: '75,5', goal: 'CUT' });
   });
   it('keeps drafts isolated by account and clears only the completed account', () => {
      useOnboardingStore.getState().updateDraft('user-a', { weight: '75' });
      useOnboardingStore.getState().initialize('user-b', EMPTY_ONBOARDING_DRAFT);
      expect(useOnboardingStore.getState().drafts['user-b'].weight).toBe('');
      useOnboardingStore.getState().clearDraft('user-b');
      expect(useOnboardingStore.getState().drafts['user-a'].weight).toBe('75');
   });
   it('uses existing measurements instead of a stale draft weight and clamps invalid saved steps', () => {
      useOnboardingStore.getState().updateDraft('user-a', { weight: '75', step: 99 });
      useOnboardingStore.getState().initialize('user-a', EMPTY_ONBOARDING_DRAFT, 80.2);
      expect(useOnboardingStore.getState().drafts['user-a']).toMatchObject({ weight: '80.2', step: 4 });
   });
});
