import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

export function getApiErrorMessage(error: unknown, fallback: string) {
   if (axios.isAxiosError(error) && typeof error.response?.data?.message === 'string') {
      return error.response.data.message;
   }
   return fallback;
}

const api = axios.create({
   baseURL: '/api/v1',
   withCredentials: true,
   headers: { 'Content-Type': 'application/json' },
});

let refreshPromise: Promise<string> | null = null;

function isPublicAuthRequest(url = '') {
   return ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'].includes(url.split('?')[0]);
}

function refreshAccessToken(): Promise<string> {
   if (!refreshPromise) {
      refreshPromise = axios.post('/api/v1/auth/refresh', {}, { withCredentials: true })
         .then(({ data }) => {
            if (!useAuthStore.getState().isAuthenticated) throw new axios.CanceledError('Session ended');
            const token: string = data.data.accessToken;
            useAuthStore.getState().setAccessToken(token);
            return token;
         })
         .catch((error: unknown) => {
            if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
               useAuthStore.getState().logout();
            }
            throw error;
         })
         .finally(() => { refreshPromise = null; });
   }
   return refreshPromise;
}

api.interceptors.request.use(async (config) => {
   const auth = useAuthStore.getState();
   let token = auth.accessToken;
   if (auth.isAuthenticated && !token && !isPublicAuthRequest(config.url)) {
      token = await refreshAccessToken();
   }
   if (token) {
      config.headers.Authorization = `Bearer ${token}`;
   }
   return config;
});

api.interceptors.response.use(
   (response) => response,
   async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry
         && !isPublicAuthRequest(originalRequest.url) && useAuthStore.getState().isAuthenticated) {
         originalRequest._retry = true;

         try {
            const currentToken = useAuthStore.getState().accessToken;
            const token = currentToken && originalRequest.headers.Authorization !== `Bearer ${currentToken}`
               ? currentToken
               : await refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
         } catch (refreshError) {
            return Promise.reject(refreshError);
         }
      }

      return Promise.reject(error);
   },
);

export default api;
