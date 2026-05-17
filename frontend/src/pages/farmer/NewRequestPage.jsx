import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import PageHeader from '../../components/ui/PageHeader';

/* ── All constants unchanged ── */
const PRODUCE_TYPES = ['Wheat', 'Rice', 'Maize', 'Vegetables', 'Fruits', 'Cotton', 'Sugarcane', 'Pulses', 'Other'];

/* ── Shared input class ── */
const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all bg-white';

/* ── Section divider label ── */
const SectionLabel = ({ children }) => (
  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">{children}</p>
);

const NewRequestPage = () => {
  /* ── All state unchanged ── */
  const [formData, setFormData] = useState({
    pickup_location: '', destination: '',
    pickup_lat: 0, pickup_lng: 0,
    cargo_weight_kg: '', produce_type: '', required_date: '',
  });
  const [error, setError]               = useState(null);
  const [loading, setLoading]           = useState(false);
  const [geocodingStatus, setGeocodingStatus] = useState('');
  const [successMsg, setSuccessMsg]     = useState(null);
  const navigate = useNavigate();

  /* ── All handlers unchanged ── */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleGeocode = async (value) => {
    if (!value) return;
    setGeocodingStatus('Loading...');
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        setFormData(prev => ({ ...prev, pickup_lat: latNum, pickup_lng: lonNum }));
        setGeocodingStatus(`Resolved: Lat ${latNum.toFixed(4)}, Lng ${lonNum.toFixed(4)}`);
      } else {
        setGeocodingStatus('Location not found');
      }
    } catch {
      setGeocodingStatus('Geocoding failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post('/requests', formData);
      setSuccessMsg('Request posted!');
      setTimeout(() => navigate('/farmer/requests'), 1500);
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors).flat().join(' ') : (err.response?.data?.message || 'Failed to create request'));
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Back link */}
        <Link
          to="/farmer/requests"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          ← Back to My Requests
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <PageHeader
            title="Post a Transport Request"
            subtitle="Fill in the details and we'll match you with available transporters."
          />

          {/* Alerts */}
          {error && (
            <div className="mb-6 flex items-start gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <span className="shrink-0">⚠️</span> {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 flex items-start gap-2 p-3.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              <span className="shrink-0">✅</span> {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* ── Section 1: Pickup Details ── */}
            <div>
              <SectionLabel>Pickup Details</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Pickup Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text" name="pickup_location" value={formData.pickup_location}
                    onChange={handleChange}
                    onBlur={(e) => handleGeocode(e.target.value)}
                    required placeholder="e.g. Pune, Maharashtra"
                    className={inputCls}
                  />
                  {geocodingStatus && (
                    <p className="text-xs text-gray-400 mt-1.5">{geocodingStatus}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Destination <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text" name="destination" value={formData.destination}
                    onChange={handleChange} required placeholder="e.g. Mumbai Market"
                    className={inputCls}
                  />
                </div>
              </div>
              <input type="hidden" name="pickup_lat" value={formData.pickup_lat} />
              <input type="hidden" name="pickup_lng" value={formData.pickup_lng} />
            </div>

            <div className="border-t border-gray-100" />

            {/* ── Section 2: Cargo Details ── */}
            <div>
              <SectionLabel>Cargo Details</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Produce Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="produce_type" value={formData.produce_type}
                    onChange={handleChange} required
                    className={inputCls}
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
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* ── Section 3: Schedule ── */}
            <div>
              <SectionLabel>Schedule</SectionLabel>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Required Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date" name="required_date" value={formData.required_date}
                  onChange={handleChange} required min={today}
                  className={`${inputCls} max-w-xs`}
                />
                <p className="mt-1.5 text-xs text-gray-400">Must be a future date.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-xl transition-all hover:shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting…' : '🌾 Submit Request'}
              </button>
              <Link
                to="/farmer/requests"
                className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-all"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewRequestPage;
