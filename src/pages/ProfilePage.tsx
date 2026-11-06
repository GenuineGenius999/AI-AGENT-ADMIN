import { useEffect, useState, type FormEvent } from 'react';
import { api, type Profile } from '../lib/api';

const empty = {
  first_name: '',
  last_name: '',
  birthday: '',
  personality: '',
  life_story: '',
  system_prompt: '',
};

export default function ProfilePage() {
  const [form, setForm] = useState(empty);
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getProfile()
      .then(({ profile }) => applyProfile(profile))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function applyProfile(profile: Profile) {
    setForm({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      birthday: profile.birthday || '',
      personality: profile.personality || '',
      life_story: profile.life_story || '',
      system_prompt: profile.system_prompt || '',
    });
    setSecret(profile.integration_secret || '');
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const { profile } = await api.updateProfile(form);
      applyProfile(profile);
      setMessage('Bot profile saved. Chat replies will use this identity.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function rotateSecret() {
    setError('');
    setMessage('');
    try {
      const { integration_secret } = await api.rotateSecret();
      setSecret(integration_secret);
      setMessage('Integration secret rotated. Update your other projects.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rotate failed');
    }
  }

  if (loading) return <p className="muted">Loading profile…</p>;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Bot profile</h1>
          <p className="muted">
            This is the bot identity. Replies are generated from these fields
            plus your system prompt.
          </p>
        </div>
      </header>

      <form className="stack-form" onSubmit={onSave}>
        <div className="two-col">
          <label>
            First name *
            <input
              required
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />
          </label>
          <label>
            Last name *
            <input
              required
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
          </label>
        </div>

        <label>
          Birthday *
          <input
            required
            type="date"
            value={form.birthday}
            onChange={(e) => setForm({ ...form, birthday: e.target.value })}
          />
        </label>

        <label>
          Personality *
          <textarea
            required
            rows={3}
            placeholder="Warm, witty, concise, curious about space…"
            value={form.personality}
            onChange={(e) => setForm({ ...form, personality: e.target.value })}
          />
        </label>

        <label>
          Life story *
          <textarea
            required
            rows={5}
            placeholder="Background, experiences, how this bot sees the world…"
            value={form.life_story}
            onChange={(e) => setForm({ ...form, life_story: e.target.value })}
          />
        </label>

        <label>
          System prompt *
          <textarea
            required
            rows={6}
            placeholder="Core instructions the model must always follow…"
            value={form.system_prompt}
            onChange={(e) =>
              setForm({ ...form, system_prompt: e.target.value })
            }
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}
        {message ? <p className="form-ok">{message}</p> : null}

        <button type="submit" className="btn primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save bot profile'}
        </button>
      </form>

      <section className="panel secret-panel">
        <h2>Integration secret</h2>
        <p className="muted">
          Use this header from another project instead of a user login session:
          <code>X-Integration-Secret</code>
        </p>
        <div className="secret-row">
          <code className="secret-value">{secret || '—'}</code>
          <button
            type="button"
            className="btn ghost"
            onClick={() => navigator.clipboard.writeText(secret)}
            disabled={!secret}
          >
            Copy
          </button>
          <button type="button" className="btn ghost" onClick={rotateSecret}>
            Rotate
          </button>
        </div>
      </section>
    </div>
  );
}
