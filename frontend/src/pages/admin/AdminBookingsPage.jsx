import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';
import BookingTimeline from '../../components/BookingTimeline';

// Simple debounce utility
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Expanded row state
  const [expandedRowId, setExpandedRowId] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/bookings', {
        params: {
          page,
          search: debouncedSearch,
          status,
          date_from: dateFrom,
          date_to: dateTo
        }
      });
      setBookings(res.data.data);
      setTotalPages(res.data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, dateFrom, dateTo]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, dateFrom, dateTo]);

  const toggleRow = (id) => {
    setExpandedRowId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookings Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor all transport bookings across the platform.</p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search farmer or vehicle..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-600"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Farmer</th>
                <th className="px-5 py-3 font-medium">Transporter & Vehicle</th>
                <th className="px-5 py-3 font-medium">Details</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center text-gray-400">Loading...</td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center text-gray-400">No bookings found matching filters.</td>
                </tr>
              ) : (
                bookings.map(b => (
                  <React.Fragment key={b.id}>
                    <tr 
                      onClick={() => toggleRow(b.id)}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${expandedRowId === b.id ? 'bg-green-50/50' : ''}`}
                    >
                      <td className="px-5 py-4 font-medium text-gray-900">#{b.id}</td>
                      <td className="px-5 py-4">
                        <div className="text-gray-900 font-medium">{b.farmer?.name}</div>
                        <div className="text-xs text-gray-500">{b.farmer?.phone || '—'}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-gray-900 font-medium">{b.vehicle?.user?.name}</div>
                        <div className="text-xs text-gray-500">{b.vehicle?.model} · {b.vehicle?.registration_number}</div>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-600">
                        {b.booked_weight_kg} kg
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-900">
                        ₹{Number(b.total_cost).toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          !b.payment ? 'bg-gray-100 text-gray-600' :
                          b.payment.status === 'paid' ? 'bg-green-100 text-green-700' :
                          b.payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                          b.payment.status === 'refunded' ? 'bg-purple-100 text-purple-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {b.payment ? b.payment.status.toUpperCase() : 'UNPAID'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500">
                        {new Date(b.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                    {expandedRowId === b.id && (
                      <tr className="bg-gray-50/50 border-b-2 border-b-green-100">
                        <td colSpan="8" className="px-8 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Tracking Timeline */}
                            <div>
                              <h3 className="text-sm font-bold text-gray-800 mb-4">Tracking Timeline</h3>
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <BookingTimeline updates={b.tracking_updates || []} />
                                {(!b.tracking_updates || b.tracking_updates.length === 0) && (
                                  <p className="text-xs text-gray-400">No tracking updates yet.</p>
                                )}
                              </div>
                            </div>

                            {/* Payment Details */}
                            <div>
                              <h3 className="text-sm font-bold text-gray-800 mb-4">Payment Details</h3>
                              {b.payment ? (
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-3 text-sm">
                                  <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-500">Razorpay Order ID</span>
                                    <span className="font-mono text-xs">{b.payment.razorpay_order_id}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-500">Payment ID</span>
                                    <span className="font-mono text-xs">{b.payment.razorpay_payment_id || '—'}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-500">Status</span>
                                    <span className="font-medium text-gray-900 capitalize">{b.payment.status}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Paid At</span>
                                    <span className="text-gray-800">
                                      {b.payment.paid_at ? new Date(b.payment.paid_at).toLocaleString() : '—'}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-sm text-gray-500 text-center">
                                  No payment record found.
                                </div>
                              )}
                              
                              {b.cancellation_reason && (
                                <div className="mt-4 bg-red-50 p-4 rounded-lg shadow-sm border border-red-100">
                                  <h4 className="text-xs font-bold text-red-800 mb-1">Cancellation Reason</h4>
                                  <p className="text-sm text-red-600">{b.cancellation_reason}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookingsPage;
