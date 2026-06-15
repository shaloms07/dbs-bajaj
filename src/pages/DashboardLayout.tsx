import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useBranding } from '../branding/useBranding';
import { ensureValidAccessToken } from '../services/authService';
import { useAuthStore } from '../store/authStore';

const pageTitles: Record<string, string> = {
  lookup: 'Vehicle Lookup',
  portfolio: 'Portfolio Analytics',
  batch: 'Batch Processing',
  'usage-billing': 'Usage & Consumption',
  api: 'API Console'
};

const navItemClass = ({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`;

export default function DashboardLayout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const branding = useBranding();
  const location = useLocation();
  const pathKey = location.pathname.split('/').filter(Boolean).at(-1) ?? 'lookup';
  const activePage = pageTitles[pathKey] ?? 'Vehicle Lookup';
  const accountLabel = user?.username ?? user?.email ?? user?.name ?? 'Unknown user';

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
  }, [refreshToken, token]);

  useEffect(() => {
    document.title = `${branding.appName} | ${activePage}`;
  }, [activePage, branding.appName]);

  const logout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={branding.logoSrc} alt={branding.logoAlt} style={{ width: '70%', objectFit: 'contain' }} />
          <div className="logo-sub" />
        </div>

        <div className="insurer-badge">
          <div className="label">Client</div>
          <div className="name">{branding.companyName}</div>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 11, marginTop: 4 }}>{accountLabel}</div>
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
          </NavLink>
          <NavLink to="/usage-billing" className={navItemClass}>
            <svg className="icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <path d="M3 10h18" />
              <path d="M16 13h2" />
            </svg>
            Usage & Consumption
          </NavLink>

          <div className="nav-section">Developer</div>
          <NavLink to="/api" className={navItemClass}>
            <svg className="icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
            API Console
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="api-status">
            <div className="status-dot"></div>
            {branding.apiName} · All systems operational
          </div>
          <button onClick={logout} className="lookup-btn lookup-btn--danger" style={{ width: '100%', marginTop: 8 }}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-brand">
            <img src={branding.logoSrc} alt={branding.logoAlt} className="topbar-brand-logo" />
            <div className="topbar-brand-copy">
              <span>{branding.companyName}</span>
              <strong>{branding.appName}</strong>
            </div>
          </div>
          <span className="page-title">{activePage}</span>
        </header>

        <div className="content">
          <Outlet />
        </div>
      </main>
    </>
  );
}
