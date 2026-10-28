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
   height?: number | null;
}

export interface OnboardingData {
   height: number;
   weight: number;
   goal: 'BULK' | 'CUT' | 'MAINTAIN';
   targetWeight: number | null;
}

export const authApi = {
   login: (data: LoginData) => api.post('/auth/login', data),
   register: (data: RegisterData) => api.post('/auth/register', data),
   logout: () => api.post('/auth/logout'),
   getProfile: () => api.get('/auth/profile'),
   updateProfile: (data: UpdateProfileData) => api.patch('/auth/profile', data),
   completeOnboarding: (data: OnboardingData) => api.post('/auth/onboarding', data),
   skipOnboarding: () => api.post('/auth/onboarding/skip'),
   changePassword: (data: { currentPassword: string; newPassword: string }) => api.patch('/auth/password', data),
   deleteAccount: () => api.delete('/auth/account'),
};
