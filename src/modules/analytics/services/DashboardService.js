import { requestJson } from '../../../services/Api';

const getCollection = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.content)) return response.data.content;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.items)) return response.items;
  return [];
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
