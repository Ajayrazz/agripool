import React, { useEffect, useState } from 'react';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';

const FILTERS = ['all', 'pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'];

const IncomingBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [error, setError]       = useState('');
  const [actionId, setActionId] = useState(null);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/transporter/bookings/incoming');
      setBookings(res.data.data ?? res.data);
    } catch {
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setActionId(id);
    try {
      await api.patch(`/transporter/bookings/${id}/status`, { action });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} booking`);
    } finally {
      setActionId(null);
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return (
    <main className="page-container">
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="card animate-pulse space-y-3">
            <div className="flex justify-between">
              <div className="h-5 w-48 bg-gray-200 rounded" />
              <div className="h-5 w-24 bg-gray-100 rounded-full" />
            </div>
            <div className="h-3 w-64 bg-gray-100 rounded" />
            <div className="h-3 w-40 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </main>
  );

  return (
    <main className="page-container">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Incoming Bookings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review and respond to farmer booking requests</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
              filter === f
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-green-400'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center gap-3">
          <span className="text-5xl">📋</span>
          <h3 className="text-base font-semibold text-gray-700">No bookings found</h3>
          <p className="text-sm text-gray-400">
            {filter === 'all' ? 'No bookings have been made for your vehicles yet.' : `No ${filter} bookings.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(b => (
            <div key={b.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">
                    Booking #{b.id}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Vehicle: {b.vehicle?.registration_no} · {b.vehicle?.model}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-400">Farmer</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{b.farmer?.name}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{b.farmer?.phone || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-400">Weight</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{b.booked_weight_kg} kg</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2.5">
                  <p className="text-xs text-green-600">Revenue</p>
                  <p className="font-bold text-green-700 mt-0.5">₹{Number(b.total_cost).toFixed(2)}</p>
                </div>
              </div>

              {b.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleAction(b.id, 'accept')}
                    disabled={actionId === b.id}
                    className="btn-primary text-sm flex-1 justify-center"
                  >
                    {actionId === b.id ? 'Processing…' : '✅ Accept'}
                  </button>
                  <button
                    onClick={() => handleAction(b.id, 'reject')}
                    disabled={actionId === b.id}
                    className="btn-danger text-sm flex-1 justify-center"
                  >
                    {actionId === b.id ? 'Processing…' : '❌ Reject'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default IncomingBookingsPage;
