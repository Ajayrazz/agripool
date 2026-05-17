import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';

const MatchResultsPage = () => {
  /* ── All state & API logic unchanged ── */
  const { id: requestId } = useParams();
  const navigate = useNavigate();
  const [transportRequest, setTransportRequest] = useState(null);
  const [matches, setMatches]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [bookingId, setBookingId]   = useState(null);

  useEffect(() => {
    if (requestId) fetchData();
    else setLoading(false);
  }, [requestId]);

  const fetchData = async () => {
    try {
      const reqRes = await api.get(`/requests/${requestId}`);
      setTransportRequest(reqRes.data.data || reqRes.data);
      const res = await api.get(`/matches?request_id=${requestId}`);
      setMatches(res.data.data || res.data);
    } catch {
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e, route) => {
    e.preventDefault();
    const weight = e.target.elements.booked_weight_kg.value;
    if (!window.confirm(
      `Confirm booking with ${route.vehicle?.user?.name} for ${weight}kg?\nVehicle: ${route.vehicle?.model}\nPrice: ₹${route.price_per_kg}/kg`
    )) return;

    setBookingId(route.id);
    try {
      await api.post('/farmer/bookings', {
        vehicle_id: route.vehicle_id,
        request_id: requestId,
        route_id: route.id,
        booked_weight_kg: Number(weight),
      });
      setSuccessMsg('Booking confirmed! Redirecting...');
      setTimeout(() => navigate('/farmer/bookings'), 1500);
    } catch (err) {
      if (err.response?.status === 422) {
        alert('Not enough capacity available.');
      } else {
        alert(err.response?.data?.message || 'Booking failed. Please try again.');
      }
    } finally {
      setBookingId(null);
    }
  };

  /* ── Loading skeleton ── */
  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse space-y-4">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-48 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded" />
              <div className="h-10 w-full bg-gray-100 rounded-xl" />
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
          title="Available Vehicles"
          subtitle={
            transportRequest
              ? `${transportRequest.pickup_location} → ${transportRequest.destination}`
              : 'Sorted by proximity to your pickup location'
          }
          action={
            <Link
              to={`/farmer/requests/${requestId}`}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
            >
              ← Back
            </Link>
          }
        />

        {/* Alerts */}
        {error && (
          <div className="mb-5 flex items-start gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <span>⚠️</span> {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-5 flex items-start gap-2 p-3.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            <span>✅</span> {successMsg}
          </div>
        )}

        {/* Empty state */}
        {matches.length === 0 && !error && !loading && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <EmptyState
              icon="🔍"
              title="No matches found"
              message="No vehicles available for this route and date yet. Check back later."
            />
          </div>
        )}

        {/* Vehicle cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((route) => {
            const cap     = route.vehicle?.capacity_kg ?? 1;
            const rem     = route.vehicle?.remaining_capacity_kg ?? 0;
            const usedPct = Math.max(0, Math.min(100, ((cap - rem) / cap) * 100));

            return (
              <div
                key={route.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-green-200 transition-all"
              >
                {/* Top: icon + vehicle info + price */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-xl shrink-0">
                      🚛
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{route.vehicle?.model}</p>
                      <p className="text-xs text-gray-500 font-mono">{route.vehicle?.registration_no}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold text-green-600">₹{route.price_per_kg}</p>
                    <p className="text-xs text-gray-400">/kg</p>
                  </div>
                </div>

                {/* Transporter */}
                <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-4">
                  <span>👤</span>
                  <span className="font-medium">{route.vehicle?.user?.name}</span>
                  <span className="text-gray-400 text-xs ml-1">· {route.vehicle?.vehicle_type}</span>
                </div>

                {/* Capacity progress bar */}
                <div className="mb-1 flex justify-between text-xs text-gray-500">
                  <span>Remaining Capacity</span>
                  <span className="font-semibold text-gray-700">{rem} kg</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2 mb-4">
                  <div
                    className="bg-green-500 rounded-full h-2 transition-all"
                    style={{ width: `${100 - usedPct}%` }}
                  />
                </div>

                {/* Info chips */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-gray-400">Distance</p>
                    <p className="font-semibold text-gray-700 mt-0.5">
                      {route.distance !== undefined ? Number(route.distance).toFixed(3) + '°' : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-gray-400">Departure</p>
                    <p className="font-semibold text-gray-700 mt-0.5">{route.departure_time}</p>
                  </div>
                </div>

                {/* Booking form — all fields/handlers unchanged */}
                <form onSubmit={(e) => handleBook(e, route)} className="pt-4 border-t border-gray-100 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      How many kg do you want to book?
                    </label>
                    <input
                      type="number"
                      name="booked_weight_kg"
                      min="1"
                      max={route.vehicle?.remaining_capacity_kg}
                      defaultValue={transportRequest?.cargo_weight_kg || 1}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={bookingId === route.id}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {bookingId === route.id ? 'Booking…' : 'Book Now 🚛'}
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MatchResultsPage;
