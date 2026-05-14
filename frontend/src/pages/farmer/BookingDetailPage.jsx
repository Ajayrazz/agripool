import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';
import BookingTimeline from '../../components/BookingTimeline';

/* ─── Cancel Dialog ─── */
const CancelDialog = ({ onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-900">Cancel Booking</h2>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          This will restore the vehicle's capacity and reopen your transport request.
        </p>
        <textarea
          className="form-input min-h-24 resize-y mb-4"
          placeholder="Reason for cancellation (optional)…"
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} disabled={loading} className="btn-secondary">
            Keep Booking
          </button>
          <button onClick={() => onConfirm(reason)} disabled={loading} className="btn-danger">
            {loading ? 'Cancelling…' : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── BookingDetailPage ─── */
const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError]           = useState('');

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

  if (loading) return (
    <main className="page-container max-w-2xl">
      <div className="space-y-4">
        <div className="card animate-pulse space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          {[1,2,3,4].map(i => <div key={i} className="h-4 bg-gray-100 rounded w-full" />)}
        </div>
        <div className="card animate-pulse h-48" />
      </div>
    </main>
  );

  if (error || !booking) return (
    <main className="page-container max-w-2xl">
      <div className="card text-center py-12">
        <p className="text-4xl mb-3">❌</p>
        <p className="text-red-600 text-sm">{error || 'Booking not found.'}</p>
        <Link to="/farmer/requests" className="btn-secondary mt-4 inline-flex">← Back</Link>
      </div>
    </main>
  );

  const canCancel = ['pending', 'confirmed'].includes(booking.status);
  const vehicle   = booking.vehicle;
  const req       = booking.transport_request;

  return (
    <main className="page-container">
      <div className="max-w-2xl mx-auto space-y-5">
        <button
          onClick={() => navigate('/farmer/requests')}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to My Requests
        </button>

        {/* ── Booking card ── */}
        <div className="card">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Booking #{booking.id}</h1>
              {req && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {req.pickup_location} ➔ {req.destination}
                </p>
              )}
            </div>
            <StatusBadge status={booking.status} />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {vehicle && (
              <>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Transporter</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{vehicle.user?.name ?? '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Vehicle</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{vehicle.model} ({vehicle.vehicle_type})</p>
                </div>
              </>
            )}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400">Booked Weight</p>
              <p className="font-semibold text-gray-800 mt-0.5">{booking.booked_weight_kg} kg</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-600">Total Cost</p>
              <p className="text-xl font-bold text-green-700 mt-0.5">₹{Number(booking.total_cost).toFixed(2)}</p>
            </div>
            {req && (
              <>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Produce</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{req.produce_type}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Required Date</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{req.required_date}</p>
                </div>
              </>
            )}
          </div>

          {booking.cancellation_reason && (
            <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <p className="text-xs font-semibold text-red-700">Cancellation Reason</p>
              <p className="text-sm text-red-600 mt-0.5">{booking.cancellation_reason}</p>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-gray-100">
            {canCancel ? (
              <button onClick={() => setShowDialog(true)} className="btn-danger">
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

        {/* ── Payment Status Section ── */}
        <div className="card">
          <h2 className="text-base font-bold text-gray-800 mb-4">💳 Payment Status</h2>
          {booking.payment ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  booking.payment.status === 'paid' ? 'bg-green-100 text-green-700' :
                  booking.payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {booking.payment.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-500">Amount</span>
                <span className="font-semibold text-gray-800">₹{Number(booking.payment.amount).toFixed(2)}</span>
              </div>
              {booking.payment.status === 'paid' && (
                <>
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500">Payment ID</span>
                    <span className="font-mono text-xs text-gray-600">{booking.payment.razorpay_payment_id}</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500">Paid At</span>
                    <span className="text-gray-800">{new Date(booking.payment.paid_at).toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
              No payment record found for this booking.
            </div>
          )}
        </div>

        {/* ── Timeline card ── */}
        <div className="card">
          <h2 className="text-base font-bold text-gray-800 mb-5">📍 Tracking Timeline</h2>
          <BookingTimeline updates={booking.tracking_updates ?? []} />
        </div>
      </div>

      {showDialog && (
        <CancelDialog
          onClose={() => setShowDialog(false)}
          onConfirm={handleCancel}
          loading={cancelLoading}
        />
      )}
    </main>
  );
};

export default BookingDetailPage;
