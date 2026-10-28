import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EMPTY_ONBOARDING_DRAFT, type OnboardingDraft } from '@/lib/onboarding';

interface OnboardingState {
   drafts: Record<string, OnboardingDraft>;
   initialize: (userId: string, defaults: OnboardingDraft, recordedWeight?: number) => void;
   updateDraft: (userId: string, patch: Partial<OnboardingDraft>) => void;
   clearDraft: (userId: string) => void;
}

export const useOnboardingStore = create<OnboardingState>()(persist((set) => ({
   drafts: {},
   initialize: (userId, defaults, recordedWeight) => set(state => {
      const saved = state.drafts[userId];
      const draft = { ...defaults };
      for (const field of ['height', 'weight', 'goal', 'targetWeight'] as const) {
         if (typeof saved?.[field] === 'string') Object.assign(draft, { [field]: saved[field] });
      }
      draft.step = Number.isFinite(saved?.step) ? Math.max(0, Math.min(4, Math.trunc(saved.step))) : 0;
      if (recordedWeight != null) draft.weight = String(recordedWeight);
      return { drafts: { ...state.drafts, [userId]: draft } };
   }),
   updateDraft: (userId, patch) => set(state => ({ drafts: { ...state.drafts, [userId]: { ...(state.drafts[userId] ?? EMPTY_ONBOARDING_DRAFT), ...patch } } })),
   clearDraft: userId => set(state => {
      const drafts = { ...state.drafts };
      delete drafts[userId];
      return { drafts };
   }),
}), { name: 'bulkio-onboarding', partialize: state => ({ drafts: state.drafts }) }));
