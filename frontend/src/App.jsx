import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { Component } from 'react';
import { useSelector } from 'react-redux';
import Navbar from './components/Shared/Navbar';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { this.setState({ error, errorInfo }); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 mt-20 mx-auto max-w-4xl bg-black/60 border border-red-500/40 rounded-2xl text-red-400">
          <h2 className="text-xl font-bold mb-4">UI Render Crash Detected</h2>
          <pre className="text-xs overflow-auto">{this.state.error && this.state.error.toString()}</pre>
          <pre className="text-xs overflow-auto mt-2 opacity-70">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Wraps layout so Navbar is hidden on the login page
import VehicleListings from './components/Vehicles/VehicleListings';
import VehicleDetails from './components/Vehicles/VehicleDetails';
import MultiStepListing from './components/Vehicles/MultiStepListing';
import BookingFlow from './components/Vehicles/BookingFlow';
import DealerProfile from './components/Vehicles/DealerProfile';
import UserDashboard from './components/Dashboard/UserDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import PrivateRoute from './components/Shared/Routes/PrivateRoute';
import RoleRoute from './components/Shared/Routes/RoleRoute';

// Wraps layout so Navbar is hidden on the login page
const AppLayout = () => {
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-primary)] transition-colors duration-300 relative">
      {/* Ambient liquid orbs — site-wide background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] liquid-bg rounded-full opacity-[0.07] liquid-blob" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[35vw] h-[35vw] liquid-bg rounded-full opacity-[0.06] liquid-blob" style={{ animationDelay: '-5s' }} />
        <div className="absolute top-[40%] right-[10%] w-[20vw] h-[20vw] liquid-bg rounded-full opacity-[0.05] liquid-blob" style={{ animationDelay: '-2s' }} />
      </div>
      {!isLoginPage && userInfo && <Navbar />}
      <main className={`relative z-10 ${isLoginPage ? '' : 'container mx-auto px-4 pb-12'}`}>
        <ErrorBoundary>
          <Routes>
            {/* Public - Login is the entry point */}
            <Route
              path="/login"
              element={userInfo ? <Navigate to="/rent" replace /> : <AuthModal />}
            />

            {/* Default redirect: unauthenticated → login, authenticated → rent */}
            <Route
              path="/"
              element={userInfo ? <Navigate to="/rent" replace /> : <Navigate to="/login" replace />}
            />

            {/* Protected routes (require login) */}
            <Route element={<PrivateRoute />}>
              <Route path="/rent" element={<VehicleListings />} />
              <Route path="/buy" element={<VehicleListings />} />
              <Route path="/buy/used" element={<VehicleListings />} />
              <Route path="/buy/new" element={<VehicleListings />} />
              <Route path="/vehicles/:mode/:id" element={<VehicleDetails />} />
              <Route path="/dealer/:id" element={<DealerProfile />} />
              <Route path="/book/:id" element={<BookingFlow />} />
              <Route path="/sell" element={<MultiStepListing />} />
              <Route path="/dashboard" element={<UserDashboard />} />
            </Route>

            {/* Admin-only routes */}
            <Route element={<RoleRoute roles={['Admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
