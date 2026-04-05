import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bodyWeightService } from '../../services/bodyWeightService';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { createMockBodyWeight } from '../helpers';

vi.mock('../../repositories/bodyWeightRepository', () => ({
   bodyWeightRepository: {
      findAllByUser: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      getLatest: vi.fn(),
   },
}));

import { bodyWeightRepository } from '../../repositories/bodyWeightRepository';

const mockRepo = vi.mocked(bodyWeightRepository);

describe('bodyWeightService', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   // ========== findAll ==========
   describe('findAll', () => {
      it('should return paginated body weight records', async () => {
         const records = [createMockBodyWeight()];
         mockRepo.findAllByUser.mockResolvedValue([records, 1] as any);

         const result = await bodyWeightService.findAll('user-1', 1, 50);

         expect(result.records).toEqual(records);
         expect(result.total).toBe(1);
         expect(result.page).toBe(1);
         expect(result.totalPages).toBe(1);
      });

      it('should calculate totalPages correctly', async () => {
         mockRepo.findAllByUser.mockResolvedValue([[], 120] as any);

         const result = await bodyWeightService.findAll('user-1', 1, 50);

         expect(result.totalPages).toBe(3); // ceil(120/50)
      });
   });

   // ========== create ==========
   describe('create', () => {
      it('should create a body weight record', async () => {
         const record = createMockBodyWeight({ weight: 82.5 });
         mockRepo.create.mockResolvedValue(record as any);

         const result = await bodyWeightService.create('user-1', { weight: 82.5 });

         expect(mockRepo.create).toHaveBeenCalledWith('user-1', { weight: 82.5 });
         expect(result.weight).toBe(82.5);
      });
   });

   // ========== delete ==========
   describe('delete', () => {
      it('should delete record when it exists and belongs to user', async () => {
         mockRepo.findById.mockResolvedValue(createMockBodyWeight() as any);
         mockRepo.delete.mockResolvedValue(undefined as any);

         await expect(bodyWeightService.delete('user-1', 'bw-1')).resolves.not.toThrow();
      });

      it('should throw NotFoundError when record does not exist', async () => {
         mockRepo.findById.mockResolvedValue(null);

         await expect(bodyWeightService.delete('user-1', 'missing')).rejects.toThrow('Body weight record not found');
      });

      it('should throw ForbiddenError when record belongs to another user', async () => {
         mockRepo.findById.mockResolvedValue(
            createMockBodyWeight({ userId: 'other-user' }) as any,
         );

         await expect(bodyWeightService.delete('user-1', 'bw-1')).rejects.toThrow('Forbidden');
      });
   });

   // ========== getLatest ==========
   describe('getLatest', () => {
      it('should return the most recent body weight record', async () => {
         const record = createMockBodyWeight({ weight: 85 });
         mockRepo.getLatest.mockResolvedValue(record as any);

         const result = await bodyWeightService.getLatest('user-1');

         expect(result?.weight).toBe(85);
      });

      it('should return null when no records exist', async () => {
         mockRepo.getLatest.mockResolvedValue(null);

         const result = await bodyWeightService.getLatest('user-1');

         expect(result).toBeNull();
      });
   });
});
