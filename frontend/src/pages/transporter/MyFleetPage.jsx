import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';

/* ── Vehicle type icons (unchanged) ── */
const VEHICLE_ICONS = { truck: '🚛', 'mini-truck': '🚐', pickup: '🛻' };

/* ── Capacity bar (logic unchanged, visual updated) ── */
const CapacityBar = ({ total, remaining }) => {
  const pct   = total > 0 ? Math.round((remaining / total) * 100) : 0;
  const color = pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-yellow-400' : 'bg-red-500';
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
        <span>Remaining Capacity</span>
        <span className="font-semibold text-gray-700">{remaining} / {total} kg</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const MyFleetPage = () => {
  /* ── All state & API logic unchanged ── */
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/transporter/vehicles');
      setVehicles(res.data);
    } catch {
      setError('Failed to load fleet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle? This cannot be undone.')) return;
    try {
      await api.delete(`/transporter/vehicles/${id}`);
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  /* ── Loading skeleton ── */
  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-11 h-11 rounded-full bg-gray-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-20 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="h-6 w-20 bg-gray-100 rounded-full" />
              </div>
              <div className="h-3 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        <PageHeader
          title="My Fleet"
          subtitle="Manage your vehicles and routes"
          action={
            <Link
              to="/transporter/fleet/new"
              className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:shadow-md"
            >
              + Add Vehicle
            </Link>
          }
        />

        {error && (
          <div className="mb-5 flex items-start gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <span>⚠️</span> {error}
          </div>
        )}

        {vehicles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <EmptyState
              icon="🚛"
              title="No vehicles yet"
              message="Add your first vehicle to start accepting bookings."
              action={
                <Link
                  to="/transporter/fleet/new"
                  className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
                >
                  + Add Vehicle
                </Link>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicles.map(v => (
              <div key={v.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">

                {/* Top: icon + info + availability badge */}
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-xl shrink-0">
                      {VEHICLE_ICONS[v.vehicle_type] ?? '🚗'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">{v.model}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 font-mono">{v.registration_no}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium capitalize">
                          {v.vehicle_type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
                    v.is_available
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${v.is_available ? 'bg-green-500' : 'bg-red-500'}`} />
                    {v.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                {/* Capacity bar */}
                <CapacityBar total={v.total_capacity_kg} remaining={v.remaining_capacity_kg} />

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-gray-100">
                  <Link
                    to={`/transporter/fleet/${v.id}/routes/new`}
                    className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:shadow-md"
                  >
                    📅 Schedule Route
                  </Link>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFleetPage;
