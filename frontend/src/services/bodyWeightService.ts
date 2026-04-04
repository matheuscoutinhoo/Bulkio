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
   create: (data: { weight: number; date?: string }) =>
      api.post('/body-weight', data),
   delete: (id: string) => api.delete(`/body-weight/${id}`),
};
