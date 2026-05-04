import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    api.get('/farmer/bookings')
      .then(res => setBookings(res.data.data ?? []))
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <main className="page-container">
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="card animate-pulse space-y-3">
            <div className="flex justify-between">
              <div className="h-5 w-40 bg-gray-200 rounded" />
              <div className="h-5 w-24 bg-gray-100 rounded-full" />
            </div>
            <div className="h-3 w-56 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </main>
  );

  return (
    <main className="page-container">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track all your transport bookings</p>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {bookings.length === 0 && !error ? (
        <div className="card flex flex-col items-center py-16 text-center gap-3">
          <span className="text-5xl">📦</span>
          <h3 className="text-base font-semibold text-gray-700">No bookings yet</h3>
          <p className="text-sm text-gray-400">Post a request and book a transporter to get started.</p>
          <Link to="/farmer/requests" className="btn-primary mt-2">View Requests</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <Link
              key={b.id}
              to={`/farmer/bookings/${b.id}`}
              className="card hover:shadow-md transition-shadow block"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">
                    Booking #{b.id} · {b.vehicle?.model ?? 'Vehicle'}
                  </h3>
                  <div className="flex gap-4 text-xs text-gray-500 mt-1.5">
                    <span>⚖️ {b.booked_weight_kg} kg</span>
                    <span>💰 ₹{Number(b.total_cost).toFixed(2)}</span>
                  </div>
                </div>
                <StatusBadge status={b.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
};

export default MyBookingsPage;
