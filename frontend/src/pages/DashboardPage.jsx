import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function DashboardPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [publishUrl, setPublishUrl] = useState('');

  const load = async () => {
    setError('');
    try {
      const res = await api.get('/portfolios/');
      setItems(res.data);
    } catch {
      setError('Failed to load portfolios.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const publish = async (id) => {
    try {
      const res = await api.post(`/portfolios/${id}/publish/`);
      setPublishUrl(res.data.public_url || '');
      await load();
    } catch {
      setError('Failed to publish portfolio.');
    }
  };

  const copyPublishUrl = async () => {
    try {
      await navigator.clipboard.writeText(publishUrl);
    } catch {
      setError('Unable to copy public URL. You can copy it manually.');
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link to="/upload-resume"><button>Create New Portfolio</button></Link>
      </div>
      {publishUrl && (
        <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm">
          <p className="font-semibold text-teal-800">Published URL</p>
          <p className="mt-1 break-all text-teal-900">{publishUrl}</p>
          <button className="mt-2" onClick={copyPublishUrl}>Copy Link</button>
        </div>
      )}
      {error && <p className="mt-3 text-red-600">{error}</p>}
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p><strong>Template:</strong> {item.template_id}</p>
                <p><strong>Last Modified:</strong> {new Date(item.updated_at).toLocaleString()}</p>
                <p><strong>Status:</strong> {item.is_published ? 'Published' : 'Draft'}</p>
              </div>
              <div className="flex gap-2">
                <Link to={`/editor/${item.id}`}><button>Edit</button></Link>
                <Link to={`/portfolio/${item.username}`}><button className="!bg-accent">View</button></Link>
                {!item.is_published && <button onClick={() => publish(item.id)}>Publish</button>}
              </div>
            </div>
          </div>
        ))}
        {!items.length && <p className="text-slate-600">No portfolios yet. Upload your resume to start.</p>}
      </div>
    </div>
  );
}
