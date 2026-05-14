import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const [toast, setToast]       = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    api.get('/farmer/bookings')
      .then(res => setBookings(res.data.data ?? []))
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePayNow = async (e, bookingId) => {
    e.preventDefault(); // Prevent link navigation
    try {
      const res = await api.post('/farmer/payments/create-order', { booking_id: bookingId });
      const data = res.data;
      
      const options = {
        key: data.key_id,
        amount: data.amount_paise,
        currency: 'INR',
        name: 'AgriPool',
        description: `Booking #${data.booking_id} — Agricultural Transport`,
        image: '/logo.png',
        order_id: data.razorpay_order_id,
        prefill: {
          name: data.farmer_name,
          email: data.farmer_email,
          contact: data.farmer_phone
        },
        theme: { color: '#16a34a' },
        handler: async function(response) {
          await verifyPayment(response, bookingId);
        }
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
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature
      });
      showToast('✅ Payment successful! Booking confirmed.', 'success');
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? {...b, status: 'confirmed'} : b 
      ));
    } catch (err) {
      showToast('❌ Payment verification failed. Contact support.', 'error');
    }
  };

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

      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white text-sm z-50 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

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
            <div key={b.id} className="card hover:shadow-md transition-shadow">
              <Link to={`/farmer/bookings/${b.id}`} className="block">
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
              {b.status === 'pending' && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={(e) => handlePayNow(e, b.id)} 
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-1.5 px-4 rounded shadow-sm text-sm transition-colors flex items-center gap-2"
                  >
                    💳 Pay Now
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

export default MyBookingsPage;
