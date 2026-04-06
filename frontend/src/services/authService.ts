import api from '@/lib/api';

export interface LoginData {
   email: string;
   password: string;
}

export interface RegisterData {
   email: string;
   username: string;
   password: string;
}

export interface UpdateProfileData {
   username?: string;
   goal?: string | null;
   initialWeight?: number | null;
   targetWeight?: number | null;
}

export const authApi = {
   login: (data: LoginData) => api.post('/auth/login', data),
   register: (data: RegisterData) => api.post('/auth/register', data),
   logout: () => api.post('/auth/logout'),
   getProfile: () => api.get('/auth/profile'),
   updateProfile: (data: UpdateProfileData) => api.patch('/auth/profile', data),
   deleteAccount: () => api.delete('/auth/account'),
};
