import { requestJson } from '../../../services/Api';

export const topicApi = {
  listByCampaignId: (campaignId, baseUrl) =>
    requestJson(`/topics/campaign/${campaignId}`, { method: 'GET' }, baseUrl),
  getById: (id, baseUrl) =>
    requestJson(`/topics/${id}`, { method: 'GET' }, baseUrl),
  create: (payload, baseUrl) =>
    requestJson(
      '/topics',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      baseUrl
    ),
  update: (id, payload, baseUrl) =>
    requestJson(
      `/topics/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      baseUrl
    ),
  delete: (id, baseUrl) =>
    requestJson(`/topics/${id}`, { method: 'DELETE' }, baseUrl),

  /** Generate AI topic suggestions — does NOT save to DB */
  generateAi: (payload, baseUrl) =>
    requestJson(
      '/topics/ai-generate',
      { method: 'POST', body: JSON.stringify(payload) },
      baseUrl
    ),

  /** Batch-save selected AI suggestions to DB */
  saveBatch: (payload, baseUrl) =>
    requestJson(
      '/topics/batch',
      { method: 'POST', body: JSON.stringify(payload) },
      baseUrl
    ),
};
