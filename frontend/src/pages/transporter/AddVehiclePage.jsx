import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import PageHeader from '../../components/ui/PageHeader';

/* ── Vehicle type toggle cards ── */
const VEHICLE_TYPES = [
  { value: 'truck',      emoji: '🚛', label: 'Truck',      desc: 'Heavy freight carrier' },
  { value: 'mini-truck', emoji: '🚐', label: 'Mini-Truck',  desc: 'Medium load capacity'  },
  { value: 'pickup',     emoji: '🛻', label: 'Pickup',      desc: 'Small loads & local'   },
];

const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all bg-white';

const AddVehiclePage = () => {
  /* ── All state unchanged ── */
  const [formData, setFormData] = useState({
    registration_no: '',
    vehicle_type: 'truck',
    total_capacity_kg: '',
    model: '',
    is_available: true,
  });
  const [error, setError]           = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  /* ── All handlers unchanged ── */
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await api.post('/transporter/vehicles', formData);
      navigate('/transporter/fleet');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vehicle');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">

        <Link
          to="/transporter/fleet"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          ← Back to Fleet
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <PageHeader
            title="Add New Vehicle"
            subtitle="Register a new vehicle to your fleet to start scheduling routes."
          />

          {error && (
            <div className="mb-6 flex items-start gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <span className="shrink-0">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Vehicle type toggle cards ── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
              <div className="grid grid-cols-3 gap-3">
                {VEHICLE_TYPES.map(vt => (
                  <label
                    key={vt.value}
                    className={`border-2 rounded-xl p-3 cursor-pointer flex flex-col items-center gap-1.5 transition-all select-none ${
                      formData.vehicle_type === vt.value
                        ? 'border-green-500 bg-green-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="vehicle_type"
                      value={vt.value}
                      checked={formData.vehicle_type === vt.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-2xl leading-none">{vt.emoji}</span>
                    <span className={`text-xs font-semibold ${formData.vehicle_type === vt.value ? 'text-green-700' : 'text-gray-700'}`}>
                      {vt.label}
                    </span>
                    <span className="text-[10px] text-gray-400 text-center leading-snug">{vt.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Registration No. */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Registration No.</label>
              <input
                type="text"
                name="registration_no"
                value={formData.registration_no}
                onChange={handleChange}
                placeholder="e.g. MH12 AB 1234"
                required
                className={`${inputCls} uppercase`}
              />
            </div>

            {/* Vehicle Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Vehicle Model</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g. Tata Ace, Mahindra Bolero"
                required
                className={inputCls}
              />
            </div>

            {/* Total Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Capacity (kg)</label>
              <input
                type="number"
                name="total_capacity_kg"
                step="0.1"
                value={formData.total_capacity_kg}
                onChange={handleChange}
                placeholder="e.g. 1000"
                required
                className={inputCls}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all hover:shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding Vehicle…' : 'Add Vehicle'}
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

export default AddVehiclePage;
