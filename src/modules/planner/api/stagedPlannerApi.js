import { requestJson, getApiBaseUrl } from '../../../services/Api';

export const assertApiSuccess = (response, fallbackMessage = 'Yêu cầu không thành công') => {
  if (response && response.success === false) {
    throw new Error(response.message || fallbackMessage);
  }
  return response;
};

/**
 * API wrapper cho staged generation flow (backend StagedPlannerController).
 *
 * Backend response format: { success: boolean, message: string, data: T }
 * Backend trả về 200 với data rỗng khi workspace chưa có draft — đó là trạng thái bình thường.
 */
const baseUrl = () => getApiBaseUrl();

/**
 * Bước 0: Khởi tạo bản nháp với seed input + tài liệu tuỳ chọn.
 * @param {{ seedInput?: string, files?: File[], documentIds?: number[] }} params
 */
export const initDraft = async (workspaceId, { seedInput, files = [], documentIds = [] }) => {
  const formData = new FormData();
  if (seedInput) formData.append('seedInput', seedInput);
  files.forEach((file) => formData.append('files', file));
  documentIds.forEach((id) => formData.append('documentIds', String(id)));

  const response = await requestJson(
    `/workspaces/${workspaceId}/planner/stage/init`,
    { method: 'POST', body: formData, isFormData: true },
    baseUrl()
  );
  return assertApiSuccess(response);
};

/** Bước 1: Sinh campaigns */
export const generateCampaigns = async (workspaceId) => {
  const response = await requestJson(
    `/workspaces/${workspaceId}/planner/stage/campaigns`,
    { method: 'POST' },
    baseUrl()
  );
  return assertApiSuccess(response);
};

/** Regenerate campaigns với chỉ dẫn bổ sung */
export const regenerateCampaigns = async (workspaceId, body) => {
  const response = await requestJson(
    `/workspaces/${workspaceId}/planner/stage/campaigns/regenerate`,
    { method: 'POST', body: JSON.stringify(body) },
    baseUrl()
  );
  return assertApiSuccess(response);
};

/** Bước 2: Sinh topics cho 1 campaign */
export const generateTopics = async (workspaceId, body) => {
  const response = await requestJson(
    `/workspaces/${workspaceId}/planner/stage/topics`,
    { method: 'POST', body: JSON.stringify(body) },
    baseUrl()
  );
  return assertApiSuccess(response);
};

/** Regenerate topics cho 1 campaign */
export const regenerateTopics = async (workspaceId, body) => {
  const response = await requestJson(
    `/workspaces/${workspaceId}/planner/stage/topics/regenerate`,
    { method: 'POST', body: JSON.stringify(body) },
    baseUrl()
  );
  return assertApiSuccess(response);
};

/** Bước 3: Sinh posts cho 1 topic */
export const generatePosts = async (workspaceId, body) => {
  const response = await requestJson(
    `/workspaces/${workspaceId}/planner/stage/posts`,
    { method: 'POST', body: JSON.stringify(body) },
    baseUrl()
  );
  return assertApiSuccess(response);
};

/** Regenerate posts cho 1 topic */
export const regeneratePosts = async (workspaceId, body) => {
  const response = await requestJson(
    `/workspaces/${workspaceId}/planner/stage/posts/regenerate`,
    { method: 'POST', body: JSON.stringify(body) },
    baseUrl()
  );
  return assertApiSuccess(response);
};

/** Xác nhận giai đoạn, chuyển stage */
export const confirmStage = async (workspaceId, stage) => {
  const response = await requestJson(
    `/workspaces/${workspaceId}/planner/stage/confirm`,
    { method: 'POST', body: JSON.stringify({ stage }) },
    baseUrl()
  );
  return assertApiSuccess(response);
};

/** Chốt kế hoạch (stage → CONFIRMED) */
export const finalizePlan = async (workspaceId) => {
  const response = await requestJson(
    `/workspaces/${workspaceId}/planner/stage/finalize`,
    { method: 'POST' },
    baseUrl()
  );
  return assertApiSuccess(response);
};

/** Cập nhật sườn cấu trúc draft (khi chỉnh sửa/thêm/xoá thủ công bằng tay) */
export const updateDraftStructure = async (workspaceId, updatedPlan) => {
  const response = await requestJson(
    `/workspaces/${workspaceId}/planner/stage/structure`,
    { method: 'PUT', body: JSON.stringify(updatedPlan) },
    baseUrl()
  );
  return assertApiSuccess(response);
};
