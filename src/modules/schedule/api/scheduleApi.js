import { requestJson } from '../../../services/Api';

export const scheduleApi = {
  listByCampaign: (baseUrl, campaignId) =>
    requestJson(`/schedules?campaignId=${campaignId}`, { method: 'GET' }, baseUrl),
  listByWorkspace: (baseUrl, workspaceId) =>
    requestJson(`/schedules?workspaceId=${workspaceId}`, { method: 'GET' }, baseUrl),
  listAvailablePosts: (baseUrl, workspaceId) =>
    requestJson(`/posts/available?workspaceId=${workspaceId}`, { method: 'GET' }, baseUrl),
  listAvailablePostsByCampaign: (baseUrl, campaignId) =>
    requestJson(`/posts/available?campaignId=${campaignId}`, { method: 'GET' }, baseUrl),
  createSchedule: (baseUrl, payload) =>
    requestJson('/schedules', { method: 'POST', body: JSON.stringify(payload) }, baseUrl),

  /** US-35: Chỉnh sửa thời gian đăng (chỉ khi WAITING) */
  updateSchedule: (baseUrl, scheduleId, payload) =>
    requestJson(`/schedules/${scheduleId}`, { method: 'PUT', body: JSON.stringify(payload) }, baseUrl),

  /** US-36: Hủy lịch đăng */
  cancelSchedule: (baseUrl, scheduleId) =>
    requestJson(`/schedules/${scheduleId}`, { method: 'DELETE' }, baseUrl),

  /** US-38: Lấy trạng thái từng fanpage target */
  getPostTargets: (baseUrl, scheduledPostId) =>
    requestJson(`/post-targets?scheduledPostId=${scheduledPostId}`, { method: 'GET' }, baseUrl),

  /** US-37: Thêm fanpage vào schedule đã tồn tại (chỉ khi WAITING) */
  addPostTarget: (baseUrl, payload) =>
    requestJson('/post-targets', { method: 'POST', body: JSON.stringify(payload) }, baseUrl),

  /** Xóa bài viết đã đăng trên Facebook */
  deletePublishedFbPost: (baseUrl, targetId) =>
    requestJson(`/publish/target/${targetId}`, { method: 'DELETE' }, baseUrl),
};

