import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api, type ApiKey, type UsageSeries } from '../lib/api';

const COLORS = ['#0f6e56', '#c45c26', '#1d4e89', '#8b3a62', '#5a6b2f', '#6b4f9a'];

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [series, setSeries] = useState<UsageSeries[]>([]);
  const [label, setLabel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function refresh() {
    const [keysRes, usageRes] = await Promise.all([
      api.listKeys(),
      api.usageSeries(),
    ]);
    setKeys(keysRes.keys);
    setSeries(usageRes.series);
  }

  useEffect(() => {
    refresh()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    const timeMap = new Map<string, Record<string, number | string>>();

    for (const s of series) {
      for (const point of s.points) {
        const t = new Date(point.recorded_at).toISOString();
        const row = timeMap.get(t) || { time: t };
        row[s.label] = point.total_tokens;
        timeMap.set(t, row);
      }
    }

    return Array.from(timeMap.values()).sort((a, b) =>
      String(a.time).localeCompare(String(b.time))
    );
  }, [series]);

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await api.addKey(label.trim(), apiKey.trim());
      setLabel('');
      setApiKey('');
      setMessage('API key added and validated with OpenAI.');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add key');
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(key: ApiKey) {
    setError('');
    try {
      await api.updateKey(key.id, { is_active: !key.is_active });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  }

  async function removeKey(key: ApiKey) {
    if (!confirm(`Delete key "${key.label}"?`)) return;
    setError('');
    try {
      await api.deleteKey(key.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  async function snapshotNow() {
    setError('');
    setMessage('');
    try {
      const res = await api.snapshotNow();
      setMessage(`Snapshot saved for ${res.snapshots_created} key(s).`);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Snapshot failed');
    }
  }

  if (loading) return <p className="muted">Loading keys…</p>;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>OpenAI API keys</h1>
          <p className="muted">
            Add one or more keys. Token usage from this service is tracked and
            charted per key (snapshots every 2 hours).
          </p>
        </div>
        <button type="button" className="btn ghost" onClick={snapshotNow}>
          Snapshot now
        </button>
      </header>

      <form className="panel add-key-form" onSubmit={onAdd}>
        <h2>Add key</h2>
        <div className="two-col">
          <label>
            Label
            <input
              required
              placeholder="Production key"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </label>
          <label>
            OpenAI API key
            <input
              required
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </label>
        </div>
        <button type="submit" className="btn primary" disabled={busy}>
          {busy ? 'Validating…' : 'Add API key'}
        </button>
      </form>

      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="form-ok">{message}</p> : null}

      <section className="panel">
        <h2>Usage by key (total tokens)</h2>
        {chartData.length === 0 ? (
          <p className="muted">
            No usage points yet. Add a key and send chat requests — or click
            Snapshot now after some traffic.
          </p>
        ) : (
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d7ddd6" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(v) =>
                    new Date(v).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  }
                  minTickGap={40}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(v) => new Date(String(v)).toLocaleString()}
                />
                <Legend />
                {series.map((s, i) => (
                  <Line
                    key={s.api_key_id}
                    type="monotone"
                    dataKey={s.label}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="key-list">
        {keys.length === 0 ? (
          <p className="muted">No keys yet.</p>
        ) : (
          keys.map((key) => (
            <article key={key.id} className="key-row">
              <div>
                <h3>
                  {key.label}{' '}
                  <span className={key.is_active ? 'pill ok' : 'pill off'}>
                    {key.is_active ? 'active' : 'inactive'}
                  </span>
                </h3>
                <p className="muted tiny">{key.key_preview}</p>
                <p className="stats">
                  {key.total_tokens.toLocaleString()} tokens ·{' '}
                  {key.total_requests.toLocaleString()} requests
                  {key.last_used_at
                    ? ` · last used ${new Date(key.last_used_at).toLocaleString()}`
                    : ''}
                </p>
              </div>
              <div className="key-actions">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => toggleActive(key)}
                >
                  {key.is_active ? 'Disable' : 'Enable'}
                </button>
                <button
                  type="button"
                  className="btn danger"
                  onClick={() => removeKey(key)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
