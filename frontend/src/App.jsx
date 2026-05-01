import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import MyRequestsPage from './pages/farmer/MyRequestsPage';
import NewRequestPage from './pages/farmer/NewRequestPage';
import RequestDetailPage from './pages/farmer/RequestDetailPage';
import MatchResultsPage from './pages/farmer/MatchResultsPage';
import MyFleetPage from './pages/transporter/MyFleetPage';
import AddVehiclePage from './pages/transporter/AddVehiclePage';
import ScheduleRoutePage from './pages/transporter/ScheduleRoutePage';
import IncomingBookingsPage from './pages/transporter/IncomingBookingsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/farmer/requests" element={<MyRequestsPage />} />
            <Route path="/farmer/requests/new" element={<NewRequestPage />} />
            <Route path="/farmer/requests/:id" element={<RequestDetailPage />} />
            <Route path="/farmer/requests/:id/matches" element={<MatchResultsPage />} />

            <Route path="/transporter/fleet" element={<MyFleetPage />} />
            <Route path="/transporter/fleet/new" element={<AddVehiclePage />} />
            <Route path="/transporter/fleet/:vehicleId/routes/new" element={<ScheduleRoutePage />} />
            <Route path="/transporter/bookings" element={<IncomingBookingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
