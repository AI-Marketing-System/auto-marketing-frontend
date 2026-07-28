import { requestJson } from '../../../services/Api';

const LIST_KEYS = ['content', 'items', 'campaigns', 'records', 'list', 'results'];

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    searchParams.append(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const assertApiSuccess = (response, fallbackMessage = 'Yêu cầu không thành công') => {
  if (response && response.success === false) {
    throw new Error(response.message || fallbackMessage);
  }
  return response;
};

export const parseWorkspacesResponse = (response) => {
  assertApiSuccess(response, 'Không thể tải workspace');
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const unwrapPayload = (response) => {
  if (response?.success === true && response?.data != null) {
    return response.data;
  }
  return response;
};

const extractListItems = (payload) => {
  if (!payload) return [];

  if (Array.isArray(payload)) return payload;

  for (const key of LIST_KEYS) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  if (Array.isArray(payload?.page?.content)) return payload.page.content;
  if (payload?.id != null && (payload?.name || payload?.title)) return [payload];

  return [];
};

export const parsePaginatedResponse = (response, fallbackPage = 0, fallbackSize = 8) => {
  assertApiSuccess(response, 'Không thể tải chiến dịch');

  const payload = unwrapPayload(response);
  const content = extractListItems(payload);

  const pageMeta =
    payload && !Array.isArray(payload)
      ? payload
      : response?.data && !Array.isArray(response.data)
        ? response.data
        : {};

  return {
    content,
    totalElements: pageMeta.totalElements ?? pageMeta.total ?? pageMeta.totalCount ?? content.length,
    totalPages: pageMeta.totalPages ?? pageMeta.pages ?? (content.length > 0 ? 1 : 1),
    number: pageMeta.number ?? pageMeta.pageNumber ?? pageMeta.page ?? fallbackPage,
    size: pageMeta.size ?? pageMeta.pageSize ?? fallbackSize,
  };
};

export const mapSortField = (sortBy) => {
  if (sortBy === 'title') return 'name';
  if (sortBy === 'createdDate') return 'createdAt';
  return sortBy || undefined;
};

export const buildCampaignListParams = ({
  workspaceId,
  search,
  status,
  createdBy,
  sortBy,
  sortDirection,
  page,
  size,
}) => {
  const params = {
    workspaceId,
    search,
    status,
    createdBy,
    page,
    size,
  };

  const mappedSort = mapSortField(sortBy);
  if (mappedSort) {
    params.sort = `${mappedSort},${sortDirection || 'desc'}`;
  }

  return params;
};

export const buildCreateCampaignPayload = ({
  workspaceId,
  title,
  name,
  description,
  status,
  startDate,
  endDate,
}) => ({
  workspaceId,
  name: (name || title || '').trim(),
  description: description || '',
  status,
  startDate,
  endDate,
});

export const campaignApi = {
  list: (baseUrl, params = {}) => {
    const queryString = buildQueryString(buildCampaignListParams(params));
    return requestJson(`/campaigns${queryString}`, { method: 'GET' }, baseUrl);
  },
  create: (payload, baseUrl) =>
    requestJson(
      '/campaigns',
      { method: 'POST', body: JSON.stringify(buildCreateCampaignPayload(payload)) },
      baseUrl
    ),
  pause: (campaignId, baseUrl) =>
    requestJson(`/campaigns/${campaignId}/pause`, { method: 'PUT' }, baseUrl),
  resume: (campaignId, baseUrl) =>
    requestJson(`/campaigns/${campaignId}/resume`, { method: 'PUT' }, baseUrl),
  complete: (campaignId, baseUrl) =>
    requestJson(`/campaigns/${campaignId}/complete`, { method: 'PUT' }, baseUrl),
};

export const workspaceApi = {
  myWorkspaces: (baseUrl) => requestJson('/workspaces', { method: 'GET' }, baseUrl),
  memberWorkspaces: (baseUrl) => requestJson('/workspaces/member', { method: 'GET' }, baseUrl),
};
