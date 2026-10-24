import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@/lib/api';
import { exerciseApi } from './exerciseService';

vi.mock('@/lib/api', () => ({ default: { get: vi.fn() } }));

describe('available exercise catalog', () => {
   beforeEach(() => vi.resetAllMocks());

   it('includes exercises beyond the first API page', async () => {
      const firstPage = Array.from({ length: 300 }, (_, index) => ({ id: `ex-${index}`, name: `Exercício ${index}` }));
      const last = { id: 'ex-300', name: 'Último exercício disponível' };
      vi.mocked(api.get).mockResolvedValueOnce({ data: { data: firstPage, pagination: { totalPages: 2 } } })
         .mockResolvedValueOnce({ data: { data: [last], pagination: { totalPages: 2 } } });
      const catalog = await exerciseApi.getCatalog();
      expect(catalog).toHaveLength(301);
      expect(catalog.at(-1)).toEqual(last);
      expect(api.get).toHaveBeenLastCalledWith('/exercises', { params: { page: 2, limit: 300 } });
   });

   it('reports a failed page instead of showing an incomplete catalog', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [], pagination: { totalPages: 2 } } }).mockRejectedValueOnce(new Error('Offline'));
      await expect(exerciseApi.getCatalog()).rejects.toThrow('Offline');
   });
});
