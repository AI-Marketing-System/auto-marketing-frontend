import { requestJson } from '../../../services/Api';

export const campaignApi = {
  list: (baseUrl, workspaceId) =>
    requestJson(`/campaigns?workspaceId=${workspaceId}`, { method: 'GET' }, baseUrl),
  create: (payload, baseUrl) =>
    requestJson('/campaigns', { method: 'POST', body: JSON.stringify(payload) }, baseUrl),
};

export const workspaceApi = {
  myWorkspaces: (baseUrl) => requestJson('/workspaces/me', { method: 'GET' }, baseUrl),
};
