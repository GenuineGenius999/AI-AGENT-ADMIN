import { useEffect, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
).replace(/\/$/, '');

export default function LoginPage() {
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState('admin@botservice.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [bootstrapNote, setBootstrapNote] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setBootstrapping(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/api/setup/bootstrap`, {
          method: 'POST',
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            body.error ||
              body.hint ||
              `Could not prepare admin account (${res.status})`
          );
        }
        if (!cancelled) {
          setBootstrapNote(
            body.created
              ? 'Admin account created in the database. Sign in below.'
              : 'Admin account ready. Sign in below.'
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? `${err.message} — Is VITE_API_BASE_URL pointing at your backend?`
              : 'Bootstrap failed'
          );
        }
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  if (user) return <Navigate to="/keys" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      // Ensure admin exists even if page bootstrap failed earlier
      await fetch(`${API_BASE}/api/setup/bootstrap`, { method: 'POST' }).catch(
        () => undefined
      );
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-atmosphere" aria-hidden />
      <form className="login-panel" onSubmit={onSubmit}>
        <p className="brand-mark">Bot Service</p>
        <h1>Sign in to manage your bot</h1>
        <p className="muted">
          Configure identity, OpenAI keys, and usage — then call the chat API
          from your other projects.
        </p>

        {bootstrapping ? (
          <p className="muted">Preparing admin account in database…</p>
        ) : null}
        {bootstrapNote && !error ? (
          <p className="form-ok">{bootstrapNote}</p>
        ) : null}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button
          type="submit"
          className="btn primary"
          disabled={busy || bootstrapping}
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
