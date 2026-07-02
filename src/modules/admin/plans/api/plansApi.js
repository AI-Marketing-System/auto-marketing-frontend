import { requestJson } from '../../../../services/Api';
import { API_BASE_URL } from '../../../../config/env';

const TOKEN_KEY = 'marqops.authLab.accessToken';

function getAuthHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);

  return token ? { Authorization: `Bearer ${token}` } : {};
}

function withAuth(options = {}) {
    return {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
            ...getAuthHeaders(),
        },
    };
}

function toJsonBody(payload) {
  return JSON.stringify(payload ?? {});
}

export const plansApi = {
  getAll: (baseUrl = API_BASE_URL) =>
    requestJson('/admin/plans', withAuth({ method: 'GET' }), baseUrl),
  getActive: (baseUrl = API_BASE_URL) =>
    requestJson('/admin/plans/active', withAuth({ method: 'GET' }), baseUrl),
  getById: (id, baseUrl = API_BASE_URL) =>
    requestJson(`/admin/plans/${id}`, withAuth({ method: 'GET' }), baseUrl),
  create: (payload, baseUrl = API_BASE_URL) =>
    requestJson(
      '/admin/plans',
      withAuth({
        method: 'POST',
        body: toJsonBody(payload),
      }),
      baseUrl
    ),
  update: (id, payload, baseUrl = API_BASE_URL) =>
    requestJson(
      `/admin/plans/${id}`,
      withAuth({
        method: 'PUT',
        body: toJsonBody(payload),
      }),
      baseUrl
    ),
  remove: (id, baseUrl = API_BASE_URL) =>
    requestJson(
      `/admin/plans/${id}`,
      withAuth({
        method: 'DELETE',
        body: toJsonBody({}),
      }),
      baseUrl
    ),
};
