import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import StatCard from '../components/ui/StatCard';

/* ─── Skeleton ─── */
const Skeleton = ({ className = '' }) => (
  <div className={`bg-gray-200 animate-pulse rounded-xl ${className}`} />
);

/* ─── Quick Action Card ─── */
const QuickCard = ({ icon, iconBg, title, desc, to, linkLabel, linkColor = 'green' }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all flex flex-col gap-3">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${iconBg}`}>
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
    </div>
    <Link
      to={to}
      className={`self-start mt-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
        linkColor === 'blue'
          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md'
      }`}
    >
      {linkLabel}
    </Link>
  </div>
);

/* ═══════════════════════════════════
   Farmer Dashboard
═══════════════════════════════════ */
const FarmerDashboard = ({ user }) => {
  /* ── All state & API logic unchanged ── */
  const [stats, setStats] = useState({ openRequests: 0, activeBookings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [reqRes, bookRes] = await Promise.all([
          api.get('/requests'),
          api.get('/farmer/bookings'),
        ]);
        const openRequests   = reqRes.data.data.filter(r => r.status === 'open').length;
        const activeBookings = bookRes.data.data.filter(
          b => ['pending', 'confirmed', 'in_transit'].includes(b.status)
        ).length;
        setStats({ openRequests, activeBookings });
      } catch {
        /* silently fail */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Welcome banner */}
        <div className="relative bg-gradient-to-r from-green-600 to-emerald-500 rounded-3xl p-8 text-white mb-8 overflow-hidden">
          {/* Decorative circle */}
          <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full bg-white/10" />
          <div className="absolute -right-4 top-16 w-32 h-32 rounded-full bg-white/5" />

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Good day,</p>
              <h1 className="text-2xl font-bold mt-0.5">Welcome back, {user?.name} 👋</h1>
              <p className="text-green-100 text-sm mt-1">Manage your transport requests and bookings.</p>
            </div>
            <span className="text-7xl opacity-30 hidden sm:block">🚜</span>
          </div>
        </div>

        {/* Stats row */}
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="🗂️" label="Open Requests"   value={stats.openRequests}   color="green"  loading={loading} />
          <StatCard icon="📦" label="Active Bookings" value={stats.activeBookings} color="blue"   loading={loading} />
          <StatCard icon="✅" label="Completed Trips" value={0}                    color="green"  loading={loading} />
          <StatCard icon="💰" label="Total Saved"     value="₹0"                  color="amber"  loading={loading} />
        </div>

        {/* Quick Actions */}
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickCard
            icon="🌾"
            iconBg="bg-green-50"
            title="Post Transport Request"
            desc="Let transporters know you need cargo delivery."
            to="/farmer/requests/new"
            linkLabel="+ Post Request"
            linkColor="green"
          />
          <QuickCard
            icon="🔍"
            iconBg="bg-blue-50"
            title="View My Requests"
            desc="Track the status of all your transport requests."
            to="/farmer/requests"
            linkLabel="View Requests"
            linkColor="blue"
          />
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════
   Transporter Dashboard
═══════════════════════════════════ */
const TransporterDashboard = ({ user }) => {
  /* ── All state & API logic unchanged ── */
  const [stats, setStats] = useState({ vehicleCount: 0, pendingBookings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [fleetRes, bookRes] = await Promise.all([
          api.get('/transporter/vehicles'),
          api.get('/transporter/bookings/incoming'),
        ]);
        const vehicleCount    = fleetRes.data.data?.length ?? fleetRes.data.length ?? 0;
        const pendingBookings = bookRes.data.data?.filter(b => b.status === 'pending').length ?? 0;
        setStats({ vehicleCount, pendingBookings });
      } catch {
        /* silently fail */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Welcome banner */}
        <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-8 text-white mb-8 overflow-hidden">
          <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full bg-white/10" />
          <div className="absolute -right-4 top-16 w-32 h-32 rounded-full bg-white/5" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Welcome back,</p>
              <h1 className="text-2xl font-bold mt-0.5">{user?.name} 🚛</h1>
              <p className="text-orange-100 text-sm mt-1">Manage your fleet and incoming bookings.</p>
            </div>
            <span className="text-7xl opacity-30 hidden sm:block">🚛</span>
          </div>
        </div>

        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Fleet Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="🚚" label="Vehicles in Fleet"  value={stats.vehicleCount}   color="amber"  loading={loading} />
          <StatCard icon="⏳" label="Pending Bookings"   value={stats.pendingBookings} color="blue"   loading={loading} />
          <StatCard icon="✅" label="Completed Trips"    value={0}                     color="green"  loading={loading} />
          <StatCard icon="💰" label="Revenue"            value="₹0"                   color="purple" loading={loading} />
        </div>

        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickCard
            icon="🚛"
            iconBg="bg-amber-50"
            title="Add a Vehicle"
            desc="Register a new truck or pickup to your fleet."
            to="/transporter/fleet/new"
            linkLabel="+ Add Vehicle"
            linkColor="green"
          />
          <QuickCard
            icon="📋"
            iconBg="bg-blue-50"
            title="Incoming Bookings"
            desc="Review and respond to farmer booking requests."
            to="/transporter/bookings"
            linkLabel="View Bookings"
            linkColor="blue"
          />
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════
   Dashboard (role switcher) — unchanged
═══════════════════════════════════ */
const Dashboard = () => {
  const { user } = useAuth();

  return (
    <>
      {user?.role === 'farmer'      && <FarmerDashboard      user={user} />}
      {user?.role === 'transporter' && <TransporterDashboard user={user} />}
      {!user?.role && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-4xl">🔐</p>
            <p className="mt-3 text-sm text-gray-400">Loading your dashboard…</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
