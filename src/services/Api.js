const DEFAULT_API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || '/api/v1').replace(/\/+$/, '');

function joinUrl(baseUrl, path) {
  const trimmedBaseUrl = (baseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBaseUrl}${normalizedPath}`;
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
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const body = await readResponseBody(response);

  if (!response.ok) {
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
