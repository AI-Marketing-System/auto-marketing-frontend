const DEFAULT_API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || '/api/v1'
).replace(/\/+$/, '');

const ACCESS_TOKEN_STORAGE_KEY = 'marqops.authLab.accessToken';
const REFRESH_TOKEN_STORAGE_KEY = 'marqops.authLab.refreshToken';

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
  const headers = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(options.headers || {}),
  };

  const isPublicAuthRoute =
    typeof path === 'string' &&
    (path.startsWith('/auth/') || path === '/auth');

  if (!isPublicAuthRoute && typeof window !== 'undefined') {
    const accessToken = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
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

  const contentType = (
    response.headers.get('content-type') || ''
  ).toLowerCase();
  
  const text = await response.text();
  if (!text || !text.trim()) {
    return null;
  }

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch (error) {
      return {
        message: text,
        raw: text,
        contentType,
      };
    }
  }

  return {
    message: text,
    raw: text,
    contentType,
  };
}

export async function requestJson(
  path,
  options = {},
  baseUrl = DEFAULT_API_BASE_URL
) {
  const response = await fetch(joinUrl(baseUrl, path), {
    cache: 'no-store',
    ...options,
    headers: getAuthHeaders(path, options),
  });

  const body = await readResponseBody(response);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearStoredAuthTokens();
    }

    const error = new Error(
      body?.message || `Request failed with status ${response.status}`
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
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function getRefreshToken() {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function setAccessToken(token) {
  if (typeof window === 'undefined') {
    return;
  }
  if (token) {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }
}

export function setRefreshToken(token) {
  if (typeof window === 'undefined') {
    return;
  }
  if (token) {
    window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }
}

export function clearAuthTokens() {
  clearStoredAuthTokens();
}