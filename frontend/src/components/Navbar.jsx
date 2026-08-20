import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper for role badge colors matching Earth & Ember palette
  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'admin':
        return {
          bg: 'rgba(196, 124, 42, 0.15)',
          border: 'rgba(196, 124, 42, 0.4)',
          text: '#e09843',
          label: 'ADMIN',
        };
      case 'responder':
        return {
          bg: 'rgba(90, 122, 74, 0.2)',
          border: 'rgba(90, 122, 74, 0.5)',
          text: '#8a9e78',
          label: 'RESPONDER',
        };
      default:
        return {
          bg: 'rgba(200, 184, 154, 0.15)',
          border: 'rgba(200, 184, 154, 0.3)',
          text: 'var(--color-sand)',
          label: 'CITIZEN',
        };
    }
  };

  const roleStyle = user ? getRoleBadgeStyle(user.role) : null;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-bg-border)] bg-[var(--color-bg-surface)]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={isAuthenticated ? '/report-incident' : '/login'} className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 flex items-center justify-center text-[var(--color-primary)] font-bold transition-all duration-200 group-hover:bg-[var(--color-primary)]/30">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold tracking-wide text-sm sm:text-base text-[var(--color-text-primary)]">
              CrisisConnect <span className="text-[var(--color-primary)] font-bold">AI</span>
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated && user ? (
            <>
              {/* Report Incident Navigation Button */}
              <Link
                to="/report-incident"
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  location.pathname === '/report-incident'
                    ? 'bg-[var(--color-primary)] text-white shadow-sm'
                    : 'bg-[var(--color-primary)]/15 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/25 border border-[var(--color-primary)]/30'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Report Incident</span>
              </Link>

              {/* My Reports Navigation Button */}
              <Link
                to="/my-reports"
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  location.pathname === '/my-reports'
                    ? 'bg-[var(--color-bg-elevated)] text-[var(--color-sand)] border border-[var(--color-sand)]/40 shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] border border-transparent'
                }`}
              >
                <svg className="w-4 h-4 text-[var(--color-sand)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>My Reports</span>
              </Link>

              {/* User Role Badge */}
              <div
                className="hidden sm:flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wider border"
                style={{
                  backgroundColor: roleStyle.bg,
                  borderColor: roleStyle.border,
                  color: roleStyle.text,
                }}
              >
                {roleStyle.label}
              </div>

              {/* Clickable User Name Navigating to /profile */}
              <Link
                to="/profile"
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 border ${
                  location.pathname === '/profile'
                    ? 'bg-[var(--color-bg-elevated)] text-[var(--color-primary)] border-[var(--color-primary)]/50'
                    : 'text-[var(--color-text-primary)] hover:text-[var(--color-primary)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] border-[var(--color-bg-border)] hover:border-[var(--color-primary)]/40'
                }`}
                title="View User Profile"
              >
                <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="truncate max-w-[120px] sm:max-w-[160px] underline-offset-2 hover:underline">
                  {user.name}
                </span>
              </Link>

              {/* Single Navbar Logout Button */}
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/40 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                title="Log out of CrisisConnect"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/login'
                    ? 'text-[var(--color-text-primary)] bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all duration-200 shadow-sm"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
