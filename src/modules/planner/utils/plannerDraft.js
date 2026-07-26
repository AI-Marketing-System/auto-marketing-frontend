/**
 * Lưu bản nháp kế hoạch vào localStorage.
 *
 * Backend KHÔNG lưu kế hoạch (không có bảng DB, không có endpoint save/get), nên bản nháp trên máy
 * người dùng là thứ duy nhất giữ được kết quả qua một lần F5. Mất nó nghĩa là phải gọi lại Gemini —
 * vừa mất thời gian chờ vừa tốn tiền.
 */

export const DRAFT_VERSION = 1;

/**
 * Version xuất hiện hai lần có chủ đích: trong KEY để một shape tương lai không đụng vào dữ liệu v1
 * (key cũ chỉ bị bỏ mồ côi, không gây crash), và trong VALUE để reader tương lai có thể migrate mềm.
 */
export const draftKey = (workspaceId) => `marqops.planner.draft.v${DRAFT_VERSION}.${workspaceId}`;

export function loadDraft(workspaceId) {
  try {
    const raw = window.localStorage.getItem(draftKey(workspaceId));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== DRAFT_VERSION || !parsed.plan) return null;
    if (!Array.isArray(parsed.plan.campaigns)) return null;

    return parsed;
  } catch (err) {
    // JSON hỏng, Safari private mode, hoặc localStorage bị tắt: coi như không có nháp.
    return null;
  }
}

export function saveDraft(workspaceId, { plan, analyzedAt, source }) {
  try {
    const savedAt = new Date().toISOString();
    window.localStorage.setItem(
      draftKey(workspaceId),
      JSON.stringify({
        version: DRAFT_VERSION,
        workspaceId: String(workspaceId),
        savedAt,
        analyzedAt: analyzedAt || savedAt,
        // File objects không serialize được nên chỉ lưu tên để hiển thị. Sau khi F5, thanh nháp mời
        // "Phân tích lại" thay vì âm thầm gửi lại một request nó không thể tái tạo.
        source: source || { documentIds: [], fileNames: [] },
        plan,
      })
    );
    return savedAt;
  } catch (err) {
    // QuotaExceededError: kế hoạch quá lớn hoặc bộ nhớ trình duyệt đã đầy.
    return null;
  }
}

export function clearDraft(workspaceId) {
  try {
    window.localStorage.removeItem(draftKey(workspaceId));
    return true;
  } catch (err) {
    return false;
  }
}
