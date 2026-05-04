import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api';

const PRODUCE_TYPES = ['Wheat', 'Rice', 'Maize', 'Vegetables', 'Fruits', 'Cotton', 'Sugarcane', 'Pulses', 'Other'];

const NewRequestPage = () => {
  const [formData, setFormData] = useState({
    pickup_location: '', destination: '',
    pickup_lat: 0, pickup_lng: 0,
    cargo_weight_kg: '', produce_type: '', required_date: '',
  });
  const [error, setError]   = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post('/requests', formData);
      navigate('/farmer/requests');
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors).flat().join(' ') : (err.response?.data?.message || 'Failed to create request'));
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <main className="page-container">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <Link to="/farmer/requests" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          ← Back to My Requests
        </Link>

        <div className="card">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">Post a Transport Request</h1>
            <p className="text-sm text-gray-500 mt-1">Fill in the details and we'll match you with available transporters.</p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex gap-2">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Route */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Pickup Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" name="pickup_location" value={formData.pickup_location}
                  onChange={handleChange} required placeholder="e.g. Pune, Maharashtra"
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Destination <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" name="destination" value={formData.destination}
                  onChange={handleChange} required placeholder="e.g. Mumbai Market"
                  className="form-input"
                />
              </div>
            </div>

            {/* Cargo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Produce Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="produce_type" value={formData.produce_type}
                  onChange={handleChange} required
                  className="form-input"
                >
                  <option value="">Select produce…</option>
                  {PRODUCE_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Cargo Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" name="cargo_weight_kg" value={formData.cargo_weight_kg}
                  onChange={handleChange} required min="1" placeholder="e.g. 500"
                  className="form-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Required Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date" name="required_date" value={formData.required_date}
                onChange={handleChange} required min={today}
                className="form-input"
              />
              <p className="mt-1 text-xs text-gray-400">Must be a future date.</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary px-8">
                {loading ? 'Submitting…' : '🌾 Submit Request'}
              </button>
              <Link to="/farmer/requests" className="btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default NewRequestPage;
