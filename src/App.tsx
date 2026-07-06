import { Navigate, Route, Routes } from 'react-router-dom';
import { ReactElement } from 'react';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import DashboardLayout from './pages/DashboardLayout';
import VehicleLookup from './pages/VehicleLookup';
import PortfolioAnalytics from './pages/PortfolioAnalytics';
import BatchProcessing from './pages/BatchProcessing';
import UsageBilling from './pages/UsageBilling';
import APIKeys from './pages/APIKeys';
import APIDocs from './pages/APIDocs';
import VehicleTelemetry from './pages/VehicleTelemetry';
import TM100Telemetry from './pages/TM100Telemetry';

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
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/lookup" element={<VehicleLookup />} />
          <Route path="/portfolio" element={<PortfolioAnalytics />} />
          <Route path="/batch" element={<BatchProcessing />} />
          <Route path="/usage-billing" element={<UsageBilling />} />
          <Route path="/telemetry" element={<VehicleTelemetry />} />
          <Route path="/tm100-telemetry" element={<TM100Telemetry />} />
          <Route path="/api-keys" element={<APIKeys />} />
          <Route path="/api-docs" element={<APIDocs />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}
