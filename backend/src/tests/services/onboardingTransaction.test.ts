import { beforeEach, describe, expect, it, vi } from 'vitest';
const tx = vi.hoisted(() => ({ user: { update: vi.fn(), updateMany: vi.fn(), findUnique: vi.fn() }, bodyWeight: { findFirst: vi.fn(), create: vi.fn() } }));
vi.mock('../../config/database', () => ({ default: { ...tx, $transaction: (callback: (transaction: typeof tx) => unknown) => callback(tx) } }));
import { userRepository } from '../../repositories/userRepository';

const data = { height: 176, weight: 75.5, goal: 'MAINTAIN' as const, targetWeight: null };
let profile: { id: string; height: number | null; initialWeight: number | null; onboardingStatus: string };
let records: { userId: string; weight: number }[];

beforeEach(() => {
   vi.resetAllMocks();
   profile = { id: 'user-1', height: null, initialWeight: null, onboardingStatus: 'PENDING' };
   records = [];
   tx.user.update.mockImplementation(async ({ data: fields }) => { profile = { ...profile, ...fields }; return { ...profile }; });
   tx.user.updateMany.mockImplementation(async ({ where, data: fields }) => {
      if (profile.onboardingStatus !== where.onboardingStatus) return { count: 0 };
      profile = { ...profile, ...fields }; return { count: 1 };
   });
   tx.user.findUnique.mockImplementation(async () => ({ ...profile }));
   tx.bodyWeight.findFirst.mockImplementation(async () => records[0] ?? null);
   tx.bodyWeight.create.mockImplementation(async ({ data: record }) => { records.push(record); return record; });
});

describe('onboarding persistence', () => {
   it('creates one initial measurement and remains idempotent when completion is retried', async () => {
      const first = await userRepository.completeOnboarding('user-1', data);
      await userRepository.completeOnboarding('user-1', data);
      expect(first).toMatchObject({ height: 176, initialWeight: 75.5, onboardingStatus: 'COMPLETED' });
      expect(records).toEqual([{ userId: 'user-1', weight: 75.5 }]);
      expect(tx.bodyWeight.create).toHaveBeenCalledOnce();
      expect(tx.user.update.mock.invocationCallOrder[0]).toBeLessThan(tx.bodyWeight.findFirst.mock.invocationCallOrder[0]);
   });

   it('preserves existing history and a previously configured starting weight', async () => {
      records = [{ userId: 'user-1', weight: 84 }];
      profile.initialWeight = 85;
      const result = await userRepository.completeOnboarding('user-1', { ...data, weight: 80, goal: 'CUT', targetWeight: 72 });
      expect(result).toMatchObject({ initialWeight: 85, height: 176, goal: 'CUT', targetWeight: 72, onboardingStatus: 'COMPLETED' });
      expect(tx.bodyWeight.create).not.toHaveBeenCalled();
      expect(records).toEqual([{ userId: 'user-1', weight: 84 }]);
   });

   it('uses the first existing measurement when the profile has no initial weight', async () => {
      records = [{ userId: 'user-1', weight: 82 }];
      const result = await userRepository.completeOnboarding('user-1', data);
      expect(result.initialWeight).toBe(82);
      expect(tx.bodyWeight.create).not.toHaveBeenCalled();
   });

   it('propagates a failed measurement write so the transaction cannot report success', async () => {
      tx.bodyWeight.create.mockRejectedValue(new Error('Database unavailable'));
      await expect(userRepository.completeOnboarding('user-1', data)).rejects.toThrow('Database unavailable');
   });

   it('defers pending onboarding without downgrading a completed account', async () => {
      expect((await userRepository.skipOnboarding('user-1'))?.onboardingStatus).toBe('SKIPPED');
      await userRepository.completeOnboarding('user-1', data);
      expect((await userRepository.skipOnboarding('user-1'))?.onboardingStatus).toBe('COMPLETED');
   });
});
