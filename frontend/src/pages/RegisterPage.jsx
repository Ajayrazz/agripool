import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/* ── Role config (unchanged) ── */
const ROLES = [
  { value: 'farmer',      emoji: '🌾', label: 'Farmer',      desc: 'Post cargo transport requests'    },
  { value: 'transporter', emoji: '🚛', label: 'Transporter',  desc: 'Offer vehicle transport services' },
];

/* ── All logic below is unchanged from original ── */
const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', password_confirmation: '', role: 'farmer',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        setError(Object.values(errors).flat().join(' '));
      } else {
        setError(err.response?.data?.message || 'Registration failed. Check your inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* shared input class */
  const inputCls =
    'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all bg-white';

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
            Join 500+ farmers saving on transport costs every harvest season.&nbsp;🌾
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

      {/* ════ Right panel — register card ════ */}
      <div className="flex items-center justify-center p-8 bg-gray-50 min-h-screen lg:min-h-0">
        <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <span className="text-2xl">🌿</span>
            <span className="text-xl font-bold text-green-600">AgriPool</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900">Create your account 🚀</h1>
            <p className="text-sm text-gray-500 mt-1">Join AgriPool — it's completely free</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-5 flex items-start gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <span className="shrink-0">⚠️</span>
              {error}
            </div>
          )}

          {/* Form — all fields, names, values, handlers unchanged */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Role toggle cards ── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a…</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(role => (
                  <label
                    key={role.value}
                    className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col items-center gap-2 transition-all select-none ${
                      formData.role === role.value
                        ? 'border-green-500 bg-green-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-3xl leading-none">{role.emoji}</span>
                    <span className={`text-sm font-semibold ${formData.role === role.value ? 'text-green-700' : 'text-gray-700'}`}>
                      {role.label}
                    </span>
                    <span className="text-[11px] text-gray-400 text-center leading-snug">{role.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text" name="name" value={formData.name}
                onChange={handleChange} required placeholder="John Doe"
                className={inputCls}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email" name="email" value={formData.email}
                onChange={handleChange} required placeholder="you@example.com"
                className={inputCls}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="tel" name="phone" value={formData.phone}
                onChange={handleChange} placeholder="+91 98765 43210"
                className={inputCls}
              />
            </div>

            {/* Password + Confirm */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input
                  type="password" name="password" value={formData.password}
                  onChange={handleChange} required minLength={8} placeholder="••••••••"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm</label>
                <input
                  type="password" name="password_confirmation" value={formData.password_confirmation}
                  onChange={handleChange} required minLength={8} placeholder="••••••••"
                  className={inputCls}
                />
              </div>
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
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-green-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
