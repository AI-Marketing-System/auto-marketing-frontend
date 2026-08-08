import { requestJson } from '../../../../services/Api';

export const transactionsApi = {
  getTransactions: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.keyword) query.append('keyword', params.keyword);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.paymentMethod && params.paymentMethod !== 'all') query.append('paymentMethod', params.paymentMethod);
    if (params.page !== undefined) query.append('page', params.page);
    if (params.size !== undefined) query.append('size', params.size);
    if (params.sort) query.append('sort', params.sort);

    const queryString = query.toString();
    return requestJson(`/admin/transactions${queryString ? `?${queryString}` : ''}`);
  },

  getTransactionById: async (id) => {
    return requestJson(`/admin/transactions/${id}`);
  },

  updateTransactionStatus: async (id, status, note = '') => {
    return requestJson(`/admin/transactions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  },
};
