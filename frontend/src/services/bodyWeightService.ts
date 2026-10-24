import api from '@/lib/api';

export interface BodyWeightRecord {
   id: string;
   weight: number;
   date: string;
   createdAt: string;
}

export const bodyWeightApi = {
   getAll: (params?: { page?: number; limit?: number }) =>
      api.get('/body-weight', { params }),
   getHistory: async (): Promise<BodyWeightRecord[]> => {
      const records: BodyWeightRecord[] = [];
      let page = 1;
      let totalPages = 1;
      do {
         const response = await api.get<{ data: BodyWeightRecord[]; pagination: { totalPages: number } }>('/body-weight', { params: { page, limit: 100 } });
         records.push(...response.data.data);
         totalPages = response.data.pagination.totalPages;
         page++;
      } while (page <= totalPages);
      return [...new Map(records.map(record => [record.id, record])).values()]
         .sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || Date.parse(b.createdAt) - Date.parse(a.createdAt));
   },
   create: (data: { weight: number; date?: string }) =>
      api.post('/body-weight', data),
   delete: (id: string) => api.delete(`/body-weight/${id}`),
};
