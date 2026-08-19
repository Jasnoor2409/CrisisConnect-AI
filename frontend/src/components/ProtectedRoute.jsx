import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * ProtectedRoute component
 *
 * Wraps routes that require authentication.
 * Displays a loading state while authentication is being initialized/verified.
 * Redirects unauthenticated users to /login.
 * Optionally validates allowed user roles for role-gated routes.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // 1. Authentication initialization state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-[var(--color-bg-border)]"></div>
          <div className="absolute inset-0 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Verifying security credentials...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated check
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Role authorization check (if allowedRoles specified)
  if (allowedRoles && allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}
