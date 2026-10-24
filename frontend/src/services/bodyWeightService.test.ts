import { describe, expect, it, vi } from 'vitest';
import api from '@/lib/api';
import { bodyWeightApi } from './bodyWeightService';

vi.mock('@/lib/api', () => ({ default: { get: vi.fn() } }));

describe('complete weight history', () => {
   it('fetches every page and orders backdated measurements by measurement date', async () => {
      const first = Array.from({ length: 100 }, (_, i) => ({ id: String(i), weight: 80, date: '2026-10-24', createdAt: '2026-10-24' }));
      const oldest = { id: 'old', weight: 90, date: '2020-01-01', createdAt: '2026-10-24' };
      vi.mocked(api.get).mockResolvedValueOnce({ data: { data: first, pagination: { totalPages: 2 } } })
         .mockResolvedValueOnce({ data: { data: [oldest], pagination: { totalPages: 2 } } });
      const records = await bodyWeightApi.getHistory();
      expect(records).toHaveLength(101);
      expect(records.at(-1)).toEqual(oldest);
      expect(api.get).toHaveBeenLastCalledWith('/body-weight', { params: { page: 2, limit: 100 } });
   });
   it('propagates a failed history page so the UI cannot present a partial baseline', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [], pagination: { totalPages: 2 } } }).mockRejectedValueOnce(new Error('offline'));
      await expect(bodyWeightApi.getHistory()).rejects.toThrow('offline');
   });
});
