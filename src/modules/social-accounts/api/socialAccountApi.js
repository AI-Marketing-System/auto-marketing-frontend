import { requestJson } from '../../../services/Api';

const BASE_PATH = '/social-accounts';

/**
 * Lấy OAuth URL để mở popup kết nối Facebook.
 * @returns {Promise<string>} OAuth URL
 */
export async function getConnectUrl() {
  const res = await requestJson(`${BASE_PATH}/connect-url`);
  return res?.data?.url;
}

/**
 * Lấy danh sách Social Accounts của user hiện tại.
 * @returns {Promise<Array>} Danh sách SocialAccountResponse
 */
export async function listSocialAccounts() {
  const res = await requestJson(BASE_PATH);
  return res?.data || [];
}

/**
 * Lấy chi tiết 1 Social Account.
 * @param {number} id
 * @returns {Promise<Object>} SocialAccountResponse
 */
export async function getSocialAccount(id) {
  const res = await requestJson(`${BASE_PATH}/${id}`);
  return res?.data;
}

/**
 * Ngắt kết nối Social Account.
 * @param {number} id
 */
export async function disconnectSocialAccount(id) {
  await requestJson(`${BASE_PATH}/${id}`, { method: 'DELETE' });
}

/**
 * Đồng bộ danh sách Fanpage từ Facebook Graph API.
 * @param {number} socialAccountId
 * @returns {Promise<Array>} Danh sách FanpageResponse
 */
export async function syncFanpages(socialAccountId) {
  const res = await requestJson(`${BASE_PATH}/${socialAccountId}/sync-fanpages`, {
    method: 'POST',
  });
  return res?.data || [];
}

/**
 * Lấy danh sách Fanpage từ DB (không gọi Facebook).
 * @param {number} socialAccountId
 * @returns {Promise<Array>} Danh sách FanpageResponse
 */
export async function getFanpages(socialAccountId) {
  const res = await requestJson(`${BASE_PATH}/${socialAccountId}/fanpages`);
  return res?.data || [];
}
