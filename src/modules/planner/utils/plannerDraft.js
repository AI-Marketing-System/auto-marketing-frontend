/**
 * Dọn bản nháp còn sót trong localStorage của phiên bản trước.
 *
 * Bản nháp giờ nằm trên máy chủ (bảng `workspace_plan_drafts`), mỗi workspace một bản. Phiên bản cũ
 * lưu ở localStorage theo key `marqops.planner.draft.v1.<workspaceId>`.
 *
 * XOÁ chứ không đẩy lên máy chủ. Lý do: bug của bản cũ (effect tự lưu phụ thuộc [plan, workspaceId])
 * đã COPY nháp của workspace A sang key của workspace B, và hàm lưu ghi field `workspaceId` bằng id
 * của route HIỆN TẠI — nghĩa là chính field tự khai chủ sở hữu trong dữ liệu cũng đã bị ghi thành id
 * đích. Blob sai và blob đúng vì thế không thể phân biệt được. Đẩy chúng lên DB sẽ biến dữ liệu bẩn
 * cục bộ thành dữ liệu bẩn dùng chung và lâu dài. Bản nháp thì luôn tạo lại được bằng cách phân tích
 * lại, nên xoá là lựa chọn an toàn duy nhất.
 */

const LEGACY_DRAFT_KEY_PREFIX = 'marqops.planner.draft.v';
const PURGE_FLAG_KEY = 'marqops.planner.draft.purged.v1';

/** @returns {number} số key đã xoá */
export function purgeLegacyLocalDrafts() {
  try {
    if (window.localStorage.getItem(PURGE_FLAG_KEY)) return 0;

    // Thu key trước rồi mới xoá: removeItem giữa lúc duyệt theo index làm các index dịch lại và
    // âm thầm bỏ sót key.
    const keys = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(LEGACY_DRAFT_KEY_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => window.localStorage.removeItem(key));

    window.localStorage.setItem(PURGE_FLAG_KEY, new Date().toISOString());
    return keys.length;
  } catch (err) {
    // localStorage bị tắt hoặc Safari private mode: không có gì để dọn.
    return 0;
  }
}
