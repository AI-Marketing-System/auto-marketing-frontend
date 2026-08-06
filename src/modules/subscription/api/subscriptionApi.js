import { requestJson } from '../../../services/Api';

export async function getQuota(workspaceId) {
  const url = workspaceId ? `/subscriptions/quota?workspaceId=${workspaceId}` : '/subscriptions/quota';
  const response = await requestJson(url, { method: 'GET' });
  return response?.data ?? null;
}

