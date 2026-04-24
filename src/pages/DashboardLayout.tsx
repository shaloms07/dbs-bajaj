import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import bajajLogo from '../assets/bajaj-logo.svg';
import { useAuthStore } from '../store/authStore';
import { ensureValidAccessToken } from '../services/authService';

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
  const token = useAuthStore((s) => s.token);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const location = useLocation();
  const pathKey = location.pathname.split('/').filter(Boolean).at(-1) ?? 'lookup';
  const activePage = pageTitles[pathKey] ?? 'Vehicle Lookup';

  useEffect(() => {
    if (!token || !refreshToken) {
      return;
    }

    let cancelled = false;

    const checkSession = async (reason: string) => {
      try {
        await ensureValidAccessToken();
      } catch (error) {
        if (!cancelled) {
          console.warn(`[auth] Background session check failed during ${reason}`, error);
        }
      }
    };

    void checkSession('layout-mount');

    const intervalId = window.setInterval(() => {
      void checkSession('interval');
    }, 60 * 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void checkSession('tab-visible');
      }
    };

    const handleWindowFocus = () => {
      void checkSession('window-focus');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [token, refreshToken]);

  const logout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={bajajLogo} alt="Bajaj General Insurance logo" style={{ width: 84, height: 40, objectFit: 'contain' }} />
          <div className="logo-sub">
            {/* <span style={{ display: 'block', whiteSpace: 'nowrap' }}>Vehicle risk</span> */}
            {/* <span style={{ display: 'block', whiteSpace: 'nowrap' }}>underwriting</span> */}
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
            Bajaj API · All systems operational
          </div>
          <button onClick={logout} className="lookup-btn lookup-btn--danger" style={{ width: '100%', marginTop: 8 }}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <span className="page-title">{activePage}</span>
        </header>

        <div className="content">
          <Outlet />
        </div>
      </main>
    </>
  );
}
