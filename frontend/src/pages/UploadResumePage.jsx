import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function UploadResumePage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [templateId, setTemplateId] = useState('minimal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF resume first.');
      return;
    }
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('template_id', templateId);

    try {
      const response = await api.post('/portfolios/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/editor/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-xl rounded-xl bg-white p-6 shadow">
      <h1 className="text-2xl font-bold">Upload Resume</h1>
      <form className="mt-4 space-y-3" onSubmit={submit}>
        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
          <option value="minimal">Minimal Developer Template</option>
          <option value="dark">Dark Developer Theme</option>
          <option value="cards">Modern Card Layout</option>
          <option value="terminal">Terminal Theme</option>
          <option value="robotic">Robotic Theme</option>
        </select>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} type="submit" className="w-full">
          {loading ? 'Parsing Resume...' : 'Create Portfolio'}
        </button>
      </form>
    </div>
  );
}
