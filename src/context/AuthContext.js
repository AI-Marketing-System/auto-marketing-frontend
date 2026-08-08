import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../modules/auth/api/authApi';
import { API_BASE_URL } from '../config/env';

const SESSIONS_KEY = 'marqops.authLab.sessions';
const ACTIVE_ACCOUNT_ID_KEY = 'marqops.authLab.activeAccountId';

const AuthContext = createContext(null);

function getStoredSessions() {
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function getStoredActiveAccountId() {
  return localStorage.getItem(ACTIVE_ACCOUNT_ID_KEY);
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

function extractUserFromToken(token) {
  const payload = decodeTokenPayload(token);
  if (!payload) return null;
  return {
    id: payload.userId || payload.id || payload.sub,
    userId: payload.userId,
    email: payload.email || payload.sub,
    fullName: payload.fullName || payload.name,
    roles: payload.roles || payload.authorities || [],
    role: mapRole(payload.roles || payload.authorities),
  };
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState(() => getStoredSessions());
  const [activeAccountId, setActiveAccountId] = useState(() => getStoredActiveAccountId());
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const activeSession = sessions.find((s) => String(s.user?.id) === String(activeAccountId)) || sessions[0];
  
  const accessToken = activeSession?.accessToken || null;
  const refreshToken = activeSession?.refreshToken || null;
  const user = activeSession?.user || null;
  const isAuthenticated = !!accessToken;

  useEffect(() => {
    if (activeSession) {
      localStorage.setItem(ACTIVE_ACCOUNT_ID_KEY, String(activeSession.user.id));
      if (String(activeAccountId) !== String(activeSession.user.id)) {
        setActiveAccountId(String(activeSession.user.id));
      }
    } else {
      localStorage.removeItem(ACTIVE_ACCOUNT_ID_KEY);
    }
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions, activeSession, activeAccountId]);

  // Migration from old single-token format
  useEffect(() => {
    const oldAccess = localStorage.getItem('marqops.authLab.accessToken');
    const oldRefresh = localStorage.getItem('marqops.authLab.refreshToken');
    if (oldAccess && sessions.length === 0) {
      const u = extractUserFromToken(oldAccess);
      if (u) {
        setSessions([{ accessToken: oldAccess, refreshToken: oldRefresh, user: u }]);
        setActiveAccountId(String(u.id));
        localStorage.removeItem('marqops.authLab.accessToken');
        localStorage.removeItem('marqops.authLab.refreshToken');
      }
    }
  }, [sessions.length]);

  const switchAccount = useCallback((userId) => {
    const sessionExists = sessions.some((s) => String(s.user.id) === String(userId));
    if (sessionExists) {
      setActiveAccountId(String(userId));
      navigate('/dashboard', { replace: true });
    }
  }, [sessions, navigate]);

  const handleSessionExpired = useCallback(() => {
    setSessions((prev) => {
      const newSessions = prev.filter((s) => String(s.user.id) !== String(activeAccountId));
      if (newSessions.length === 0) {
        setIsSessionExpired(true);
        navigate('/login', { replace: true, state: { sessionExpired: true } });
      } else {
        setActiveAccountId(String(newSessions[0].user.id));
      }
      return newSessions;
    });
  }, [activeAccountId, navigate]);

  const login = useCallback(
    async (credentials, apiBaseUrl) => {
      setIsLoading(true);
      setError(null);
      setIsSessionExpired(false);
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
        if (!token) throw new Error('Missing accessToken in response');
        
        const u = extractUserFromToken(token);
        if (!u) throw new Error('Invalid token payload');

        setSessions((prev) => {
          const index = prev.findIndex((s) => String(s.user.id) === String(u.id));
          const newSessions = [...prev];
          if (index >= 0) {
            newSessions[index] = { accessToken: token, refreshToken: refresh, user: u };
          } else {
            newSessions.push({ accessToken: token, refreshToken: refresh, user: u });
          }
          return newSessions;
        });
        setActiveAccountId(String(u.id));
        return data;
      } catch (e) {
        setError(e.message);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(
    async (apiBaseUrl, targetUserId = null) => {
      const uidToLogout = targetUserId || activeAccountId;
      const sessionToLogout = sessions.find((s) => String(s.user.id) === String(uidToLogout));
      
      try {
        if (sessionToLogout?.accessToken) {
          await authApi.logout({ email: sessionToLogout.user?.email || '' }, apiBaseUrl || API_BASE_URL);
        }
      } catch {
        // ignore logout API errors
      } finally {
        setSessions((prev) => {
          const newSessions = prev.filter((s) => String(s.user.id) !== String(uidToLogout));
          if (newSessions.length === 0) {
            setIsSessionExpired(false);
            navigate('/login', { replace: true });
          } else if (uidToLogout === activeAccountId) {
            setActiveAccountId(String(newSessions[0].user.id));
            navigate('/dashboard', { replace: true });
          }
          return newSessions;
        });
      }
    },
    [sessions, activeAccountId, navigate]
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
        if (!newToken) throw new Error('Missing accessToken in refresh response');
        
        const u = extractUserFromToken(newToken) || user;
        setSessions((prev) => {
          const index = prev.findIndex((s) => String(s.user.id) === String(activeAccountId));
          if (index < 0) return prev;
          const newSessions = [...prev];
          newSessions[index] = { ...newSessions[index], accessToken: newToken, user: u };
          return newSessions;
        });
        return newToken;
      } catch (e) {
        logout(apiBaseUrl);
        return null;
      }
    },
    [refreshToken, user, activeAccountId, logout]
  );

  useEffect(() => {
    if (!accessToken) return;
    const payload = decodeTokenPayload(accessToken);
    if (!payload || !payload.exp) return;

    const expiresAt = payload.exp * 1000;
    const timeoutMs = expiresAt - Date.now();

    if (timeoutMs <= 0) {
      handleSessionExpired();
      return;
    }
    const timer = setTimeout(() => {
      handleSessionExpired();
    }, timeoutMs);
    return () => clearTimeout(timer);
  }, [accessToken, handleSessionExpired]);

  useEffect(() => {
    const onAuthExpired = () => handleSessionExpired();
    window.addEventListener('auth:expired', onAuthExpired);
    return () => window.removeEventListener('auth:expired', onAuthExpired);
  }, [handleSessionExpired]);

  const setTokens = useCallback((newAccessToken, newRefreshToken, targetUserId = null) => {
     setSessions((prev) => {
       const uid = targetUserId || activeAccountId;
       const index = prev.findIndex((s) => String(s.user.id) === String(uid));
       if (index === -1) return prev; 
       
       if (!newAccessToken) {
         return prev.filter((s) => String(s.user.id) !== String(uid));
       }
       
       const newSessions = [...prev];
       const u = extractUserFromToken(newAccessToken) || newSessions[index].user;
       newSessions[index] = { ...newSessions[index], accessToken: newAccessToken, refreshToken: newRefreshToken, user: u };
       return newSessions;
     });
  }, [activeAccountId]);

  const value = {
    accessToken,
    refreshToken,
    user,
    sessions,          // Newly exposed
    switchAccount,     // Newly exposed
    isAuthenticated,
    isLoading,
    error,
    isSessionExpired,
    setIsSessionExpired,
    login,
    logout,
    refreshAccessToken,
    setTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
