import { requestJson } from '../../../services/Api';

const WS_PATH = '/workspaces';
const SA_PATH = '/social-accounts';

/**
 * Lấy danh sách Fanpage đã liên kết với Workspace.
 * @param {number} workspaceId
 * @returns {Promise<Array>} Danh sách WorkspaceFanpageResponse
 */
export async function getWorkspaceFanpages(workspaceId) {
  const res = await requestJson(`${WS_PATH}/${workspaceId}/fanpages`);
  return res?.data || [];
}

/**
 * Thêm Fanpage vào Workspace.
 * @param {number} workspaceId
 * @param {number} fanpageId
 * @returns {Promise<Object>} WorkspaceFanpageResponse
 */
export async function addFanpageToWorkspace(workspaceId, fanpageId) {
  const res = await requestJson(`${WS_PATH}/${workspaceId}/fanpages`, {
    method: 'POST',
    body: JSON.stringify({ fanpageId }),
  });
  return res?.data;
}

/**
 * Xoá Fanpage khỏi Workspace.
 * @param {number} workspaceId
 * @param {number} fanpageId
 */
export async function removeFanpageFromWorkspace(workspaceId, fanpageId) {
  await requestJson(`${WS_PATH}/${workspaceId}/fanpages/${fanpageId}`, {
    method: 'DELETE',
  });
}

/**
 * Lấy danh sách Fanpage có sẵn từ một Social Account (đã sync từ FB).
 * @param {number} socialAccountId
 * @returns {Promise<Array>} Danh sách FanpageResponse
 */
export async function getAvailableFanpages(socialAccountId) {
  const res = await requestJson(`${SA_PATH}/${socialAccountId}/available-fanpages`);
  return res?.data || [];
}
