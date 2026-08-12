import { requestJson } from '../../../services/Api';

const getCollection = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.content)) return response.data.content;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.items)) return response.items;
  return [];
};

const getTopPostsCollection = (response) => {
  const topPosts = [
    response?.topPosts,
    response?.data?.topPosts,
    response?.data?.data?.topPosts,
    response?.data?.items,
    response?.data?.data
  ].find(Array.isArray);

  return topPosts || getCollection(response);
};

const buildTopPostsQuery = (params = {}) => {
  let timeRange = '7d';
  if (params.period === 'day') timeRange = '1d';
  else if (params.period === 'week') timeRange = '7d';
  else if (params.period === 'month') timeRange = '30d';

  const queryParams = new URLSearchParams();
  if (params.workspaceId) queryParams.append('workspaceId', params.workspaceId);
  queryParams.append('timeRange', timeRange);
  queryParams.append('sortBy', params.sortBy || 'engagement');
  queryParams.append('page', params.page || 0);
  queryParams.append('size', params.limit || 5);

  if (params.fanpageIds && params.fanpageIds.length > 0) {
    params.fanpageIds.forEach((id) => queryParams.append('fanpageIds', id));
  }

  if (params.campaignIds && params.campaignIds.length > 0) {
    params.campaignIds.forEach((id) => queryParams.append('campaignIds', id));
  }

  return queryParams.toString();
};

const PUBLISHED_STATUSES = new Set(['SUCCESS', 'PUBLISHED', 'POSTED']);

export const DashboardService = {
  getDashboardData: async (params) => {
    try {
      // API endpoint based on your controller mapping
      const baseUrl = '/dashboard';

      // Build query string from params
      const queryParams = new URLSearchParams();
      if (params.workspaceId) queryParams.append('workspaceId', params.workspaceId);
      if (params.groupBy) queryParams.append('groupBy', params.groupBy);
      if (params.limit) queryParams.append('limit', params.limit);

      // Handle array of fanpageIds
      if (params.fanpageIds && params.fanpageIds.length > 0) {
        params.fanpageIds.forEach((id) => {
          queryParams.append('fanpageIds', id);
        });
      }

      // Handle array of campaignIds
      if (params.campaignIds && params.campaignIds.length > 0) {
        params.campaignIds.forEach((id) => {
          queryParams.append('campaignIds', id);
        });
      }

      const url = `${baseUrl}?${queryParams.toString()}`;
      const response = await requestJson(url, { method: 'GET' });

      return response;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  getHeatmapData: async (params) => {
    try {
      const baseUrl = '/dashboard/heatmap';
      const queryParams = new URLSearchParams();
      if (params.workspaceId) queryParams.append('workspaceId', params.workspaceId);
      
      if (params.fanpageIds && params.fanpageIds.length > 0) {
        params.fanpageIds.forEach((id) => {
          queryParams.append('fanpageIds', id);
        });
      }
      if (params.campaignIds && params.campaignIds.length > 0) {
        params.campaignIds.forEach((id) => {
          queryParams.append('campaignIds', id);
        });
      }

      const url = `${baseUrl}?${queryParams.toString()}`;
      return await requestJson(url, { method: 'GET' });
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      return [];
    }
  },

  getTopPosts: async (params = {}) => {
    const query = buildTopPostsQuery(params);
    const response = await requestJson(`/posts/top?${query}`, { method: 'GET' });
    return {
      data: getTopPostsCollection(response),
      totalPages: response?.data?.totalPages || response?.totalPages || 0,
      currentPage: response?.data?.currentPage || response?.currentPage || 0,
    };
  },

  getPublishedPostCounts: async (workspaceId) => {
    const response = await requestJson(
      `/schedules?workspaceId=${encodeURIComponent(workspaceId)}`,
      { method: 'GET' }
    );
    const schedules = getCollection(response);

    return schedules.reduce((counts, schedule) => {
      const scheduleStatus = String(schedule?.status || '').toUpperCase();
      const targets = Array.isArray(schedule?.targets) ? schedule.targets : [];

      targets.forEach((target) => {
        const targetStatus = String(target?.status || scheduleStatus).toUpperCase();
        const fanpageId = target?.fanpageId;

        if (fanpageId != null && PUBLISHED_STATUSES.has(targetStatus)) {
          const key = String(fanpageId);
          counts[key] = (counts[key] || 0) + 1;
        }
      });

      return counts;
    }, {});
  },
};
