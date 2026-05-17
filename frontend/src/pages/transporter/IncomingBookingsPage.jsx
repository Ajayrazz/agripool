import React, { useEffect, useState } from 'react';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';

/* ── Filter config (unchanged) ── */
const FILTERS = ['all', 'pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'];

const IncomingBookingsPage = () => {
  /* ── All state unchanged ── */
  const [bookings, setBookings]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('all');
  const [error, setError]             = useState('');
  const [actionId, setActionId]       = useState(null);
  const [deliveryFormId, setDeliveryFormId] = useState(null);
  const [deliveryNote, setDeliveryNote]     = useState('');

  useEffect(() => { fetchBookings(); }, []);

  /* ── All API handlers unchanged ── */
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
      setBookings(prev => prev.map(b =>
        b.id === id
          ? { ...b, status: action === 'accept' ? 'confirmed' : 'cancelled' }
          : b
      ));
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} booking`);
    } finally {
      setActionId(null);
    }
  };

  const handleTrackUpdate = async (id, status, notes = null) => {
    setActionId(id);
    try {
      await api.post(`/bookings/${id}/track`, { status, notes });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      if (status === 'delivered') {
        setDeliveryFormId(null);
        setDeliveryNote('');
      }
    } catch (err) {
      alert(err.response?.data?.message || `Failed to update tracking to ${status}`);
    } finally {
      setActionId(null);
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  /* ── Loading skeleton ── */
  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse space-y-3">
            <div className="flex justify-between">
              <div className="h-5 w-48 bg-gray-200 rounded" />
              <div className="h-5 w-24 bg-gray-100 rounded-full" />
            </div>
            <div className="h-3 w-64 bg-gray-100 rounded" />
            <div className="h-3 w-40 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        <PageHeader
          title="Incoming Bookings"
          subtitle="Review and respond to farmer booking requests"
        />

        {error && (
          <div className="mb-5 flex items-start gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border capitalize transition-all ${
                filter === f
                  ? 'bg-green-600 text-white border-green-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <EmptyState
              icon="📋"
              title="No bookings found"
              message={
                filter === 'all'
                  ? 'No bookings have been made for your vehicles yet.'
                  : `No ${filter.replace('_', ' ')} bookings.`
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map(b => (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">

                {/* Row 1: Booking ID + vehicle + status */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">Booking #{b.id}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      🚛 {b.vehicle?.model} · <span className="font-mono">{b.vehicle?.registration_no}</span>
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>

                {/* Row 2: Farmer info */}
                <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                  <span className="text-base">👤</span>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                    <span className="text-sm font-semibold text-gray-800">{b.farmer?.name}</span>
                    {b.farmer?.phone && (
                      <span className="text-sm text-gray-500">{b.farmer.phone}</span>
                    )}
                  </div>
                </div>

                {/* Row 3: Cargo + route + revenue */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                    ⚖️ {b.booked_weight_kg} kg
                  </span>
                  {b.transport_request && (
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <span className="truncate max-w-[120px]">{b.transport_request.pickup_location}</span>
                      <span className="text-green-500">→</span>
                      <span className="truncate max-w-[120px]">{b.transport_request.destination}</span>
                    </span>
                  )}
                  <span className="ml-auto font-bold text-green-600">
                    ₹{Number(b.total_cost).toFixed(2)}
                  </span>
                </div>

                {/* ── Status-based action buttons (logic 100% unchanged) ── */}

                {/* Pending: Accept / Reject */}
                {b.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleAction(b.id, 'accept')}
                      disabled={actionId === b.id}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2.5 rounded-xl transition-all disabled:opacity-50"
                    >
                      {actionId === b.id ? 'Processing…' : '✅ Accept'}
                    </button>
                    <button
                      onClick={() => handleAction(b.id, 'reject')}
                      disabled={actionId === b.id}
                      className="flex-1 border border-red-300 text-red-600 hover:bg-red-50 font-medium px-6 py-2.5 rounded-xl transition-all disabled:opacity-50"
                    >
                      {actionId === b.id ? 'Processing…' : '❌ Reject'}
                    </button>
                  </div>
                )}

                {/* Confirmed: Mark In Transit */}
                {b.status === 'confirmed' && (
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleTrackUpdate(b.id, 'in_transit', 'Shipment has departed.')}
                      disabled={actionId === b.id}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition-all disabled:opacity-50"
                    >
                      {actionId === b.id ? 'Updating…' : '🚛 Mark In Transit'}
                    </button>
                  </div>
                )}

                {/* In Transit: Mark Delivered (with notes form) */}
                {b.status === 'in_transit' && (
                  <div className="pt-4 border-t border-gray-100">
                    {deliveryFormId === b.id ? (
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Delivery notes <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                          value={deliveryNote}
                          onChange={(e) => setDeliveryNote(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm min-h-[80px] resize-y"
                          placeholder="e.g. Delivered to warehouse manager."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTrackUpdate(b.id, 'delivered', deliveryNote)}
                            disabled={actionId === b.id}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-2.5 rounded-xl transition-all disabled:opacity-50"
                          >
                            {actionId === b.id ? 'Confirming…' : 'Confirm Delivery'}
                          </button>
                          <button
                            onClick={() => setDeliveryFormId(null)}
                            disabled={actionId === b.id}
                            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-300 transition-all disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeliveryFormId(b.id)}
                        disabled={actionId === b.id}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-2.5 rounded-xl transition-all disabled:opacity-50"
                      >
                        📦 Mark as Delivered
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomingBookingsPage;
