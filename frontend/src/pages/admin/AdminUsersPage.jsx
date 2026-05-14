import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';

// Simple debounce utility
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [roleFilter, setRoleFilter] = useState(''); // '' (all), 'farmer', 'transporter'

  // Suspension confirmation state
  const [suspendConfirm, setSuspendConfirm] = useState(null); // stores user object

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: {
          page,
          search: debouncedSearch,
          role: roleFilter
        }
      });
      setUsers(res.data.data);
      setTotalPages(res.data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter]);

  const toggleVerify = async (user) => {
    try {
      const res = await api.put(`/admin/users/${user.id}`, { is_verified: !user.is_verified });
      setUsers(users.map(u => u.id === user.id ? { ...u, is_verified: res.data.user.is_verified } : u));
    } catch (err) {
      alert('Failed to update user.');
    }
  };

  const handleSuspendConfirm = async () => {
    if (!suspendConfirm) return;
    try {
      const res = await api.put(`/admin/users/${suspendConfirm.id}`, { is_suspended: !suspendConfirm.is_suspended });
      setUsers(users.map(u => u.id === suspendConfirm.id ? { ...u, is_suspended: res.data.user.is_suspended } : u));
      setSuspendConfirm(null);
    } catch (err) {
      alert('Failed to update user.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
        <p className="text-sm text-gray-500 mt-1">View, verify, and suspend platform users.</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['', 'farmer', 'transporter'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                roleFilter === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {r === '' ? 'All Users' : r + 's'}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium text-center">Verified</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium text-center">Stats</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-gray-400">Loading...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-gray-400">No users found.</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className={`hover:bg-gray-50 ${u.is_suspended ? 'bg-red-50/30' : ''}`}>
                    <td className="px-5 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-5 py-3">
                      <div className="text-xs text-gray-600">{u.email}</div>
                      <div className="text-xs text-gray-500">{u.phone || '—'}</div>
                    </td>
                    <td className="px-5 py-3 capitalize">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        u.role === 'farmer' ? 'bg-green-100 text-green-700' : 
                        u.role === 'transporter' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {u.is_verified ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 text-green-600 rounded-full text-xs">✓</span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-100 text-gray-400 rounded-full text-xs">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-center text-gray-600 text-xs">
                      {u.role === 'farmer' ? `${u.bookings_count} Bookings` : 
                       u.role === 'transporter' ? `${u.vehicles_count} Vehicles` : '—'}
                    </td>
                    <td className="px-5 py-3 text-right space-x-2">
                      <button 
                        onClick={() => toggleVerify(u)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          u.is_verified ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {u.is_verified ? 'Verified ✓' : 'Verify'}
                      </button>
                      <button 
                        onClick={() => {
                          if (!u.is_suspended) {
                            setSuspendConfirm(u);
                          } else {
                            // instantly unsuspend without confirmation
                            api.put(`/admin/users/${u.id}`, { is_suspended: false })
                              .then(res => setUsers(users.map(user => user.id === u.id ? { ...user, is_suspended: false } : user)));
                          }
                        }}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          u.is_suspended ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {u.is_suspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
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

      {/* Suspend Confirmation Dialog */}
      {suspendConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Suspend User</h2>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to suspend <span className="font-bold">{suspendConfirm.name}</span>? They will be immediately logged out and unable to access the platform.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setSuspendConfirm(null)} 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSuspendConfirm} 
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Yes, Suspend
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
