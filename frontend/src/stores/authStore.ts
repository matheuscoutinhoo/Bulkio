import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
   id: string;
   email: string;
   username: string;
   goal?: string | null;
   initialWeight?: number | null;
   targetWeight?: number | null;
}

interface AuthState {
   user: User | null;
   accessToken: string | null;
   isAuthenticated: boolean;
   setAuth: (user: User, accessToken: string) => void;
   setAccessToken: (token: string) => void;
   setUser: (user: User) => void;
   logout: () => void;
}

export const useAuthStore = create<AuthState>()(
   persist(
      (set) => ({
         user: null,
         accessToken: null,
         isAuthenticated: false,
         setAuth: (user, accessToken) =>
            set({ user, accessToken, isAuthenticated: true }),
         setAccessToken: (accessToken) => set({ accessToken }),
         setUser: (user) => set({ user }),
         logout: () =>
            set({ user: null, accessToken: null, isAuthenticated: false }),
      }),
      {
         name: 'bulkio-auth',
         partialize: (state) => ({
            user: state.user,
            isAuthenticated: state.isAuthenticated,
         }),
      },
   ),
);
