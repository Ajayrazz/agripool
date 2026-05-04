import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';

const RequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => { fetchRequest(); }, [id]);

  const fetchRequest = async () => {
    try {
      const res = await api.get(`/requests/${id}`);
      setRequest(res.data);
    } catch {
      setError('Failed to load request details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    setCancelling(true);
    try {
      await api.delete(`/requests/${id}`);
      navigate('/farmer/requests');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <main className="page-container max-w-2xl">
      <div className="card animate-pulse space-y-4">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-gray-100 rounded w-full" />)}
      </div>
    </main>
  );

  if (error || !request) return (
    <main className="page-container max-w-2xl">
      <div className="card text-center py-12">
        <p className="text-4xl mb-3">❌</p>
        <p className="text-red-600 text-sm">{error || 'Request not found.'}</p>
        <Link to="/farmer/requests" className="btn-secondary mt-4 inline-flex">← Back</Link>
      </div>
    </main>
  );

  return (
    <main className="page-container">
      <div className="max-w-2xl mx-auto">
        <Link to="/farmer/requests" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          ← Back to My Requests
        </Link>

        <div className="card">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Request #{request.id}</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {request.pickup_location} ➔ {request.destination}
              </p>
            </div>
            <StatusBadge status={request.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['🌾 Produce',      request.produce_type],
              ['⚖️ Weight',       `${request.cargo_weight_kg} kg`],
              ['📅 Required By',  request.required_date],
              ['📍 Pickup',       request.pickup_location],
              ['🏁 Destination',  request.destination],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-gray-800 font-semibold mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-gray-100">
            {request.status === 'open' && (
              <Link
                to={`/farmer/requests/${id}/matches`}
                className="btn-primary"
              >
                🔍 View Matches
              </Link>
            )}
            {request.status === 'open' && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="btn-danger"
              >
                {cancelling ? 'Cancelling…' : '❌ Cancel Request'}
              </button>
            )}
            {!['open'].includes(request.status) && (
              <p className="text-sm text-gray-400 italic self-center">
                This request is {request.status} and cannot be modified.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default RequestDetailPage;
