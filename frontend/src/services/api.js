import axios from 'axios';

// Base Axios instance for all API calls.
// In dev, Vite proxies /api → http://localhost:5000 so no hardcoded host is needed.
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ── Request Interceptor: Attach JWT Bearer Token if present ───────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle 401 Session Expiration / Invalidation ───────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token & user data if local session is invalid or expired
      const hadToken = Boolean(localStorage.getItem('cc_token'));
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');

      // Dispatch custom window event if there was a token to let AuthContext react cleanly
      if (hadToken) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
