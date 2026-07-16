import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../modules/auth/api/authApi';
import { API_BASE_URL } from '../config/env';

const ACCESS_TOKEN_KEY = 'marqops.authLab.accessToken';
const REFRESH_TOKEN_KEY = 'marqops.authLab.refreshToken';

const AuthContext = createContext(null);

function getStoredTokens() {
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    return { accessToken, refreshToken };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

function decodeTokenPayload(token) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function mapRole(roles) {
  if (!roles || !Array.isArray(roles)) return 'USER';
  if (roles.includes('ADMIN') || roles.includes('ROLE_ADMIN')) return 'ADMIN';
  return 'USER';
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState(() => getStoredTokens().accessToken);
  const [refreshToken, setRefreshToken] = useState(() => getStoredTokens().refreshToken);
  const [user, setUser] = useState(() => {
    const token = getStoredTokens().accessToken;
    if (!token) return null;
    const payload = decodeTokenPayload(token);
    if (!payload) return null;
    return {
      id: payload.sub || payload.userId || payload.id,
      email: payload.email || payload.sub,
      fullName: payload.fullName || payload.name,
      roles: payload.roles || payload.authorities || [],
      role: mapRole(payload.roles || payload.authorities),
    };
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = !!accessToken;

  const setTokens = useCallback((newAccessToken, newRefreshToken) => {
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    if (newAccessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
    if (newRefreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }, []);

  const updateUserFromToken = useCallback((token) => {
    const payload = decodeTokenPayload(token);
    if (!payload) {
      setUser(null);
      return;
    }
    setUser({
      id: payload.sub || payload.userId || payload.id,
      email: payload.email || payload.sub,
      fullName: payload.fullName || payload.name,
      roles: payload.roles || payload.authorities || [],
      role: mapRole(payload.roles || payload.authorities),
    });
  }, []);

  const logout = useCallback(
    async (apiBaseUrl) => {
      try {
        if (accessToken) {
          await authApi.logout({ email: user?.email || '' }, apiBaseUrl || API_BASE_URL);
        }
      } catch {
        // ignore logout API errors, still clear local session
      } finally {
        setTokens(null, null);
        setUser(null);
        setError(null);
        navigate('/login', { replace: true });
      }
    },
    [setTokens, navigate, user, accessToken]
  );

  const login = useCallback(
    async (credentials, apiBaseUrl) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiBaseUrl}/auth/login`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify(credentials),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body?.message || `HTTP ${res.status}`);
        }
        const data = body?.data || body;
        const token = data?.accessToken;
        const refresh = data?.refreshToken;
        if (!token) {
          throw new Error('Missing accessToken in response');
        }
        setTokens(token, refresh);
        updateUserFromToken(token);
        return data;
      } catch (e) {
        setError(e.message);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [setTokens, updateUserFromToken]
  );

  const refreshAccessToken = useCallback(
    async (apiBaseUrl) => {
      if (!refreshToken) return null;
      try {
        const res = await fetch(`${apiBaseUrl}/auth/refresh-token`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({ refreshToken }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body?.message || 'Refresh failed');
        }
        const data = body?.data || body;
        const newToken = data?.accessToken;
        if (!newToken) {
          throw new Error('Missing accessToken in refresh response');
        }
        setTokens(newToken, refreshToken);
        updateUserFromToken(newToken);
        return newToken;
      } catch (e) {
        logout(apiBaseUrl);
        return null;
      }
    },
    [refreshToken, setTokens, updateUserFromToken, logout]
  );

  useEffect(() => {
    const token = getStoredTokens().accessToken;
    if (token) {
      setAccessToken(token);
      updateUserFromToken(token);
    }
  }, [updateUserFromToken]);

  const value = {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshAccessToken,
    setTokens,
    updateUserFromToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
