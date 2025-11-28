import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { LinkRecord } from './Dashboard';
import { API_BASE } from '../config';

export default function Stats() {
  const { code } = useParams();
  const [link, setLink] = useState<LinkRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/links/${code}`);
        if (res.status === 404) {
          setLink(null);
          setError('Link not found');
        } else if (!res.ok) {
          setError('Failed to load link');
        } else {
          const data = await res.json();
          setLink(data);
        }
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  if (loading) return <div>Loading...</div>;

  if (!link) {
    return (
      <div className="card">
        <h2 className="card-title">Stats</h2>
        <div className="text-error">{error || 'Link not found'}</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title">Stats for {link.shortCode}</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        <div>
          <div className="label">Target URL</div>
          <a
            className="link"
            href={link.originalUrl}
            target="_blank"
            rel="noreferrer"
          >
            {link.originalUrl}
          </a>
        </div>

        <div>
          <div className="label">Total Clicks</div>
          <div>{link.clicks}</div>
        </div>

        <div>
          <div className="label">Last Clicked</div>
          <div>{link.lastClickedAt ? new Date(link.lastClickedAt).toLocaleString() : 'Never'}</div>
        </div>

        <div>
          <div className="label">Created</div>
          <div>{new Date(link.createdAt).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
