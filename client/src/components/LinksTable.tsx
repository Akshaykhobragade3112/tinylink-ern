import React from 'react';
import type { LinkRecord } from '../pages/Dashboard';
import { API_BASE, SHORT_BASE } from '../config';


type Props = {
  links: LinkRecord[];
  setLinks: React.Dispatch<React.SetStateAction<LinkRecord[]>>;
};

export default function LinksTable({ links, setLinks }: Props) {
  const [query, setQuery] = React.useState('');
  const [loadingDelete, setLoadingDelete] = React.useState<number | null>(null);

  async function handleDelete(code: string, id: number) {
    if (!confirm(`Delete ${code}?`)) return;
    setLoadingDelete(id);
    try {
      const res = await fetch(`${API_BASE}/api/links/${code}`, { method: 'DELETE' });
      if (res.ok) {
        setLinks((l) => l.filter((x) => x.shortCode !== code));
      } else {
        alert('Failed to delete');
      }
    } finally {
      setLoadingDelete(null);
    }
  }

  const filtered = links.filter(
    (l) =>
      l.shortCode.toLowerCase().includes(query.toLowerCase()) ||
      l.originalUrl.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
        <input
          className="input-sm"
          placeholder="Search code or URL..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Short Code</th>
              <th>Target URL</th>
              <th>Total Clicks</th>
              <th>Last Clicked</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: '24px 0',
                    textAlign: 'center',
                    color: '#6b7280',
                  }}
                >
                  No links yet.
                </td>
              </tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id}>
                  <td>
                    <a className="link" href={`${SHORT_BASE}/${l.shortCode}`}>
                      {l.shortCode}
                    </a>
                    <div className="hostname">
                      {(() => {
                        try {
                          return new URL(l.originalUrl).hostname;
                        } catch {
                          return '';
                        }
                      })()}
                    </div>
                  </td>
                  <td>{l.originalUrl}</td>
                  <td>{l.clicks}</td>
                  <td>
                    {l.lastClickedAt
                      ? new Date(l.lastClickedAt).toLocaleString()
                      : '—'}
                  </td>
                  <td>
                    <a
                      className="link"
                      style={{ marginRight: 8 }}
                      href={`/code/${l.shortCode}`}
                    >
                      Stats
                    </a>
                    <button
                      onClick={() => handleDelete(l.shortCode, l.id)}
                      disabled={loadingDelete === l.id}
                      className="btn-link btn-danger"
                    >
                      {loadingDelete === l.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
