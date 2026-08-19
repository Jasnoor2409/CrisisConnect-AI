import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// ── Helper: extract error messages from Axios error ───────────────────────────
const extractErrors = (error) => {
  if (error.response?.data?.errors) return error.response.data.errors;
  if (error.response?.data?.message) return { general: error.response.data.message };
  if (error.message) return { general: error.message };
  return { general: 'Something went wrong. Please try again.' };
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ── Controlled input handler ────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  // ── Client-side validation ──────────────────────────────────────────────────
  const validate = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Enter a valid email address';
    }
    if (!formData.password) errors.password = 'Password is required';
    return errors;
  };

  // ── Form submission ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      await login(formData);
      navigate('/report-incident');
    } catch (error) {
      const errors = extractErrors(error);
      if (errors.general) {
        setServerError(errors.general);
      } else {
        setFieldErrors(errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Password field with show/hide toggle ────────────────────────────────────
  const renderPasswordInput = () => {
    const hasError = Boolean(fieldErrors.password);
    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="login-password"
          className="text-sm font-medium"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            className={[
              'w-full rounded-lg px-4 py-3 pr-11 text-sm transition-all duration-200',
              'border focus:outline-none',
              hasError
                ? 'border-red-700 focus:border-red-500'
                : 'border-[var(--color-bg-border)] focus:border-[var(--color-primary)]',
            ].join(' ')}
            style={{
              background: 'var(--color-bg-surface)',
              color: 'var(--color-text-primary)',
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-opacity hover:opacity-80"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              // Eye-off icon
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <line strokeLinecap="round" strokeLinejoin="round" x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              // Eye icon
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
        {hasError && (
          <p className="text-xs" style={{ color: 'var(--color-error-light)' }}>
            {fieldErrors.password}
          </p>
        )}
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: 'var(--color-bg-base)' }}
    >
      {/* Background grid texture — matches RegisterPage */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(var(--color-text-primary) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-text-primary) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* ── Brand header ──────────────────────────────────────────────────── */}
        <div className="mb-8 text-center">
          {/* Shield icon */}
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border"
            style={{
              background: 'var(--color-bg-elevated)',
              borderColor: 'var(--color-primary)',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" style={{ color: 'var(--color-primary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            CrisisConnect AI
          </h1>
          <p
            className="mt-1 text-xs font-medium uppercase tracking-widest"
            style={{ color: 'var(--color-primary)' }}
          >
            Emergency Response Platform
          </p>
        </div>

        {/* ── Login card ────────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl border p-8 shadow-2xl"
          style={{
            background: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-bg-border)',
          }}
        >
          <div className="mb-6">
            <h2
              className="text-xl font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Sign in to your account
            </h2>
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Access the emergency response network
            </p>
          </div>

          {/* ── Server error banner ──────────────────────────────────────── */}
          {serverError && (
            <div
              className="mb-5 flex items-start gap-3 rounded-lg border px-4 py-3"
              role="alert"
              style={{
                background: 'rgba(158,61,46,0.12)',
                borderColor: 'var(--color-error)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0" style={{ color: 'var(--color-error-light)' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" />
                <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" />
              </svg>
              <p className="text-sm" style={{ color: 'var(--color-error-light)' }}>
                {serverError}
              </p>
            </div>
          )}

          {/* ── Form ────────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* Email field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-email"
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Email Address
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className={[
                  'w-full rounded-lg px-4 py-3 text-sm transition-all duration-200',
                  'border focus:outline-none',
                  fieldErrors.email
                    ? 'border-red-700 focus:border-red-500'
                    : 'border-[var(--color-bg-border)] focus:border-[var(--color-primary)]',
                ].join(' ')}
                style={{
                  background: 'var(--color-bg-surface)',
                  color: 'var(--color-text-primary)',
                }}
              />
              {fieldErrors.email && (
                <p className="text-xs" style={{ color: 'var(--color-error-light)' }}>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password field with show/hide */}
            {renderPasswordInput()}

            {/* Submit button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: isLoading ? 'var(--color-primary-light)' : 'var(--color-primary)',
                color: 'var(--color-text-primary)',
              }}
              onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = 'var(--color-primary-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = isLoading ? 'var(--color-primary-light)' : 'var(--color-primary)'; }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* ── Divider ─────────────────────────────────────────────────── */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: 'var(--color-bg-border)' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Don't have an account?
            </span>
            <div className="h-px flex-1" style={{ background: 'var(--color-bg-border)' }} />
          </div>

          {/* ── Register link ────────────────────────────────────────────── */}
          <Link
            to="/register"
            id="register-link"
            className="flex w-full items-center justify-center rounded-lg border px-6 py-3 text-sm font-medium transition-all duration-200 hover:opacity-80"
            style={{
              borderColor: 'var(--color-bg-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Create an account
          </Link>
        </div>

        {/* ── Footer note ───────────────────────────────────────────────── */}
        <p
          className="mt-6 text-center text-xs leading-relaxed"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Authorized personnel only. Unauthorized access is prohibited.
          <br />
          This platform is for emergency response coordination.
        </p>
      </div>
    </div>
  );
}
