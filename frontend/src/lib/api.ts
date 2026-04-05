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

// Mutex for token refresh to avoid race conditions
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
   refreshSubscribers.forEach((cb) => cb(token));
   refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
   refreshSubscribers.push(cb);
}

api.interceptors.response.use(
   (response) => response,
   async (error) => {
      const originalRequest = error.config;
      const requestUrl = originalRequest?.url || '';

      // Don't intercept 401s from auth endpoints — let the caller handle them
      const isAuthEndpoint = requestUrl.includes('/auth/login')
         || requestUrl.includes('/auth/register')
         || requestUrl.includes('/auth/refresh');

      if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
         originalRequest._retry = true;

         if (isRefreshing) {
            // Another request is already refreshing — wait for it
            return new Promise((resolve) => {
               addRefreshSubscriber((token: string) => {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                  resolve(api(originalRequest));
               });
            });
         }

         isRefreshing = true;

         try {
            const { data } = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
            const newToken = data.data.accessToken;
            useAuthStore.getState().setAccessToken(newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            onRefreshed(newToken);
            return api(originalRequest);
         } catch {
            refreshSubscribers = [];
            useAuthStore.getState().logout();
            window.location.href = '/login';
            return Promise.reject(error);
         } finally {
            isRefreshing = false;
         }
      }

      return Promise.reject(error);
   },
);

export default api;
