import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register/', form);
      const loginRes = await api.post('/auth/token/', { username: form.username, password: form.password });
      localStorage.setItem('access_token', loginRes.data.access);
      localStorage.setItem('refresh_token', loginRes.data.refresh);
      navigate('/dashboard');
    } catch (err) {
      const payload = err.response?.data;
      const parsed = typeof payload === 'string' ? payload : JSON.stringify(payload);
      setError(parsed || 'Registration failed.');
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md rounded-xl bg-white p-6 shadow">
      <h1 className="text-2xl font-bold">Register</h1>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="w-full">Create Account</button>
      </form>
      <p className="mt-4 text-sm">Already registered? <Link to="/login" className="text-primary">Login</Link></p>
    </div>
  );
}
