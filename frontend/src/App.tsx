import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute, PublicRoute } from "@/components/layout/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import WorkoutPlansPage from "@/pages/WorkoutPlansPage";
import WorkoutLogsPage from "@/pages/WorkoutLogsPage";
import BodyWeightPage from "@/pages/BodyWeightPage";
import ProfilePage from "@/pages/ProfilePage";
import { Toaster } from "@/components/ui/toaster";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      {/* Hidden SVG gradient definitions — referenced by .icon-gradient */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--grad-from)" />
            <stop offset="50%" stopColor="var(--grad-mid)" />
            <stop offset="100%" stopColor="var(--grad-to)" />
          </linearGradient>
        </defs>
      </svg>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/workouts" element={<WorkoutPlansPage />} />
            <Route path="/logs" element={<WorkoutLogsPage />} />
            <Route path="/body-weight" element={<BodyWeightPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
