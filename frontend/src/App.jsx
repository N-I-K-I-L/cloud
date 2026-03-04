import React from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadResumePage from './pages/UploadResumePage';
import EditorPage from './pages/EditorPage';
import PublicPortfolioPage from './pages/PublicPortfolioPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
  };

  return (
    <div>
      <nav className="flex items-center justify-between bg-white/90 px-6 py-4 shadow-sm backdrop-blur">
        <Link to="/" className="text-xl font-bold text-primary">Resume2Portfolio</Link>
        <div className="flex items-center gap-3">
          {token ? (
            <>
              <Link to="/dashboard" className="text-sm text-slate-700">Dashboard</Link>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-700">Login</Link>
              <Link to="/register"><button>Register</button></Link>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-resume"
          element={
            <ProtectedRoute>
              <UploadResumePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editor/:id"
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          }
        />
        <Route path="/portfolio/:username" element={<PublicPortfolioPage />} />
      </Routes>
    </div>
  );
}
