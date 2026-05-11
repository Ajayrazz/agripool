import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api';

const MatchResultsPage = () => {
  const { id: requestId } = useParams();
  const navigate = useNavigate();
  const [transportRequest, setTransportRequest] = useState(null);
  const [matches, setMatches]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [successMsg, setSuccessMsg]   = useState('');
  const [bookingId, setBookingId]     = useState(null);

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
      const res = await api.post('/farmer/bookings', {
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

      {successMsg && (
        <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          ✅ {successMsg}
        </div>
      )}

      {matches.length === 0 && !error && !loading && (
        <div className="card flex flex-col items-center py-16 text-center gap-3">
          <span className="text-5xl">🔍</span>
          <h3 className="font-semibold text-gray-700">No matches found</h3>
          <p className="text-sm text-gray-400">No vehicles available for this route and date yet. Check back later.</p>
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
                    {route.vehicle?.model} · {route.vehicle?.vehicle_type} · <span className="font-mono text-gray-600">{route.vehicle?.registration_no}</span>
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
                <p className="font-semibold text-gray-800 mt-0.5">{route.distance !== undefined ? Number(route.distance).toFixed(3) + '°' : 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-xs text-gray-400">Departure</p>
                <p className="font-semibold text-gray-800 mt-0.5">{route.departure_time}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <form onSubmit={(e) => handleBook(e, route)} className="flex flex-col sm:flex-row items-end gap-3">
                <div className="flex-1 w-full sm:w-auto">
                  <label className="block text-xs font-medium text-gray-600 mb-1">How many kg do you want to book?</label>
                  <input
                    type="number"
                    name="booked_weight_kg"
                    min="1"
                    max={route.vehicle?.remaining_capacity_kg}
                    defaultValue={transportRequest?.cargo_weight_kg || 1}
                    required
                    className="form-input w-full py-2"
                  />
                </div>
                <button
                  type="submit"
                  disabled={bookingId === route.id}
                  className="btn-primary w-full sm:w-auto justify-center"
                >
                  {bookingId === route.id ? 'Booking…' : 'Book Now'}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default MatchResultsPage;
