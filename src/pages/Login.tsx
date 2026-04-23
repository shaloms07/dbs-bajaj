import { ChangeEvent, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bajajLogo from '../assets/bajaj-logo.svg';
import bannerImage from '../assets/motor_clp_banner.webp';
import { useAuthStore } from '../store/authStore';
import { login as loginRequest } from '../services/authService';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

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
      setAuth(
        session.token,
        session.user,
        session.refreshToken,
        session.accessTokenExpiresAt,
        session.refreshTokenExpiresAt
      );
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
            <img src={bajajLogo} alt="Bajaj General Insurance logo" className="login-brand-mark" />
          </div>
          {/* <p className="login-eyebrow">Motor underwriting platform</p> */}
          <h1>Assess vehicle risk with a Bajaj-first workflow.</h1>
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
            <p>Enter your credentials to access the DBS-Bajaj Insurer Dashboard.</p>
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
          </form>

          <div className="login-footer-note">Bajaj General Insurance underwriting console</div>
        </div>
      </section>
    </div>
  );
}
