import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api';
import PageHeader from '../../components/ui/PageHeader';

const inputCls = (hasError) =>
  `w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:border-transparent bg-white ${
    hasError
      ? 'border-red-400 focus:ring-red-400'
      : 'border-gray-200 focus:ring-green-500'
  }`;

const SectionLabel = ({ children }) => (
  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">{children}</p>
);

const ScheduleRoutePage = () => {
  /* ── All state unchanged ── */
  const { vehicleId } = useParams();
  const [formData, setFormData] = useState({
    origin: '', destination: '',
    origin_lat: '', origin_lng: '',
    dest_lat: '',  dest_lng: '',
    departure_date: '', departure_time: '', price_per_kg: '',
  });
  const [errors, setErrors]           = useState({});
  const [globalError, setGlobalError] = useState(null);
  const [successMsg, setSuccessMsg]   = useState(null);
  const [geocodingStatus, setGeocodingStatus] = useState({ origin: '', destination: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  /* ── All handlers unchanged ── */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGeocode = async (type, value) => {
    if (!value) return;
    setGeocodingStatus(prev => ({ ...prev, [type]: 'Loading...' }));
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        setFormData(prev => ({
          ...prev,
          [`${type === 'origin' ? 'origin' : 'dest'}_lat`]: latNum,
          [`${type === 'origin' ? 'origin' : 'dest'}_lng`]: lonNum,
        }));
        setGeocodingStatus(prev => ({ ...prev, [type]: `Resolved: Lat ${latNum.toFixed(4)}, Lng ${lonNum.toFixed(4)}` }));
      } else {
        setGeocodingStatus(prev => ({ ...prev, [type]: 'Location not found' }));
      }
    } catch {
      setGeocodingStatus(prev => ({ ...prev, [type]: 'Geocoding failed' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGlobalError(null);
    setIsSubmitting(true);
    try {
      await api.post(`/transporter/vehicles/${vehicleId}/routes`, formData);
      setSuccessMsg('Route scheduled successfully!');
      setTimeout(() => navigate('/transporter/fleet'), 1500);
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setGlobalError(err.response?.data?.message || 'Failed to schedule route');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <Link
          to="/transporter/fleet"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          ← Back to Fleet
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <PageHeader
            title="Schedule New Route"
            subtitle="Create a transport route for farmers to book available capacity."
          />

          {/* Alerts */}
          {globalError && (
            <div className="mb-6 flex items-start gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <span className="shrink-0">⚠️</span> {globalError}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 flex items-start gap-2 p-3.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              <span className="shrink-0">✅</span> {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* ── Section 1: Route Details ── */}
            <div className="space-y-5">
              <SectionLabel>Route Details</SectionLabel>

              {/* Origin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Origin</label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  onBlur={(e) => handleGeocode('origin', e.target.value)}
                  placeholder="Enter origin location (e.g. Mumbai)"
                  required
                  className={inputCls(!!errors.origin)}
                />
                <div className="mt-2 flex items-center justify-between">
                  {geocodingStatus.origin && (
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full">
                      📍 {geocodingStatus.origin}
                    </span>
                  )}
                  {errors.origin && (
                    <span className="text-xs text-red-500 ml-auto">{errors.origin[0]}</span>
                  )}
                </div>
              </div>

              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Destination</label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  onBlur={(e) => handleGeocode('destination', e.target.value)}
                  placeholder="Enter destination location (e.g. Pune)"
                  required
                  className={inputCls(!!errors.destination)}
                />
                <div className="mt-2 flex items-center justify-between">
                  {geocodingStatus.destination && (
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full">
                      📍 {geocodingStatus.destination}
                    </span>
                  )}
                  {errors.destination && (
                    <span className="text-xs text-red-500 ml-auto">{errors.destination[0]}</span>
                  )}
                </div>
              </div>

              {/* Hidden coordinate inputs — unchanged */}
              <input type="hidden" name="origin_lat" value={formData.origin_lat} />
              <input type="hidden" name="origin_lng" value={formData.origin_lng} />
              <input type="hidden" name="dest_lat"   value={formData.dest_lat} />
              <input type="hidden" name="dest_lng"   value={formData.dest_lng} />
            </div>

            <div className="border-t border-gray-100" />

            {/* ── Section 2: Schedule & Pricing ── */}
            <div className="space-y-5">
              <SectionLabel>Schedule &amp; Pricing</SectionLabel>

              {/* Date + Time side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Departure Date</label>
                  <input
                    type="date"
                    name="departure_date"
                    value={formData.departure_date}
                    onChange={handleChange}
                    required
                    className={inputCls(!!errors.departure_date)}
                  />
                  {errors.departure_date && (
                    <p className="text-xs text-red-500 mt-1">{errors.departure_date[0]}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Departure Time</label>
                  <input
                    type="time"
                    name="departure_time"
                    value={formData.departure_time}
                    onChange={handleChange}
                    required
                    className={inputCls(!!errors.departure_time)}
                  />
                  {errors.departure_time && (
                    <p className="text-xs text-red-500 mt-1">{errors.departure_time[0]}</p>
                  )}
                </div>
              </div>

              {/* Price per kg with ₹ prefix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price per kg</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium select-none">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    name="price_per_kg"
                    value={formData.price_per_kg}
                    onChange={handleChange}
                    placeholder="e.g. 15.50"
                    required
                    className={`${inputCls(!!errors.price_per_kg)} pl-8`}
                  />
                </div>
                {errors.price_per_kg && (
                  <p className="text-xs text-red-500 mt-1">{errors.price_per_kg[0]}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all hover:shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Scheduling…' : '📅 Schedule Route'}
              </button>
              <Link
                to="/transporter/fleet"
                className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-300 transition-all"
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

export default ScheduleRoutePage;
