import { requestJson } from '../../../services/Api';

export const scheduleApi = {
  listByCampaign: (baseUrl, campaignId) =>
    requestJson(`/schedules?campaignId=${campaignId}`, { method: 'GET' }, baseUrl),
  listByWorkspace: (baseUrl, workspaceId) =>
    requestJson(`/schedules?workspaceId=${workspaceId}`, { method: 'GET' }, baseUrl),
};
