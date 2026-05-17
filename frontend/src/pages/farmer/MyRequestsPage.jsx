import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';

/* ── Skeleton ── */
const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse space-y-3">
        <div className="flex justify-between items-start">
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="h-6 w-20 bg-gray-100 rounded-full" />
        </div>
        <div className="h-3 w-56 bg-gray-100 rounded" />
        <div className="h-3 w-32 bg-gray-100 rounded" />
      </div>
    ))}
  </div>
);

const MyRequestsPage = () => {
  /* ── All state & API logic unchanged ── */
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests');
      setRequests(res.data.data);
    } catch {
      setError('Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        <PageHeader
          title="My Requests"
          subtitle="Track and manage your cargo transport requests"
          action={
            <Link
              to="/farmer/requests/new"
              className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:shadow-md"
            >
              + New Request
            </Link>
          }
        />

        {error && (
          <div className="mb-5 flex items-start gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <span>⚠️</span> {error}
          </div>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <EmptyState
              icon="📋"
              title="No requests yet"
              message="Post your first transport request to get started."
              action={
                <Link
                  to="/farmer/requests/new"
                  className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
                >
                  + Post Request
                </Link>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map(req => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all"
              >
                {/* Top row: produce type + status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-gray-900">{req.produce_type}</h3>
                  <StatusBadge status={req.status} />
                </div>

                {/* Route */}
                <div className="flex items-center gap-2 text-sm mb-3">
                  <span className="text-gray-700 font-medium truncate">{req.pickup_location}</span>
                  <span className="text-green-500 shrink-0">→</span>
                  <span className="text-gray-700 font-medium truncate">{req.destination}</span>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
                  <span>📅 {req.required_date}</span>
                  <span>⚖️ {req.cargo_weight_kg} kg</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <Link
                    to={`/farmer/requests/${req.id}`}
                    className="text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                  >
                    View Details
                  </Link>
                  {req.status === 'open' && (
                    <Link
                      to={`/farmer/requests/${req.id}/matches`}
                      className="text-xs font-semibold text-green-700 hover:text-green-800 px-3 py-1.5 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-all"
                    >
                      View Matches →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequestsPage;
