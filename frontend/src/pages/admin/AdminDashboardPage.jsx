import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';

const PIE_COLORS = {
  pending: '#f59e0b',
  confirmed: '#16a34a',
  in_transit: '#3b82f6',
  delivered: '#14b8a6',
  cancelled: '#ef4444'
};

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to load dashboard statistics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500 animate-pulse">Loading dashboard...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!stats) return null;

  const pieData = Object.entries(stats.bookings_by_status).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
    value: value,
    statusKey: key
  })).filter(item => item.value > 0);

  const maxRouteCount = Math.max(...(stats.top_routes.map(r => r.count) || [1]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100 border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-500 font-medium mb-1">Total Farmers</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total_farmers}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-amber-100 border-l-4 border-l-amber-500">
          <p className="text-sm text-gray-500 font-medium mb-1">Total Transporters</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total_transporters}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-purple-100 border-l-4 border-l-purple-500">
          <p className="text-sm text-gray-500 font-medium mb-1">Total Vehicles</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total_vehicles}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-green-100 border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500 font-medium mb-1">Total Bookings</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total_bookings}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-teal-100 border-l-4 border-l-teal-500">
          <p className="text-sm text-gray-500 font-medium mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900">₹{Number(stats.total_revenue).toLocaleString()}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-base font-bold text-gray-800 mb-4">Bookings Last 30 Days</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.bookings_last_30_days} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getDate()}/${d.getMonth()+1}`;
                  }}
                  interval={4} 
                  tick={{fontSize: 12, fill: '#6b7280'}}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Line type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={3} dot={{r: 4, fill: '#16a34a', strokeWidth: 0}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-800 mb-4">Bookings by Status</h2>
          <div className="h-72 w-full flex justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.statusKey] || '#ccc'} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                  <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 lg:col-span-2 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Recent Bookings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-5 py-3 font-medium">Farmer</th>
                  <th className="px-5 py-3 font-medium">Transporter</th>
                  <th className="px-5 py-3 font-medium">Vehicle</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recent_bookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-900 font-medium">#{b.id}</td>
                    <td className="px-5 py-3 text-gray-600">{b.farmer_name}</td>
                    <td className="px-5 py-3 text-gray-600">{b.transporter_name}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{b.vehicle}</td>
                    <td className="px-5 py-3 text-gray-900 font-medium">₹{Number(b.amount).toFixed(2)}</td>
                    <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
                {stats.recent_bookings.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-5 py-8 text-center text-gray-400">No recent bookings found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Routes */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-800 mb-5">Top Routes</h2>
          <div className="space-y-4">
            {stats.top_routes.map((route, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-medium text-gray-700 truncate pr-2">{route.route}</span>
                  <span className="text-xs font-bold text-gray-900">{route.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${Math.max(5, (route.count / maxRouteCount) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {stats.top_routes.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-4">No route data available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
