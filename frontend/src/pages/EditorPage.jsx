import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';
import TemplateRenderer from '../components/TemplateRenderer';

function normalize(data) {
  return {
    name: data.name || '',
    about: data.about || '',
    skills: Array.isArray(data.skills) ? data.skills.join(', ') : '',
    technologies: Array.isArray(data.technologies) ? data.technologies.join(', ') : '',
    projects: Array.isArray(data.projects)
      ? data.projects.map((p) => `${p.title || ''}: ${p.description || ''}`).join('\n')
      : '',
    education: Array.isArray(data.education)
      ? data.education.map((e) => `${e.degree || ''}, ${e.institution || ''}`).join('\n')
      : '',
    work_experience: Array.isArray(data.work_experience)
      ? data.work_experience.map((w) => w.role || w.description || '').join('\n')
      : '',
    contact_email: data.contact?.email || '',
    contact_phone: data.contact?.phone || '',
    contact_links: Array.isArray(data.contact?.links) ? data.contact.links.join(', ') : '',
  };
}

function denormalize(form) {
  const projects = form.projects
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...rest] = line.split(':');
      return { title: title.trim(), description: rest.join(':').trim() || title.trim() };
    });

  const education = form.education
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [degree, ...rest] = line.split(',');
      return { degree: degree.trim(), institution: rest.join(',').trim() };
    });

  return {
    name: form.name,
    about: form.about,
    skills: form.skills.split(',').map((item) => item.trim()).filter(Boolean),
    technologies: form.technologies.split(',').map((item) => item.trim()).filter(Boolean),
    projects,
    education,
    work_experience: form.work_experience
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => ({ role: line, description: line })),
    contact: {
      email: form.contact_email,
      phone: form.contact_phone,
      links: form.contact_links.split(',').map((item) => item.trim()).filter(Boolean),
    },
  };
}

export default function EditorPage() {
  const { id } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [form, setForm] = useState(normalize({}));
  const [error, setError] = useState('');
  const [publishUrl, setPublishUrl] = useState('');

  useEffect(() => {
    const load = async () => {
      setError('');
      try {
        const res = await api.get(`/portfolios/${id}/`);
        setPortfolio(res.data);
        setForm(normalize(res.data.portfolio_data_json || {}));
      } catch {
        setError('Failed to load portfolio.');
      }
    };
    load();
  }, [id]);

  const previewData = useMemo(() => denormalize(form), [form]);

  const save = async () => {
    if (!portfolio) return;
    try {
      const payload = {
        portfolio_data_json: previewData,
        template_id: portfolio.template_id,
      };
      const res = await api.patch(`/portfolios/${id}/`, payload);
      setPortfolio(res.data);
    } catch {
      setError('Save failed.');
      throw new Error('save failed');
    }
  };

  const publish = async () => {
    try {
      await save();
      const res = await api.post(`/portfolios/${id}/publish/`);
      setPublishUrl(res.data.public_url || '');
    } catch {
      setError('Publish failed.');
    }
  };

  const copyPublishUrl = async () => {
    if (!publishUrl) return;
    try {
      await navigator.clipboard.writeText(publishUrl);
    } catch {
      setError('Unable to copy public URL. You can copy it manually.');
    }
  };

  if (!portfolio) {
    return <div className="p-8">Loading editor...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-3xl font-bold">Portfolio Editor</h1>
      <p className="mt-2 text-slate-600">Edit the extracted fields before publishing your portfolio.</p>
      {publishUrl && (
        <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm">
          <p className="font-semibold text-teal-800">Published URL</p>
          <p className="mt-1 break-all text-teal-900">{publishUrl}</p>
          <div className="mt-2 flex gap-2">
            <button onClick={copyPublishUrl}>Copy Link</button>
            <Link to="/dashboard"><button className="!bg-accent">Back to Dashboard</button></Link>
          </div>
        </div>
      )}
      {error && <p className="mt-2 text-red-600">{error}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl bg-white p-4 shadow">
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea rows="4" placeholder="About" value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} />
          <input placeholder="Skills (comma separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          <input placeholder="Technologies (comma separated)" value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} />
          <textarea rows="5" placeholder="Projects (one per line: Title: Description)" value={form.projects} onChange={(e) => setForm({ ...form, projects: e.target.value })} />
          <textarea rows="4" placeholder="Education (one per line: Degree, Institution)" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
          <textarea rows="4" placeholder="Work Experience (one per line)" value={form.work_experience} onChange={(e) => setForm({ ...form, work_experience: e.target.value })} />
          <input placeholder="Contact Email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
          <input placeholder="Contact Phone" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
          <input placeholder="Contact Links (comma separated)" value={form.contact_links} onChange={(e) => setForm({ ...form, contact_links: e.target.value })} />
          <div className="flex gap-2">
            <button onClick={save}>Save</button>
            <button className="!bg-accent" onClick={publish}>Publish Portfolio</button>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl shadow">
          <TemplateRenderer templateId={portfolio.template_id} data={previewData} />
        </div>
      </div>
    </div>
  );
}
