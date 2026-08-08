const DEFAULT_API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || '/api/v1').replace(/\/+$/, '');

const ACCESS_TOKEN_STORAGE_KEY = 'marqops.authLab.accessToken';
const REFRESH_TOKEN_STORAGE_KEY = 'marqops.authLab.refreshToken';
const SESSIONS_KEY = 'marqops.authLab.sessions';
const ACTIVE_ACCOUNT_ID_KEY = 'marqops.authLab.activeAccountId';

function clearStoredAuthTokens() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}

function joinUrl(baseUrl, path) {
  const trimmedBaseUrl = (baseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBaseUrl}${normalizedPath}`;
}

function getAuthHeaders(path, options = {}) {
  const isFormData =
    options.isFormData || (typeof FormData !== 'undefined' && options.body instanceof FormData);

  const headers = {
    'ngrok-skip-browser-warning': 'true',
    ...(options.headers || {}),
  };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  } else if (isFormData) {
    delete headers['Content-Type'];
  }

  const isPublicAuthRoute =
    typeof path === 'string' && (path.startsWith('/auth/') || path === '/auth');

  if (!isPublicAuthRoute && typeof window !== 'undefined') {
    const accessToken = getAccessToken();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  return headers;
}

async function readResponseBody(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const text = await response.text();
    return text && text.trim() ? JSON.parse(text) : null;
  }

  const text = await response.text();
  return text ? { message: text, raw: text, contentType } : null;
}

export async function requestJson(path, options = {}, baseUrl) {
  const response = await fetch(joinUrl(baseUrl, path), {
    cache: 'no-store',
    headers: getAuthHeaders(path, options),
    ...options,
  });

  const body = await readResponseBody(response);
  //|| response.status === 403
  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAuthTokens();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
    }

    if (response.status === 402) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('subscription:payment_required', { detail: body }));
      }
    }

    const error = new Error(body?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  if (body && body.contentType && !body.contentType.includes('application/json')) {
    const error = new Error(
      `Expected JSON from API nhưng nhận được ${body.contentType || 'response không rõ kiểu'}. Kiểm tra REACT_APP_API_BASE_URL.`
    );
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

export function getApiBaseUrl() {
  return DEFAULT_API_BASE_URL;
}

export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  try {
    const sessionsStr = window.localStorage.getItem(SESSIONS_KEY);
    const activeAccountId = window.localStorage.getItem(ACTIVE_ACCOUNT_ID_KEY);
    if (sessionsStr) {
      const sessions = JSON.parse(sessionsStr);
      if (sessions && sessions.length > 0) {
         const activeSession = sessions.find(s => String(s.user?.id) === String(activeAccountId)) || sessions[0];
         return activeSession?.accessToken || null;
      }
    }
  } catch (e) {
    // Ignore parse error
  }
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}
