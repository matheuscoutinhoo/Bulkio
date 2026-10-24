import { beforeEach, describe, expect, it, vi } from 'vitest';
const transaction = vi.hoisted(() => ({
   user: { updateMany: vi.fn() }, refreshToken: { deleteMany: vi.fn() },
}));
vi.mock('../../config/database', () => ({ default: { $transaction: (callback: (tx: typeof transaction) => unknown) => callback(transaction) } }));
import { userRepository } from '../../repositories/userRepository';

describe('password transaction', () => {
   beforeEach(() => { vi.clearAllMocks(); });
   it('atomically replaces the expected password hash and revokes refresh tokens', async () => {
      transaction.user.updateMany.mockResolvedValue({ count: 1 });
      await expect(userRepository.changePassword('user-1', 'old-hash', 'new-hash')).resolves.toBe(true);
      expect(transaction.user.updateMany).toHaveBeenCalledWith({ where: { id: 'user-1', password: 'old-hash' }, data: { password: 'new-hash' } });
      expect(transaction.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
   });
   it('does not revoke a newer session when the expected hash no longer matches', async () => {
      transaction.user.updateMany.mockResolvedValue({ count: 0 });
      await expect(userRepository.changePassword('user-1', 'old-hash', 'new-hash')).resolves.toBe(false);
      expect(transaction.refreshToken.deleteMany).not.toHaveBeenCalled();
   });
});
