import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Public pages
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Shared
import Dashboard from './pages/Dashboard';

// Farmer pages
import MyRequestsPage    from './pages/farmer/MyRequestsPage';
import NewRequestPage    from './pages/farmer/NewRequestPage';
import RequestDetailPage from './pages/farmer/RequestDetailPage';
import MatchResultsPage  from './pages/farmer/MatchResultsPage';
import MyBookingsPage    from './pages/farmer/MyBookingsPage';
import BookingDetailPage from './pages/farmer/BookingDetailPage';

// Transporter pages
import MyFleetPage          from './pages/transporter/MyFleetPage';
import AddVehiclePage       from './pages/transporter/AddVehiclePage';
import ScheduleRoutePage    from './pages/transporter/ScheduleRoutePage';
import IncomingBookingsPage from './pages/transporter/IncomingBookingsPage';

// Admin pages
import AdminLayout        from './components/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage     from './pages/admin/AdminUsersPage';
import AdminBookingsPage  from './pages/admin/AdminBookingsPage';
import AdminDisputesPage  from './pages/admin/AdminDisputesPage';

/* ── Layout that wraps all protected pages with the Navbar ── */
const AppLayout = () => (
  <>
    <Navbar />
    {/* pt-16 clears the fixed-height Navbar */}
    <div className="pt-16">
      <ProtectedRoute />
    </div>
  </>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Routes — wrapped in AdminLayout */}
          <Route element={<AdminLayout />}>
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin"          element={<AdminDashboardPage />} />
              <Route path="/admin/users"    element={<AdminUsersPage />} />
              <Route path="/admin/bookings" element={<AdminBookingsPage />} />
              <Route path="/admin/disputes" element={<AdminDisputesPage />} />
            </Route>
          </Route>

          {/* Protected — wrapped in Navbar */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />

            {/* Farmer Routes */}
            <Route element={<ProtectedRoute allowedRoles={['farmer']} />}>
              <Route path="/farmer/requests"                          element={<MyRequestsPage />} />
              <Route path="/farmer/requests/new"                      element={<NewRequestPage />} />
              <Route path="/farmer/requests/:id"                      element={<RequestDetailPage />} />
              <Route path="/farmer/requests/:id/matches"              element={<MatchResultsPage />} />
              <Route path="/farmer/bookings"                          element={<MyBookingsPage />} />
              <Route path="/farmer/bookings/:id"                      element={<BookingDetailPage />} />
            </Route>

            {/* Transporter Routes */}
            <Route element={<ProtectedRoute allowedRoles={['transporter']} />}>
              <Route path="/transporter/fleet"                        element={<MyFleetPage />} />
              <Route path="/transporter/fleet/new"                    element={<AddVehiclePage />} />
              <Route path="/transporter/fleet/:vehicleId/routes/new"  element={<ScheduleRoutePage />} />
              <Route path="/transporter/bookings"                     element={<IncomingBookingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
