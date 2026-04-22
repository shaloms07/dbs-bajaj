import { Navigate, Route, Routes } from 'react-router-dom';
import { ReactElement } from 'react';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import DashboardLayout from './pages/DashboardLayout';
import VehicleLookup from './pages/VehicleLookup';
import PortfolioAnalytics from './pages/PortfolioAnalytics';
import BatchProcessing from './pages/BatchProcessing';
import APIConsole from './pages/APIConsole';

function ProtectedRoute({ children }: { children: ReactElement }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/lookup" replace />} />
          <Route path="lookup" element={<VehicleLookup />} />
          <Route path="portfolio" element={<PortfolioAnalytics />} />
          <Route path="batch" element={<BatchProcessing />} />
          <Route path="api" element={<APIConsole />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}