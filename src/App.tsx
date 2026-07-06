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
import LandingPage from './pages/LandingPage';
import TM100Telemetry from './pages/TM100Telemetry';
import OtherSources from './pages/OtherSources';

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
        <Route path="/" element={<LandingPage />} />
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
          <Route path="/telemetry" element={<TM100Telemetry />} />
          <Route path="/other-sources" element={<OtherSources />} />
          <Route path="/api-keys" element={<APIKeys />} />
          <Route path="/api-docs" element={<APIDocs />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}



