import api from './api.js';

// ── localStorage keys ─────────────────────────────────────────────────────────
// Namespaced to avoid collisions with other apps on the same origin
const TOKEN_KEY = 'cc_token';
const USER_KEY = 'cc_user';

// ── Registration (Feature 1) ──────────────────────────────────────────────────

/**
 * Register a new user account.
 * @param {{ name: string, email: string, password: string, confirmPassword: string, role?: string }} data
 * @returns {Promise<{ success: boolean, message: string, user: object }>}
 */
export const registerUser = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

// ── Login (Feature 2) ─────────────────────────────────────────────────────────

/**
 * Log in with email and password.
 * @param {{ email: string, password: string }} data
 * @returns {Promise<{ success: boolean, message: string, token: string, user: object }>}
 */
export const loginUser = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

// TEMPORARY CHO EVALUATION FETCH DEMO
/**
 * Executes a login demonstration using the native Fetch API and Promise chaining (.then().catch()).
 * Demonstrates: Fetch API, Promise chaining, Default parameters for CHO syllabus evaluation.
 * @param {{ email?: string, password?: string }} demoCredentials
 * @returns {Promise<{ success: boolean, message: string, token: string, user: object }>}
 */
export const choFetchDemoLogin = (
  demoCredentials = { email: 'demo@crisisconnect.ai', password: 'DemoPass123!' }
) => {
  const BASE_URL = '/api';
  return window
    .fetch(`${BASE_URL}/auth/cho-demo-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(demoCredentials),
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Fetch API Error: HTTP status ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.success && data.token && data.user) {
        saveAuthData(data.token, data.user);
      }
      return data;
    })
    .catch((err) => {
      console.error('CHO Fetch Demo Error:', err);
      throw err;
    });
};

// ── User Profile & Session Verification (Feature 4) ───────────────────────────

/**
 * Verify current JWT session and fetch user profile.
 * @returns {Promise<{ success: boolean, user: object }>}
 */
export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// ── RBAC Demo Endpoints (Feature 3) ───────────────────────────────────────────

export const getCitizenTest = async () => {
  const response = await api.get('/auth/citizen-test');
  return response.data;
};

export const getResponderTest = async () => {
  const response = await api.get('/auth/responder-test');
  return response.data;
};

export const getAdminTest = async () => {
  const response = await api.get('/auth/admin-test');
  return response.data;
};

// ── localStorage helpers ──────────────────────────────────────────────────────

/**
 * Persist the JWT token and safe user object.
 * Called after a successful login response.
 * NEVER stores the password.
 * @param {string} token
 * @param {{ id: string, name: string, email: string, role: string, createdAt: string }} user
 */
export const saveAuthData = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Read the stored JWT token (or null if not logged in).
 * @returns {string|null}
 */
export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

/**
 * Read the stored user object (or null if not logged in).
 * @returns {object|null}
 */
export const getAuthUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Remove the token and user from localStorage (logout).
 */
export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
