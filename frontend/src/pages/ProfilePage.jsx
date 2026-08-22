import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getCitizenTest, getResponderTest, getAdminTest } from '../services/authService.js';

export default function ProfilePage() {
  const { user } = useAuth();

  // State for RBAC live test results mapped by endpoint ID
  const [testResults, setTestResults] = useState({});
  const [testingEndpoint, setTestingEndpoint] = useState(null);

  if (!user) return null;

  // Format account creation date
  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  // Role badge helper
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return {
          bg: 'rgba(214, 158, 61, 0.18)',
          border: 'rgba(214, 158, 61, 0.45)',
          text: '#e6b252',
          label: 'Admin (System Administrator)',
        };
      case 'responder':
        return {
          bg: 'rgba(61, 139, 90, 0.22)',
          border: 'rgba(61, 139, 90, 0.5)',
          text: '#72be8c',
          label: 'Emergency Responder',
        };
      default:
        return {
          bg: 'rgba(216, 199, 167, 0.15)',
          border: 'rgba(216, 199, 167, 0.35)',
          text: 'var(--color-sand)',
          label: 'Citizen User',
        };
    }
  };

  const roleInfo = getRoleBadge(user.role);

  // Helper to run RBAC endpoint test
  const handleTestRbac = async (endpointId, apiFunc) => {
    setTestingEndpoint(endpointId);
    try {
      const data = await apiFunc();
      setTestResults((prev) => ({
        ...prev,
        [endpointId]: {
          status: 200,
          success: true,
          message: data.message,
        },
      }));
    } catch (error) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message || 'Request failed';
      setTestResults((prev) => ({
        ...prev,
        [endpointId]: {
          status,
          success: false,
          message,
        },
      }));
    } finally {
      setTestingEndpoint(null);
    }
  };

  // RBAC test endpoint card metadata
  const rbacEndpoints = [
    {
      id: 'citizen-test',
      title: 'Citizen Endpoint',
      method: 'GET',
      path: '/api/auth/citizen-test',
      allowedRoles: ['citizen', 'responder', 'admin'],
      apiFunc: getCitizenTest,
    },
    {
      id: 'responder-test',
      title: 'Responder Endpoint',
      method: 'GET',
      path: '/api/auth/responder-test',
      allowedRoles: ['responder', 'admin'],
      apiFunc: getResponderTest,
    },
    {
      id: 'admin-test',
      title: 'Admin Endpoint',
      method: 'GET',
      path: '/api/auth/admin-test',
      allowedRoles: ['admin'],
      apiFunc: getAdminTest,
    },
  ];

  return (
    <main className="min-h-[calc(100vh-4rem)] w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 flex flex-col gap-6">
      {/* Page Header (No duplicate logout button) */}
      <div className="border-b border-[var(--color-bg-border)] pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
          User Profile
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Authenticated session details and role authorization status
        </p>
      </div>

      {/* User Information Card */}
      <section className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-xl p-6 shadow-lg w-full">
        <div className="flex items-center gap-4 pb-6 border-b border-[var(--color-bg-border)]">
          <div className="w-14 h-14 rounded-full bg-[var(--color-sand)]/20 border border-[var(--color-sand)]/40 flex items-center justify-center text-xl font-bold text-[var(--color-sand)] flex-shrink-0">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">{user.name}</h2>
            <div
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border mt-1"
              style={{
                backgroundColor: roleInfo.bg,
                borderColor: roleInfo.border,
                color: roleInfo.text,
              }}
            >
              {roleInfo.label}
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">
              Full Name
            </span>
            <p className="text-base font-medium text-[var(--color-text-primary)]">{user.name}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">
              Email Address
            </span>
            <p className="text-base font-medium text-[var(--color-text-primary)]">{user.email}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">
              Assigned System Role
            </span>
            <p className="text-base font-medium capitalize text-[var(--color-text-primary)]">
              {user.role}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">
              Account Created
            </span>
            <p className="text-base font-medium text-[var(--color-text-primary)]">{formattedDate}</p>
          </div>
        </div>
      </section>

      {/* RBAC Verification / Demonstration Panel */}
      <section className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-xl p-6 shadow-lg w-full space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--color-sand)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Role-Based Access Control (RBAC) Verification
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Test backend RBAC authorization middleware in real time with your current logged-in role (<span className="font-semibold text-[var(--color-text-primary)] capitalize">{user.role}</span>).
          </p>
        </div>

        {/* Responsive Cards Grid: 1 column on mobile, 3 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 items-start">
          {rbacEndpoints.map((ep) => {
            const result = testResults[ep.id];
            const isTesting = testingEndpoint === ep.id;

            return (
              <div
                key={ep.id}
                className="bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-[var(--color-bg-border)]/80 transition-all shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">{ep.title}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--color-bg-surface)] text-[var(--color-sand)] border border-[var(--color-bg-border)]">
                      {ep.method}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-[var(--color-text-muted)] truncate">{ep.path}</p>

                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold block mb-1">
                      Allowed Roles
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ep.allowedRoles.map((role) => (
                        <span
                          key={role}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-bg-border)]"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-[var(--color-bg-border)]/60">
                  <button
                    onClick={() => handleTestRbac(ep.id, ep.apiFunc)}
                    disabled={testingEndpoint !== null}
                    className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-[var(--color-sand)] text-[#0c1612] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isTesting ? (
                      <>
                        <div className="w-3 h-3 rounded-full border-2 border-[#0c1612] border-t-transparent animate-spin"></div>
                        Testing...
                      </>
                    ) : (
                      'Test Access'
                    )}
                  </button>

                  {result && (
                    <div
                      className={`p-3 rounded-lg border text-xs transition-all ${
                        result.success
                          ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                          : 'bg-red-950/60 border-red-800/80 text-red-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold mb-1">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            result.success ? 'bg-emerald-400' : 'bg-red-400'
                          }`}
                        ></span>
                        <span>
                          {result.success ? '200 OK — Allowed' : `${result.status} Forbidden — Blocked`}
                        </span>
                      </div>
                      <p className="text-[11px] opacity-90 leading-relaxed">{result.message}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
