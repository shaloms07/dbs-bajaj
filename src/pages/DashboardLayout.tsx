import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useBranding } from '../branding/useBranding';
import { useAuthStore } from '../store/authStore';
import { logout as apiLogout } from '../services/authService';

const pageTitles: Record<string, string> = {
  lookup: 'Vehicle Lookup',
  portfolio: 'Portfolio Analytics',
  batch: 'Batch Processing',
  'usage-billing': 'Usage & Consumption',
  'api-keys': 'API Credentials',
  'api-docs': 'API Reference',
  telemetry: 'Vehicle Telemetry',
  'other-sources': 'Other Sources'
};

const navItemClass = ({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`;

export default function DashboardLayout() {
  const user = useAuthStore((state) => state.user);
  const branding = useBranding();
  const location = useLocation();
  const pathKey = location.pathname.split('/').filter(Boolean).at(-1) ?? 'lookup';
  const activePage = pageTitles[pathKey] ?? 'Vehicle Lookup';
  const accountLabel = user?.username ?? user?.email ?? user?.name ?? 'Unknown user';

  useEffect(() => {
    document.title = `${branding.appName} | ${activePage}`;
  }, [activePage, branding.appName]);

  const logout = async () => {
    await apiLogout();
    window.location.href = '/login';
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={branding.logoSrc} alt={branding.logoAlt} style={{ width: '80%', objectFit: 'contain' }} />
        </div>

        <div className="insurer-badge">
          <div className="label">Client</div>
          <div className="name">{branding.companyName}</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, marginTop: 3 }}>{accountLabel}</div>
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
              <path d="M3 10h18M16 13h2" />
            </svg>
            Usage & Billing
          </NavLink>

          <div className="nav-section">Telemetry</div>
          <NavLink to="/telemetry" className={navItemClass}>
            <svg className="icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 12h3l2-5 4 10 2-5h7" />
            </svg>
            Vehicle Telemetry
          </NavLink>
          <NavLink to="/other-sources" className={navItemClass}>
            <svg className="icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
            </svg>
            Other Sources
          </NavLink>

          <div className="nav-section">Developer</div>
          <NavLink to="/api-keys" className={navItemClass}>
            <svg className="icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25z" />
            </svg>
            API Keys
          </NavLink>
          <NavLink to="/api-docs" className={navItemClass}>
            <svg className="icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
            API Reference
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="api-status">
            <div className="status-dot"></div>
            {branding.apiName} · Operational
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
