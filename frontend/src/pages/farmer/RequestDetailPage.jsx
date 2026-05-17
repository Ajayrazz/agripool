import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/ui/PageHeader';

const RequestDetailPage = () => {
  /* ── All state & API logic unchanged ── */
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError]         = useState('');

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

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-gray-100 rounded w-full" />)}
        </div>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error || !request) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center max-w-sm w-full">
        <p className="text-4xl mb-3">❌</p>
        <p className="text-red-600 text-sm">{error || 'Request not found.'}</p>
        <Link
          to="/farmer/requests"
          className="mt-4 inline-flex items-center px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-300 transition-all"
        >
          ← Back
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <Link
          to="/farmer/requests"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          ← Back to My Requests
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Request #{request.id}</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {request.pickup_location}
                <span className="text-green-500 mx-1.5">→</span>
                {request.destination}
              </p>
            </div>
            <StatusBadge status={request.status} />
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['🌾 Produce',       request.produce_type],
              ['⚖️ Weight',        `${request.cargo_weight_kg} kg`],
              ['📅 Required By',   request.required_date],
              ['📍 Pickup',        request.pickup_location],
              ['🏁 Destination',   request.destination],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-gray-800 font-semibold mt-0.5 truncate">{value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-gray-100">
            {request.status === 'open' && (
              <Link
                to={`/farmer/requests/${id}/matches`}
                className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:shadow-md"
              >
                🔍 View Matches
              </Link>
            )}
            {request.status === 'open' && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 text-sm font-semibold transition-all disabled:opacity-50"
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
    </div>
  );
};

export default RequestDetailPage;
