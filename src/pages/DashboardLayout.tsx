import { NavLink, Outlet, useLocation } from 'react-router-dom';
import dbsLogo from '../assets/dbs-logo.png';
import { useAuthStore } from '../store/authStore';

const pageTitles: Record<string, string> = {
  lookup: 'Vehicle Lookup',
  portfolio: 'Portfolio Analytics',
  batch: 'Batch Processing',
  api: 'API Console'
};

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  `nav-item ${isActive ? 'active' : ''}`;

export default function DashboardLayout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const pathKey = location.pathname.split('/').filter(Boolean).at(-1) ?? 'lookup';
  const activePage = pageTitles[pathKey] ?? 'Vehicle Lookup';

  const logout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={dbsLogo} alt="DBS-Bajaj logo" style={{ width: 60, height: 60, objectFit: 'contain' }} />
          <div className="logo-sub">
            <span style={{ display: 'block', whiteSpace: 'nowrap' }}>Driver Behaviour</span>
            <span style={{ display: 'block', whiteSpace: 'nowrap' }}>Score</span>
          </div>
        </div>

        <div className="insurer-badge">
          <div className="label">Logged in as</div>
          <div className="name">{user?.insurer ?? 'Bajaj General Insurance'}</div>
        </div>

        <nav className="nav">
          <div className="nav-section">Underwriting</div>
          <NavLink to="/lookup" className={navItemClass}>
            <svg className="icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            Vehicle Lookup
          </NavLink>
          <NavLink to="/batch" className={navItemClass}>
            <svg className="icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6M9 12h6M9 15h4" /></svg>
            Batch Processing
            {/* <span className="nav-badge">3</span> */}
          </NavLink>

          {/* <div className="nav-section">Analytics</div>
          <NavLink to="/portfolio" className={navItemClass}>
            <svg className="icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
            Portfolio Analytics
          </NavLink> */}

          <div className="nav-section">Developer</div>
          <NavLink to="/api" className={navItemClass}>
            <svg className="icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
            API Console
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="api-status">
            <div className="status-dot"></div>
            DBS-Bajaj API · All systems operational
          </div>
          <button onClick={logout} className="lookup-btn" style={{ width: '100%', marginTop: 8, background: '#fee2e2', border: '1px solid #dc2626', color: '#991b1b' }}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <span className="page-title">{activePage}</span>
          {/* <div className="topbar-right">
            <div className="topbar-stat">Today's queries: <strong>847</strong></div>
            <div className="topbar-stat">Avg response: <strong>124ms</strong></div>
            <div className="topbar-stat" style={{ color: 'var(--green)' }}>API <strong style={{ color: 'var(--green)' }}>99.98%</strong> uptime</div>
          </div> */}
        </header>

        <div className="content">
          <Outlet />
        </div>
      </main>
    </>
  );
}
