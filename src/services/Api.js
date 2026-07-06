const DEFAULT_API_BASE_URL = (
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1'
).replace(/\/+$/, '');

function joinUrl(baseUrl, path) {
  const trimmedBaseUrl = (baseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBaseUrl}${normalizedPath}`;
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

const TOKEN_KEY = 'marqops.authLab.accessToken';

export async function requestJson(path, options = {}, baseUrl) {
  const hasBody = options.body !== undefined && options.body !== null;
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  const headers = {
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(joinUrl(baseUrl, path), {
    cache: 'no-store',
    headers,
    ...options,
  });

  const body = await readResponseBody(response);

  if (!response.ok) {
    const message =
      response.status === 401 || response.status === 403
        ? 'Unauthorized'
        : body?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
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
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
