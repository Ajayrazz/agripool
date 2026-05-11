import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';

const LoadingState = () => (
  <div className="space-y-3">
    {[1, 2, 3].map(i => (
      <div key={i} className="card animate-pulse">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="h-3 w-32 bg-gray-100 rounded" />
          </div>
          <div className="h-6 w-20 bg-gray-100 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = () => (
  <div className="card flex flex-col items-center py-16 text-center gap-3">
    <span className="text-5xl">📋</span>
    <h3 className="text-base font-semibold text-gray-700">No requests yet</h3>
    <p className="text-sm text-gray-400">Post your first transport request to get started.</p>
    <Link to="/farmer/requests/new" className="btn-primary mt-2">+ Post Request</Link>
  </div>
);

const MyRequestsPage = () => {
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
    <main className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Transport Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage your cargo requests</p>
        </div>
        <Link to="/farmer/requests/new" className="btn-primary">
          + New Request
        </Link>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex gap-2">
          ⚠️ {error}
        </div>
      )}

      {loading ? <LoadingState /> : requests.length === 0 ? <EmptyState /> : (
        <div className="space-y-3">
          {requests.map(req => (
            <div key={req.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {req.pickup_location}
                    </h3>
                    <span className="text-gray-400 text-xs">➔</span>
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {req.destination}
                    </h3>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>🌾 {req.produce_type}</span>
                    <span>⚖️ {req.cargo_weight_kg} kg</span>
                    <span>📅 {req.required_date}</span>
                  </div>
                </div>
                <StatusBadge status={req.status} />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Link
                  to={`/farmer/requests/${req.id}`}
                  className="btn-secondary text-xs px-3 py-1.5"
                >
                  View Details
                </Link>
                {req.status === 'open' && (
                  <Link
                    to={`/farmer/requests/${req.id}/matches`}
                    className="btn-primary text-xs px-3 py-1.5"
                  >
                    🔍 View Matches
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default MyRequestsPage;
