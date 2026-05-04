import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const VEHICLE_ICONS = { truck: '🚛', 'mini-truck': '🚐', pickup: '🛻' };

const CapacityBar = ({ total, remaining }) => {
  const pct = total > 0 ? Math.round((remaining / total) * 100) : 0;
  const color = pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-yellow-400' : 'bg-red-500';
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Remaining capacity</span>
        <span className="font-medium">{remaining} / {total} kg</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const MyFleetPage = () => {
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

  if (loading) return (
    <main className="page-container">
      <div className="space-y-4">
        {[1,2].map(i => (
          <div key={i} className="card animate-pulse space-y-3">
            <div className="flex justify-between">
              <div className="h-5 w-40 bg-gray-200 rounded" />
              <div className="h-5 w-20 bg-gray-100 rounded-full" />
            </div>
            <div className="h-3 w-64 bg-gray-100 rounded" />
            <div className="h-2 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
    </main>
  );

  return (
    <main className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Fleet</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your vehicles and routes</p>
        </div>
        <Link to="/transporter/fleet/new" className="btn-primary">+ Add Vehicle</Link>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center gap-3">
          <span className="text-5xl">🚛</span>
          <h3 className="text-base font-semibold text-gray-700">No vehicles yet</h3>
          <p className="text-sm text-gray-400">Add your first vehicle to start accepting bookings.</p>
          <Link to="/transporter/fleet/new" className="btn-primary mt-2">+ Add Vehicle</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {vehicles.map(v => (
            <div key={v.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-earth-50 border border-earth-100 flex items-center justify-center text-2xl">
                    {VEHICLE_ICONS[v.vehicle_type] ?? '🚗'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{v.model}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {v.registration_no} · {v.vehicle_type}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  v.is_available
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {v.is_available ? '● Available' : '● Unavailable'}
                </span>
              </div>

              <CapacityBar total={v.total_capacity_kg} remaining={v.remaining_capacity_kg} />

              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
                <Link
                  to={`/transporter/fleet/${v.id}/routes/new`}
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  📅 Schedule Route
                </Link>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="btn-danger text-xs px-3 py-1.5"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default MyFleetPage;
