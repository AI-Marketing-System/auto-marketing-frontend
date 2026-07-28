import { requestJson } from '../../../../services/Api';

export const usersApi = {
  getUsers: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.keyword) query.append('keyword', params.keyword);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.page !== undefined) query.append('page', params.page);
    if (params.size !== undefined) query.append('size', params.size);
    if (params.sort) query.append('sort', params.sort);

    const queryString = query.toString();
    const url = `/admin/users${queryString ? `?${queryString}` : ''}`;
    return requestJson(url);
  },

  getUserById: async (id) => {
    return requestJson(`/admin/users/${id}`);
  },

  createUser: async (payload) => {
    return requestJson('/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateUser: async (id, payload) => {
    return requestJson(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  updateUserStatus: async (id, status) => {
    return requestJson(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  deleteUser: async (id) => {
    return requestJson(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },
};
