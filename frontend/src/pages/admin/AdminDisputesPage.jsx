import React, { useState, useEffect } from 'react';
import api from '../../api';

// Modal component for resolving dispute
const ResolveModal = ({ dispute, onClose, onResolved }) => {
  const [resolution, setResolution] = useState('');
  const [action, setAction] = useState('no_action');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolution.trim()) return alert('Please enter a resolution note.');
    
    setLoading(true);
    try {
      const res = await api.put(`/admin/disputes/${dispute.booking.id}/resolve`, {
        resolution,
        action
      });
      onResolved(res.data.booking);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve dispute.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Resolve Dispute #{dispute.booking.id}</h2>
        <p className="text-sm text-gray-500 mb-6">Determine the outcome of this cancelled booking.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Resolution Note</label>
            <textarea
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-24 resize-y"
              placeholder="Explain the decision..."
              value={resolution}
              onChange={e => setResolution(e.target.value)}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Action Required</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="radio" name="action" value="no_action" checked={action === 'no_action'} onChange={() => setAction('no_action')} className="text-green-600 focus:ring-green-500" />
                <span className="text-sm font-medium text-gray-800">No Action</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="radio" name="action" value="refund_farmer" checked={action === 'refund_farmer'} onChange={() => setAction('refund_farmer')} className="text-green-600 focus:ring-green-500" />
                <div>
                  <div className="text-sm font-medium text-gray-800">Refund Farmer</div>
                  <div className="text-xs text-gray-500">Updates payment status to 'refunded'.</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="radio" name="action" value="compensate_transporter" checked={action === 'compensate_transporter'} onChange={() => setAction('compensate_transporter')} className="text-green-600 focus:ring-green-500" />
                <div>
                  <div className="text-sm font-medium text-gray-800">Compensate Transporter</div>
                  <div className="text-xs text-gray-500">Keep payment and manually payout transporter.</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary px-5 py-2 text-sm">
              {loading ? 'Submitting...' : 'Submit Resolution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminDisputesPage = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDispute, setActiveDispute] = useState(null);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/disputes');
      setDisputes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolved = (updatedBooking) => {
    setDisputes(prev => prev.map(d => 
      d.booking.id === updatedBooking.id 
        ? { ...d, booking: updatedBooking } 
        : d
    ));
    setActiveDispute(null);
  };

  if (loading) return <div className="text-gray-500 animate-pulse">Loading disputes...</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Disputes</h1>
        <p className="text-sm text-gray-500 mt-1">Review and resolve cancelled bookings.</p>
      </div>

      {disputes.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100">
          <span className="text-4xl">✅</span>
          <h3 className="text-lg font-bold text-gray-800 mt-3">No active disputes</h3>
          <p className="text-sm text-gray-500 mt-1">All clear! There are no cancelled bookings awaiting review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {disputes.map((d) => {
            const b = d.booking;
            const isResolved = !!b.dispute_resolution;

            return (
              <div key={b.id} className={`bg-white rounded-xl shadow-sm border ${isResolved ? 'border-green-200' : 'border-gray-200 border-l-4 border-l-amber-400'} p-5 flex flex-col`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Booking #{b.id}</span>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mt-0.5">₹{Number(b.total_cost).toFixed(2)}</h3>
                  </div>
                  {isResolved ? (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      ✓ Resolved
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      Needs Review
                    </span>
                  )}
                </div>

                <div className="space-y-3 flex-1">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Farmer</p>
                      <p className="font-medium text-gray-800">{d.farmer_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Transporter</p>
                      <p className="font-medium text-gray-800">{d.transporter_name}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500 text-xs">Vehicle</p>
                      <p className="font-medium text-gray-800">{d.vehicle}</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50/50 border border-yellow-100 p-3 rounded-lg mt-3">
                    <p className="text-xs font-bold text-yellow-800 mb-1">Reason for Cancellation</p>
                    <p className="text-sm text-yellow-700 italic">"{d.cancellation_reason}"</p>
                  </div>

                  {isResolved && (
                    <div className="bg-green-50/50 border border-green-100 p-3 rounded-lg mt-3">
                      <p className="text-xs font-bold text-green-800 mb-1">Resolution Decision</p>
                      <p className="text-sm text-green-700">{b.dispute_resolution}</p>
                    </div>
                  )}
                </div>

                {!isResolved && (
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => setActiveDispute(d)}
                      className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 rounded-lg text-sm transition-colors"
                    >
                      Resolve Dispute
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeDispute && (
        <ResolveModal 
          dispute={activeDispute} 
          onClose={() => setActiveDispute(null)} 
          onResolved={handleResolved} 
        />
      )}
    </div>
  );
};

export default AdminDisputesPage;
