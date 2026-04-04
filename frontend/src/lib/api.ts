import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const api = axios.create({
   baseURL: '/api/v1',
   withCredentials: true,
   headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
   const token = useAuthStore.getState().accessToken;
   if (token) {
      config.headers.Authorization = `Bearer ${token}`;
   }
   return config;
});

api.interceptors.response.use(
   (response) => response,
   async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
         originalRequest._retry = true;

         try {
            const { data } = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
            const newToken = data.data.accessToken;
            useAuthStore.getState().setAccessToken(newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
         } catch {
            useAuthStore.getState().logout();
            window.location.href = '/login';
            return Promise.reject(error);
         }
      }

      return Promise.reject(error);
   },
);

export default api;
