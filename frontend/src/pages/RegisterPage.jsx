import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ROLES = [
  { value: 'farmer',      label: '🌾 Farmer',      desc: 'Post cargo transport requests' },
  { value: 'transporter', label: '🚛 Transporter',  desc: 'Offer vehicle transport services' },
];

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', password_confirmation: '', role: 'farmer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-earth-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌿</div>
          <h1 className="text-3xl font-bold text-gray-900">Join AgriPool</h1>
          <p className="text-gray-500 mt-1 text-sm">Create your free account</p>
        </div>

        <div className="card shadow-md">
          {error && (
            <div className="mb-5 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <span className="shrink-0">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a…</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(role => (
                  <label
                    key={role.value}
                    className={`flex flex-col gap-1 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.role === role.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
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
                    <span className="font-semibold text-sm text-gray-800">{role.label}</span>
                    <span className="text-xs text-gray-500">{role.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text" name="name" value={formData.name}
                onChange={handleChange} required placeholder="John Doe"
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email" name="email" value={formData.email}
                onChange={handleChange} required placeholder="you@example.com"
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="tel" name="phone" value={formData.phone}
                onChange={handleChange} placeholder="+91 98765 43210"
                className="form-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input
                  type="password" name="password" value={formData.password}
                  onChange={handleChange} required minLength={8} placeholder="••••••••"
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm</label>
                <input
                  type="password" name="password_confirmation" value={formData.password_confirmation}
                  onChange={handleChange} required minLength={8} placeholder="••••••••"
                  className="form-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-base mt-2"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-green-700 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
