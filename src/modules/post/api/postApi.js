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
};

export const postApi = {
  listByTopicId: (topicId, baseUrl) =>
    requestJson(`/posts/topic/${topicId}`, { method: 'GET' }, baseUrl),
  create: (payload, baseUrl) =>
    requestJson(
      '/posts',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      baseUrl
    ),
  update: (id, payload, baseUrl) =>
    requestJson(
      `/posts/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      baseUrl
    ),
  delete: (id, baseUrl) =>
    requestJson(`/posts/${id}`, { method: 'DELETE' }, baseUrl),
  generate: (payload, baseUrl) =>
    requestJson(
      '/posts/generate',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      baseUrl
    ),
};
