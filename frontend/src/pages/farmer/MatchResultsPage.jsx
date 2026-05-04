import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api';

const MatchResultsPage = () => {
  const { id: requestId } = useParams();
  const navigate = useNavigate();
  const [matches, setMatches]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [bookingId, setBookingId]     = useState(null);

  useEffect(() => {
    if (requestId) fetchMatches();
    else setLoading(false);
  }, [requestId]);

  const fetchMatches = async () => {
    try {
      const res = await api.get(`/matches?request_id=${requestId}`);
      setMatches(res.data.data);
    } catch {
      setError('Failed to load matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (route) => {
    if (!window.confirm(
      `Confirm booking with ${route.vehicle?.user?.name}?\nVehicle: ${route.vehicle?.model}\nPrice: ₹${route.price_per_kg}/kg`
    )) return;
    setBookingId(route.id);
    try {
      const res = await api.post('/farmer/bookings', {
        vehicle_id: route.vehicle_id,
        request_id: requestId,
        route_id: route.id,
      });
      navigate(`/farmer/bookings/${res.data.booking.id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBookingId(null);
    }
  };

  if (loading) return (
    <main className="page-container">
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="card animate-pulse">
            <div className="flex justify-between">
              <div className="h-5 w-40 bg-gray-200 rounded" />
              <div className="h-5 w-24 bg-gray-100 rounded" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-3 w-64 bg-gray-100 rounded" />
              <div className="h-3 w-48 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );

  return (
    <main className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available Transporters</h1>
          <p className="text-sm text-gray-500 mt-0.5">Sorted by proximity to your pickup location</p>
        </div>
        <Link to={`/farmer/requests/${requestId}`} className="btn-secondary">
          ← Back
        </Link>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {matches.length === 0 && !error && (
        <div className="card flex flex-col items-center py-16 text-center gap-3">
          <span className="text-5xl">🔍</span>
          <h3 className="font-semibold text-gray-700">No matches found</h3>
          <p className="text-sm text-gray-400">No transporters are currently available for this route and date.</p>
        </div>
      )}

      <div className="space-y-4">
        {matches.map((route, index) => (
          <div key={route.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-earth-100 flex items-center justify-center text-lg font-bold text-earth-700">
                  #{index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{route.vehicle?.user?.name}</h3>
                  <p className="text-xs text-gray-500">
                    {route.vehicle?.model} · {route.vehicle?.vehicle_type}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl font-bold text-green-700">₹{route.price_per_kg}</p>
                <p className="text-xs text-gray-400">per kg</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-xs text-gray-400">Remaining Capacity</p>
                <p className="font-semibold text-gray-800 mt-0.5">{route.vehicle?.remaining_capacity_kg} kg</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-xs text-gray-400">Distance</p>
                <p className="font-semibold text-gray-800 mt-0.5">{Number(route.distance).toFixed(3)}°</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-xs text-gray-400">Departure</p>
                <p className="font-semibold text-gray-800 mt-0.5">{route.departure_time}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleBook(route)}
                disabled={bookingId === route.id}
                className="btn-primary w-full sm:w-auto justify-center"
              >
                {bookingId === route.id ? 'Booking…' : '🚛 Book this Vehicle'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default MatchResultsPage;
