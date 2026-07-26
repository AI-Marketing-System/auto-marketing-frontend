import { requestJson } from '../../../services/Api';

export const assertApiSuccess = (response, fallbackMessage = 'Yêu cầu không thành công') => {
  if (response && response.success === false) {
    throw new Error(response.message || fallbackMessage);
  }
  return response;
};

/** Chuẩn hoá nhẹ ở tầng api; việc gắn id ổn định và chuẩn hoá sâu do plannerPlanModel làm. */
export const parseWorkspacePlanResponse = (response) => {
  assertApiSuccess(response, 'Không thể phân tích workspace');

  const payload = response?.data ?? response;
  return {
    workspaceName: payload?.workspaceName ?? '',
    workspaceDescription: payload?.workspaceDescription ?? '',
    businessSummary: payload?.businessSummary ?? '',
    targetAudience: payload?.targetAudience ?? '',
    brandTone: payload?.brandTone ?? '',
    missingInformation: Array.isArray(payload?.missingInformation)
      ? payload.missingInformation.filter(Boolean)
      : [],
    campaigns: Array.isArray(payload?.campaigns) ? payload.campaigns : [],
  };
};

/**
 * Backend nhận `files` (part lặp lại) và `documentIds` (param lặp lại) trong cùng một request
 * multipart, cần ít nhất một trong hai.
 *
 * KHÔNG thêm Blob rỗng khi không có file mới: backend coi `files` là optional, còn một part rỗng sẽ
 * trúng nhánh 400 "file rỗng".
 */
export const buildAnalyzeFormData = ({ files = [], documentIds = [] }) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  documentIds.forEach((id) => formData.append('documentIds', String(id)));
  return formData;
};

export const plannerApi = {
  /**
   * Lời gọi đồng bộ và chậm (thường 15-90 giây) vì backend phải bóc tách tài liệu rồi chờ AI sinh
   * toàn bộ kế hoạch. Không có API job/polling.
   *
   * `signal` đi xuyên tới `fetch` qua phần spread `...options` trong requestJson, nên huỷ bằng
   * AbortController hoạt động mà không cần sửa services/Api.js.
   */
  analyze: (baseUrl, workspaceId, formData, signal) =>
    requestJson(
      `/workspaces/${workspaceId}/planner/analyze`,
      { method: 'POST', body: formData, isFormData: true, signal },
      baseUrl
    ),
};

/**
 * Bản nháp đang lưu trên máy chủ.
 *
 * `data` rỗng nghĩa là workspace này chưa có nháp — đó là trạng thái bình thường, không phải lỗi,
 * nên backend trả 200 chứ không 404.
 */
export const parsePlanDraftResponse = (response) => {
  assertApiSuccess(response, 'Không thể tải bản nháp');
  return response?.data ?? null;
};

export const planDraftApi = {
  get: (baseUrl, workspaceId, signal) =>
    requestJson(`/workspaces/${workspaceId}/planner/draft`, { method: 'GET', signal }, baseUrl),

  /** @param {{plan: object, source?: object, analyzedAt?: string}} body */
  save: (baseUrl, workspaceId, body, signal) =>
    requestJson(
      `/workspaces/${workspaceId}/planner/draft`,
      { method: 'PUT', body: JSON.stringify(body), signal },
      baseUrl
    ),

  remove: (baseUrl, workspaceId) =>
    requestJson(`/workspaces/${workspaceId}/planner/draft`, { method: 'DELETE' }, baseUrl),
};
