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

export async function requestJson(path, options = {}, baseUrl) {
  const hasBody = options.body !== undefined && options.body !== null;
  const headers = {
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(joinUrl(baseUrl, path), {
    cache: 'no-store',
    headers,
    ...options,
  });

  const body = await readResponseBody(response);

  if (!response.ok) {
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
