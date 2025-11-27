import React, { useState } from 'react';
import type { LinkRecord } from '../pages/Dashboard';

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

type Props = {
  onCreated?: (link: LinkRecord) => void;
};

export default function LinkForm({ onCreated }: Props) {
  const [url, setUrl] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(
    null
  );

  function isValidUrl(s: string) {
    try {
      new URL(s);
      return true;
    } catch {
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!isValidUrl(url)) {
      setMsg({ type: 'error', text: 'Invalid URL. Include http/https.' });
      return;
    }

    if (code && !CODE_REGEX.test(code)) {
      setMsg({
        type: 'error',
        text: 'Custom code must be 6–8 alphanumeric characters.',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, code: code || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: 'error', text: data?.error || 'Failed to create link' });
      } else {
        setMsg({ type: 'success', text: `Created ${data.shortCode}` });
        setUrl('');
        setCode('');

        // notify parent so it can update table immediately
        if (onCreated) {
          onCreated(data as LinkRecord);
        }
      }
    } catch {
      setMsg({ type: 'error', text: 'Network error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <div>
        <div className="label">Target URL</div>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/path"
          className="input"
          required
        />
      </div>

      <div>
        <div className="label">Custom Code (optional)</div>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="6–8 letters or numbers"
          className="input-sm"
        />
      </div>

      {msg && (
        <div className={msg.type === 'error' ? 'text-error' : 'text-success'}>
          {msg.text}
        </div>
      )}

      <div>
        <button disabled={loading} type="submit" className="btn btn-primary">
          {loading ? 'Creating...' : 'Create'}
        </button>
      </div>
    </form>
  );
}
