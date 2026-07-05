const DEFAULT_API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || '/api/v1').replace(/\/+$/, '');
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
    ...(options.headers || {}),
  };

  const isPublicAuthRoute = typeof path === 'string' && (path.startsWith('/auth/') || path === '/auth');

  if (!isPublicAuthRoute && typeof window !== 'undefined') {
    const accessToken = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  return headers;
}

async function readResponseBody(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
}

export async function requestJson(path, options = {}, baseUrl) {
  const response = await fetch(joinUrl(baseUrl, path), {
    headers: getAuthHeaders(path, options),
    ...options,
  });

  const body = await readResponseBody(response);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearStoredAuthTokens();
    }

    const error = new Error(body?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

export function getApiBaseUrl() {
  return DEFAULT_API_BASE_URL;
}
