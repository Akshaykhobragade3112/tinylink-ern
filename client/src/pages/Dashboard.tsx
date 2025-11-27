import React, { useEffect, useState } from 'react';
import LinkForm from '../components/LinkForm';
import LinksTable from '../components/LinksTable';

export type LinkRecord = {
  id: number;
  shortCode: string;
  originalUrl: string;
  clicks: number;
  lastClickedAt: string | null;
  createdAt: string;
};

export default function Dashboard() {
  const [links, setLinks] = useState<LinkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch('/api/links');
      if (!res.ok) throw new Error('Failed to load links');
      const data = await res.json();
      setLinks(data);
    } catch (e: any) {
      setError(e.message || 'Error loading links');
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // called when LinkForm successfully creates a new link
  function handleCreated(newLink: LinkRecord) {
    setLinks((prev) => [newLink, ...prev]);
  }

  return (
    <div className="stack">
      <div className="card">
        <h2 className="card-title">Create a new short link</h2>
        <LinkForm onCreated={handleCreated} />
      </div>

      <div className="card">
        <h2 className="card-title">All links</h2>
        {error && <div className="text-error">{error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <LinksTable links={links} setLinks={setLinks} />
        )}
      </div>
    </div>
  );
}
