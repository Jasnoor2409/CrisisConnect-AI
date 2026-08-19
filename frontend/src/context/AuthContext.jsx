import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getAuthToken,
  saveAuthData,
  clearAuthData,
  getMe,
  loginUser as apiLoginUser,
} from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getAuthToken());
  const [user, setUser] = useState(null); // Explicitly null until token is verified by backend
  const [loading, setLoading] = useState(true);

  /**
   * Session verification on initial app load / refresh
   */
  const verifySession = useCallback(async () => {
    const storedToken = getAuthToken();
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const data = await getMe();
      if (data.success && data.user) {
        setUser(data.user);
        setToken(storedToken);
        // Sync verified user data in localStorage
        saveAuthData(storedToken, data.user);
      } else {
        clearAuthData();
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      // Token invalid, expired, or server returned error
      clearAuthData();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();

    // Listen for unauthorized 401 events dispatched by Axios interceptor
    const handleUnauthorized = () => {
      clearAuthData();
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [verifySession]);

  /**
   * Authenticate user with credentials, save state and localStorage
   */
  const login = async (credentials) => {
    const data = await apiLoginUser(credentials);
    if (data.success && data.token && data.user) {
      saveAuthData(data.token, data.user);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  /**
   * Clear session state and localStorage
   */
  const logout = () => {
    clearAuthData();
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    logout,
    verifySession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
