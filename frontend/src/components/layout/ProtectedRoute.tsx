import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function ProtectedRoute() {
   const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
   const pending = useAuthStore((state) => state.user?.onboardingStatus === 'PENDING');
   const location = useLocation();
   if (!isAuthenticated) return <Navigate to="/login" replace />;
   if (pending && location.pathname !== '/onboarding') return <Navigate to="/onboarding" replace />;
   return <Outlet />;
}

export function PublicRoute() {
   const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
   const pending = useAuthStore((state) => state.user?.onboardingStatus === 'PENDING');
   if (isAuthenticated) return <Navigate to={pending ? '/onboarding' : '/dashboard'} replace />;
   return <Outlet />;
}
