import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/token/', form);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed.');
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md rounded-xl bg-white p-6 shadow">
      <h1 className="text-2xl font-bold">Login</h1>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="w-full">Login</button>
      </form>
      <p className="mt-4 text-sm">No account? <Link to="/register" className="text-primary">Register</Link></p>
    </div>
  );
}
