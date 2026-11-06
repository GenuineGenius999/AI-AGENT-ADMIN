import { useState, type FormEvent } from 'react';
import { api } from '../lib/api';

export default function PlaygroundPage() {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [meta, setMeta] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setReply('');
    setMeta('');
    try {
      const res = await api.chat(message.trim());
      setReply(res.reply);
      setMeta(
        `${res.model} · ${res.usage.total_tokens} tokens (prompt ${res.usage.prompt_tokens} / completion ${res.usage.completion_tokens})`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chat failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Playground</h1>
          <p className="muted">
            Quick test of the same <code>POST /api/v1/chat</code> endpoint your
            other projects will call. Chat history is not stored.
          </p>
        </div>
      </header>

      <form className="panel stack-form" onSubmit={onSend}>
        <label>
          User message
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask the bot something…"
          />
        </label>
        <button type="submit" className="btn primary" disabled={busy}>
          {busy ? 'Thinking…' : 'Send'}
        </button>
      </form>

      {error ? <p className="form-error">{error}</p> : null}

      {reply ? (
        <section className="panel reply-panel">
          <h2>Reply</h2>
          <p className="reply-text">{reply}</p>
          {meta ? <p className="muted tiny">{meta}</p> : null}
        </section>
      ) : null}
    </div>
  );
}
