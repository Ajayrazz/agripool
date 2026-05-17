import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/* ── All logic below is unchanged from original ── */
const LoginPage = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleChange = (e) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(credentials);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Visual layout starts here ── */
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* ════ Left panel — green gradient ════ */}
      <div className="hidden lg:flex flex-col bg-gradient-to-br from-green-600 to-emerald-700 p-12 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white opacity-5" />
        <div className="absolute -bottom-32 -right-16 w-[28rem] h-[28rem] rounded-full bg-white opacity-5" />

        {/* Logo */}
        <div className="flex items-center gap-3 z-10">
          <span className="text-3xl">🌿</span>
          <span className="text-2xl font-bold tracking-tight">AgriPool</span>
        </div>

        {/* Quote */}
        <div className="flex-1 flex items-center z-10">
          <blockquote className="text-3xl font-bold leading-relaxed text-white/95">
            Connecting farmers and&nbsp;transporters across rural India.&nbsp;🚜
          </blockquote>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-3 z-10">
          {['✓ Free to join', '✓ Pay per booking', '✓ Live tracking'].map(f => (
            <span
              key={f}
              className="px-4 py-2 rounded-full bg-white/15 text-sm font-semibold backdrop-blur-sm border border-white/20"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* ════ Right panel — login card ════ */}
      <div className="flex items-center justify-center p-8 bg-gray-50 min-h-screen lg:min-h-0">
        <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-md">

          {/* Mobile logo (hidden on desktop where left panel shows) */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <span className="text-2xl">🌿</span>
            <span className="text-xl font-bold text-green-600">AgriPool</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back 👋</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to your AgriPool account</p>
          </div>

          {/* Error banner — identical markup, only restyle */}
          {error && (
            <div className="mb-5 flex items-start gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <span className="shrink-0">⚠️</span>
              {error}
            </div>
          )}

          {/* Form — all fields, names, values, handlers unchanged */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all hover:shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-green-600 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
