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

export default api;
