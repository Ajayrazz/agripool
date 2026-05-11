import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

/* ─── Stat card ─── */
const StatCard = ({ icon, label, value, loading }) => (
  <div className="card flex items-center gap-5">
    <div className="w-14 h-14 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-2xl shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      {loading ? (
        <div className="h-7 w-16 mt-1 bg-gray-100 animate-pulse rounded" />
      ) : (
        <p className="text-3xl font-bold text-gray-800 leading-none mt-0.5">{value}</p>
      )}
    </div>
  </div>
);

/* ─── CTA Card ─── */
const CtaCard = ({ icon, title, description, to, linkLabel }) => (
  <div className="card bg-gradient-to-br from-green-50 to-earth-50 border-green-100 flex flex-col gap-3">
    <div className="text-3xl">{icon}</div>
    <div>
      <h3 className="text-base font-bold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 mt-0.5">{description}</p>
    </div>
    <Link to={to} className="btn-primary self-start mt-auto text-sm">
      {linkLabel}
    </Link>
  </div>
);

/* ─── Loading skeleton ─── */
const Skeleton = ({ className = '' }) => (
  <div className={`bg-gray-100 animate-pulse rounded ${className}`} />
);

/* ═══════════════════════════════════
   Farmer Dashboard
═══════════════════════════════════ */
const FarmerDashboard = ({ user }) => {
  const [stats, setStats] = useState({ openRequests: 0, activeBookings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [reqRes, bookRes] = await Promise.all([
          api.get('/requests'),
          api.get('/farmer/bookings'),
        ]);
        const openRequests  = reqRes.data.data.filter(r => r.status === 'open').length;
        const activeBookings = bookRes.data.data.filter(
          b => ['pending', 'confirmed', 'in_transit'].includes(b.status)
        ).length;
        setStats({ openRequests, activeBookings });
      } catch {
        /* silently fail — stats show 0 */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="card bg-gradient-to-r from-green-700 to-green-600 text-white border-0">
        <p className="text-green-100 text-sm font-medium">Good day,</p>
        <h1 className="text-2xl font-bold mt-0.5">{user?.name} 👋</h1>
        <p className="text-green-100 text-sm mt-1">Here's your farming transport overview.</p>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard icon="📋" label="Open Requests"   value={stats.openRequests}   loading={loading} />
          <StatCard icon="📦" label="Active Bookings" value={stats.activeBookings} loading={loading} />
        </div>
      </div>

      {/* CTAs */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CtaCard
            icon="🌾"
            title="Post Transport Request"
            description="Let transporters know you need cargo delivery."
            to="/farmer/requests/new"
            linkLabel="+ Post Request"
          />
          <CtaCard
            icon="🔍"
            title="Find Transport"
            description="Track the status of all your transport requests."
            to="/farmer/requests"
            linkLabel="View Requests"
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
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="card bg-gradient-to-r from-earth-700 to-earth-600 text-white border-0">
        <p className="text-orange-100 text-sm font-medium">Welcome back,</p>
        <h1 className="text-2xl font-bold mt-0.5">{user?.name} 🚛</h1>
        <p className="text-orange-100 text-sm mt-1">Manage your fleet and incoming bookings.</p>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Fleet Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard icon="🚚" label="Vehicles in Fleet"   value={stats.vehicleCount}    loading={loading} />
          <StatCard icon="⏳" label="Pending Bookings"    value={stats.pendingBookings}  loading={loading} />
        </div>
      </div>

      {/* CTAs */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CtaCard
            icon="🚛"
            title="Add a Vehicle"
            description="Register a new truck or pickup to your fleet."
            to="/transporter/fleet/new"
            linkLabel="+ Add Vehicle"
          />
          <CtaCard
            icon="📋"
            title="Incoming Bookings"
            description="Review and respond to farmer booking requests."
            to="/transporter/bookings"
            linkLabel="View Bookings"
          />
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════
   Dashboard (role switcher)
═══════════════════════════════════ */
const Dashboard = () => {
  const { user } = useAuth();

  return (
    <main className="page-container">
      {user?.role === 'farmer'      && <FarmerDashboard      user={user} />}
      {user?.role === 'transporter' && <TransporterDashboard user={user} />}
      {!user?.role && (
        <div className="card text-center py-16 text-gray-400">
          <p className="text-4xl">🔐</p>
          <p className="mt-3 text-sm">Loading your dashboard…</p>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
