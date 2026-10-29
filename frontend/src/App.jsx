/**
 * App.jsx — CrisisConnect AI
 *
 * Root application component. Defines all routes with role-based access control.
 *
 * CHO Lecture 36: React Router — Routes, Route, Navigate, useNavigate, useParams
 * CHO Lecture 35: Context API (AuthProvider wraps all routes)
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';

// ── Page imports ──────────────────────────────────────────────────────────────
import RegisterPage       from './pages/RegisterPage.jsx';
import LoginPage          from './pages/LoginPage.jsx';
import ProfilePage        from './pages/ProfilePage.jsx';
import ReportIncidentPage from './pages/ReportIncidentPage.jsx';
import MyReportsPage      from './pages/MyReportsPage.jsx';
import ResponderDashboard from './pages/ResponderDashboard.jsx';
import AdminDashboard     from './pages/AdminDashboard.jsx';

// ── Role-based Route Guard ────────────────────────────────────────────────────
// Wraps a route that requires a specific role (or array of roles).
// CHO Lecture 36: Protected routes with React Router + Context
function RoleRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(user.role)) {
    // Redirect to appropriate home based on their actual role
    if (user.role === 'admin')     return <Navigate to="/admin"     replace />;
    if (user.role === 'responder') return <Navigate to="/responder" replace />;
    return <Navigate to="/report-incident" replace />;
  }
  return children;
}

// ── Smart Home Redirect ───────────────────────────────────────────────────────
// Sends each role to their default home page after login
function SmartRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin')     return <Navigate to="/admin"     replace />;
  if (user.role === 'responder') return <Navigate to="/responder" replace />;
  return <Navigate to="/report-incident" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen w-full bg-[var(--color-bg-base)] text-[var(--color-text-primary)] flex flex-col font-sans">
          <Navbar />
          <div className="flex-1">
            <Routes>
              {/* ── Smart home redirect based on role ── */}
              <Route path="/" element={<SmartRedirect />} />

              {/* ── Feature 1: Public Registration ── */}
              <Route path="/register" element={<RegisterPage />} />

              {/* ── Feature 2: Public Login (+ CHO Fetch API Demo) ── */}
              <Route path="/login" element={<LoginPage />} />

              {/* ── Feature 4: Protected User Profile & Session ── */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* ── Feature 5 & 6: Incident Reporting + Map Location ── */}
              <Route
                path="/report-incident"
                element={
                  <ProtectedRoute>
                    <ReportIncidentPage />
                  </ProtectedRoute>
                }
              />

              {/* ── Feature 7 & 8: Citizen Incident History + AI Classification ── */}
              <Route
                path="/my-reports"
                element={
                  <ProtectedRoute>
                    <MyReportsPage />
                  </ProtectedRoute>
                }
              />

              {/* ── Feature 11–14 & 17: Responder Dashboard ── */}
              <Route
                path="/responder"
                element={
                  <RoleRoute roles={['responder', 'admin']}>
                    <ResponderDashboard />
                  </RoleRoute>
                }
              />

              {/* ── Feature 16: Admin Dashboard ── */}
              <Route
                path="/admin"
                element={
                  <RoleRoute roles={['admin']}>
                    <AdminDashboard />
                  </RoleRoute>
                }
              />

              {/* ── 404 → smart redirect ── */}
              <Route path="*" element={<SmartRedirect />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
