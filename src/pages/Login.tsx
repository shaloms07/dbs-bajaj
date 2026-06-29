import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bannerImage from '../assets/magic_edit3.png';
import { useDefaultBranding } from '../branding/useBranding';
import { useAuthStore } from '../store/authStore';
import { login as loginRequest } from '../services/authService';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const branding = useDefaultBranding();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = branding.appName;
  }, [branding.appName]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Enter credentials');
      return;
    }
    setLoading(true);
    try {
      const session = await loginRequest({ username: username.trim(), password });
      setAuth(session.user);
      navigate('/lookup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <section className="login-visual">
        <div className="login-visual-overlay" />
        <div className="login-visual-content">
          <div className="login-brand-chip">
            <img src={branding.logoSrc} alt={branding.logoAlt} className="login-brand-mark" />
          </div>
          {/* <p className="login-eyebrow">Motor underwriting platform</p> */}
          <h1>{branding.loginHeadline}</h1>
          <p className="login-copy">
            Built for quick underwriting lookups, score review, and violation history in a clean, secure interface.
          </p>

          {/* <div className="login-bullets">
            <div>
              <strong>Live score lookup</strong>
              <span>Review the current driver behavior score in seconds.</span>
            </div>
            <div>
              <strong>Risk-aware underwriting</strong>
              <span>Use a clear, branded interface for day-to-day decisioning.</span>
            </div>
            <div>
              <strong>Printable reports</strong>
              <span>Export report-ready PDFs and spreadsheet downloads from the lookup page.</span>
            </div>
          </div> */}

          <div className="login-banner-card">
            <img src={bannerImage} alt="Motor insurance banner" />
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-card-top">
            <p className="login-card-kicker">Secure sign in</p>
            <h2>Welcome back</h2>
            <p>{branding.loginAccessCopy}</p>
          </div>

          <form onSubmit={submit} className="login-form">
            <div>
              <label className="login-label">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                required
                className="login-input"
                placeholder="Username"
              />
            </div>

            <div>
              <label className="login-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                className="login-input"
                placeholder="Password"
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" disabled={loading} className="login-submit">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="login-back-container">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="login-back-link"
              >
                ← Back to Home
              </button>
            </div>
          </form>

          <div className="login-footer-note">{branding.underwritingConsoleLabel}</div>
        </div>
      </section>
    </div>
  );
}
