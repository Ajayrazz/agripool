import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';
import BookingTimeline from '../../components/BookingTimeline';

/* ─── Cancel Dialog (logic unchanged, visual updated) ─── */
const CancelDialog = ({ onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-900">Cancel Booking</h2>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          This will restore the vehicle's capacity and reopen your transport request.
        </p>
        <textarea
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent text-sm min-h-24 resize-y mb-4"
          placeholder="Reason for cancellation (optional)…"
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-300 transition-all disabled:opacity-50"
          >
            Keep Booking
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all disabled:opacity-50"
          >
            {loading ? 'Cancelling…' : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── BookingDetailPage ─── */
const BookingDetailPage = () => {
  /* ── All state & API logic unchanged ── */
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking]             = useState(null);
  const [loading, setLoading]             = useState(true);
  const [showDialog, setShowDialog]       = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError]                 = useState('');

  useEffect(() => { fetchBooking(); }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/farmer/bookings/${id}`);
      setBooking(res.data);
    } catch {
      setError('Failed to load booking details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reason) => {
    setCancelLoading(true);
    try {
      const res = await api.post(`/farmer/bookings/${id}/cancel`, {
        cancellation_reason: reason || null,
      });
      setBooking(res.data.booking);
      setShowDialog(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed.');
    } finally {
      setCancelLoading(false);
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse space-y-4">
              <div className="h-6 w-48 bg-gray-200 rounded" />
              {[1,2,3,4].map(i => <div key={i} className="h-4 bg-gray-100 rounded" />)}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse h-64" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse h-48" />
        </div>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error || !booking) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center max-w-sm w-full">
        <p className="text-4xl mb-3">❌</p>
        <p className="text-red-600 text-sm">{error || 'Booking not found.'}</p>
        <Link
          to="/farmer/bookings"
          className="mt-4 inline-flex items-center px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-300 transition-all"
        >
          ← Back
        </Link>
      </div>
    </div>
  );

  const canCancel = ['pending', 'confirmed'].includes(booking.status);
  const vehicle   = booking.vehicle;
  const req       = booking.transport_request;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Back */}
        <button
          onClick={() => navigate('/farmer/bookings')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          ← Back to My Bookings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ══ Left col (2/3) ══ */}
          <div className="lg:col-span-2 space-y-6">

            {/* Booking summary card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Booking #{booking.id}</h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {new Date(booking.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </div>

              {/* Route — large display */}
              {req && (
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 mb-5">
                  <div className="flex-1 text-center">
                    <p className="text-xs text-gray-400 mb-0.5">From</p>
                    <p className="text-lg font-bold text-gray-900 truncate">{req.pickup_location}</p>
                  </div>
                  <div className="text-green-500 text-2xl shrink-0">→</div>
                  <div className="flex-1 text-center">
                    <p className="text-xs text-gray-400 mb-0.5">To</p>
                    <p className="text-lg font-bold text-gray-900 truncate">{req.destination}</p>
                  </div>
                </div>
              )}

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {vehicle && (
                  <>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400">👤 Transporter</p>
                      <p className="font-semibold text-gray-800 mt-0.5">{vehicle.user?.name ?? '—'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400">🚛 Vehicle</p>
                      <p className="font-semibold text-gray-800 mt-0.5">{vehicle.model} ({vehicle.vehicle_type})</p>
                    </div>
                  </>
                )}
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">⚖️ Booked Weight</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{booking.booked_weight_kg} kg</p>
                </div>
                {req && (
                  <>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400">🌾 Produce</p>
                      <p className="font-semibold text-gray-800 mt-0.5">{req.produce_type}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                      <p className="text-xs text-gray-400">📅 Required Date</p>
                      <p className="font-semibold text-gray-800 mt-0.5">{req.required_date}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Cancellation reason */}
              {booking.cancellation_reason && (
                <div className="mt-4 p-3.5 bg-red-50 border-l-4 border-red-400 rounded-xl">
                  <p className="text-xs font-semibold text-red-700">Cancellation Reason</p>
                  <p className="text-sm text-red-600 mt-0.5">{booking.cancellation_reason}</p>
                </div>
              )}

              {/* Cancel action */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                {canCancel ? (
                  <button
                    onClick={() => setShowDialog(true)}
                    className="px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 text-sm font-semibold transition-all"
                  >
                    ❌ Cancel Booking
                  </button>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    {booking.status === 'cancelled'
                      ? 'This booking has been cancelled.'
                      : 'Cancellation not available at this stage.'}
                  </p>
                )}
              </div>
            </div>

            {/* Tracking timeline card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-6">📍 Tracking Timeline</h2>
              <BookingTimeline updates={booking.tracking_updates ?? []} />
            </div>
          </div>

          {/* ══ Right col (1/3) — Payment card ══ */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">💳 Payment Details</h2>

              {/* Amount */}
              <div className="text-center py-4 mb-4 bg-green-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-green-600">₹{Number(booking.total_cost).toFixed(2)}</p>
              </div>

              {booking.payment ? (
                <div className="space-y-3 text-sm">
                  {/* Status */}
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                    <span className="text-gray-500">Status</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      booking.payment.status === 'paid'   ? 'bg-green-100 text-green-700' :
                      booking.payment.status === 'failed' ? 'bg-red-100 text-red-700'     :
                                                            'bg-amber-100 text-amber-700'
                    }`}>
                      {booking.payment.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Razorpay ID if paid */}
                  {booking.payment.status === 'paid' && (
                    <>
                      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                        <span className="text-gray-500">Payment ID</span>
                        <span className="font-mono text-xs text-gray-600 truncate max-w-[140px]">
                          {booking.payment.razorpay_payment_id}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                        <span className="text-gray-500">Paid At</span>
                        <span className="text-gray-800 text-xs">
                          {new Date(booking.payment.paid_at).toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-xl">
                  No payment record found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDialog && (
        <CancelDialog
          onClose={() => setShowDialog(false)}
          onConfirm={handleCancel}
          loading={cancelLoading}
        />
      )}
    </div>
  );
};

export default BookingDetailPage;
