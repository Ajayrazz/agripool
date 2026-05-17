import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';

/* ── Filter tabs ── */
const TABS = ['All', 'Pending', 'Confirmed', 'In Transit', 'Delivered'];
const TAB_STATUS = {
  All: null,
  Pending: 'pending',
  Confirmed: 'confirmed',
  'In Transit': 'in_transit',
  Delivered: 'delivered',
};

const MyBookingsPage = () => {
  /* ── All state & handlers unchanged ── */
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [toast, setToast]       = useState(null);
  const [activeTab, setActiveTab] = useState('All');

  const fetchBookings = () => {
    setLoading(true);
    api.get('/farmer/bookings')
      .then(res => setBookings(res.data.data ?? []))
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePayNow = async (e, bookingId) => {
    e.preventDefault();
    try {
      const res  = await api.post('/farmer/payments/create-order', { booking_id: bookingId });
      const data = res.data;
      const options = {
        key: data.key_id,
        amount: data.amount_paise,
        currency: 'INR',
        name: 'AgriPool',
        description: `Booking #${data.booking_id} — Agricultural Transport`,
        image: '/logo.png',
        order_id: data.razorpay_order_id,
        prefill: { name: data.farmer_name, email: data.farmer_email, contact: data.farmer_phone },
        theme: { color: '#16a34a' },
        handler: async function(response) { await verifyPayment(response, bookingId); }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function(response) {
        showToast('Payment failed: ' + response.error.description, 'error');
      });
      rzp.open();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to initialize payment. Try again.', 'error');
    }
  };

  const verifyPayment = async (response, bookingId) => {
    try {
      await api.post('/farmer/payments/verify', {
        razorpay_order_id:   response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature:  response.razorpay_signature,
      });
      showToast('✅ Payment successful! Booking confirmed.', 'success');
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b));
    } catch {
      showToast('❌ Payment verification failed. Contact support.', 'error');
    }
  };

  /* Filtered bookings */
  const filterStatus = TAB_STATUS[activeTab];
  const filtered = filterStatus
    ? bookings.filter(b => b.status === filterStatus)
    : bookings;

  /* ── Loading skeleton ── */
  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse space-y-3">
            <div className="flex justify-between">
              <div className="h-5 w-40 bg-gray-200 rounded" />
              <div className="h-5 w-24 bg-gray-100 rounded-full" />
            </div>
            <div className="h-3 w-56 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-lg text-white text-sm z-50 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader
          title="My Bookings"
          subtitle="Track all your transport bookings"
        />

        {error && (
          <div className="mb-5 flex items-start gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeTab === tab
                  ? 'bg-green-600 text-white border-green-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && !error ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <EmptyState
              icon="📦"
              title="No bookings yet"
              message="Post a request and book a transporter to get started."
              action={
                <Link
                  to="/farmer/requests"
                  className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
                >
                  View Requests
                </Link>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map(b => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all"
              >
                {/* Row 1: Booking ID + Status */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-bold text-gray-900">Booking #{b.id}</h3>
                  <StatusBadge status={b.status} />
                </div>

                {/* Row 2: vehicle + route */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span>🚛</span>
                  <span className="font-medium">{b.vehicle?.model ?? 'Vehicle'}</span>
                  {b.transport_request && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="text-gray-500 text-xs truncate">
                        {b.transport_request.pickup_location}
                        <span className="text-green-500 mx-1">→</span>
                        {b.transport_request.destination}
                      </span>
                    </>
                  )}
                </div>

                {/* Row 3: weight + cost */}
                <div className="flex gap-4 text-xs text-gray-500 mb-4">
                  <span>⚖️ {b.booked_weight_kg} kg</span>
                  <span>💰 ₹{Number(b.total_cost).toFixed(2)}</span>
                </div>

                {/* Row 4: action buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  {b.status === 'pending' && (
                    <button
                      onClick={(e) => handlePayNow(e, b.id)}
                      className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                    >
                      💳 Pay Now
                    </button>
                  )}
                  <Link
                    to={`/farmer/bookings/${b.id}`}
                    className="text-xs font-semibold text-green-700 hover:text-green-800 px-3 py-1.5 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-all"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
