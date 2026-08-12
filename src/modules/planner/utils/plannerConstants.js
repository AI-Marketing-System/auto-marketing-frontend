/**
 * Hằng số và validate cho AI Workspace Planner.
 *
 * Đây là NƠI DUY NHẤT chứa các giới hạn, khớp với backend `ai.workspace-planner.*`:
 *   max-files = 10, max-file-size-mb = 20, max-total-size-mb = 40
 * Không bao giờ hiển thị số của Tomcat (max-file-size 25MB / max-request-size 50MB) cho người dùng —
 * đó là lớp guard bên ngoài, luôn cao hơn giới hạn của planner nên thông báo 413 tiếng Việt của
 * planner mới là cái người dùng gặp.
 */

export const PLANNER_LIMITS = {
  maxFiles: 10,
  maxFileSizeMB: 20,
  maxTotalMB: 40,
};

export const PLANNER_LIMITS_LABEL =
  `Tối đa ${PLANNER_LIMITS.maxFiles} tài liệu, mỗi tài liệu ≤ ${PLANNER_LIMITS.maxFileSizeMB}MB, ` +
  `tổng ≤ ${PLANNER_LIMITS.maxTotalMB}MB`;

/** Định dạng AI đọc được. Backend còn nhận .xls/.json/.xml nhưng đây là bộ chính người dùng dùng. */
export const PLANNER_ACCEPTED_EXTENSIONS = ['PDF', 'DOCX', 'TXT', 'CSV', 'XLSX'];
export const PLANNER_ACCEPT_ATTRIBUTE = '.pdf,.docx,.txt,.csv,.xlsx';
export const PLANNER_FORMATS_LABEL = 'PDF · DOCX · TXT · CSV · XLSX';

/** Thư viện tài liệu vẫn cho lưu nhiều định dạng hơn mức AI đọc được. */
export const DOCUMENT_LIBRARY_EXTENSIONS = [
  'PDF', 'DOCX', 'DOC', 'XLSX', 'XLS', 'PPTX', 'PPT', 'TXT', 'CSV', 'JPG', 'JPEG', 'PNG',
];
export const DOCUMENT_LIBRARY_ACCEPT_ATTRIBUTE =
  '.pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt,.csv,.jpg,.jpeg,.png';
export const DOCUMENT_LIBRARY_MAX_FILE_SIZE_MB = 25;

export const FILE_TYPE_ICONS = {
  PDF: { icon: '📄', color: '#ef4444' },
  DOCX: { icon: '📝', color: '#3b82f6' },
  DOC: { icon: '📝', color: '#3b82f6' },
  XLSX: { icon: '📊', color: '#22c55e' },
  XLS: { icon: '📊', color: '#22c55e' },
  CSV: { icon: '📈', color: '#16a34a' },
  PPTX: { icon: '📽️', color: '#f97316' },
  PPT: { icon: '📽️', color: '#f97316' },
  TXT: { icon: '📃', color: '#6b7280' },
  JPG: { icon: '🖼️', color: '#a855f7' },
  JPEG: { icon: '🖼️', color: '#a855f7' },
  PNG: { icon: '🖼️', color: '#a855f7' },
};

export const DEFAULT_FILE_TYPE_ICON = { icon: '📄', color: '#6b7280' };

export const CONFIDENCE_LEVELS = [
  { min: 0.75, key: 'high', label: 'Độ tin cậy cao', color: '#16a34a', bg: '#dcfce7' },
  { min: 0.5, key: 'medium', label: 'Độ tin cậy trung bình', color: '#d97706', bg: '#fef3c7' },
  { min: 0, key: 'low', label: 'Độ tin cậy thấp', color: '#dc2626', bg: '#fee2e2' },
];

/**
 * Phải kiểm tra `typeof v === 'number'`, KHÔNG kiểm tra truthy: `confidence: 0` là câu trả lời
 * "rất thấp" hợp lệ và phải hiện 0% màu đỏ, không phải "—". Backend khai `double` nguyên thuỷ nên 0
 * đúng là giá trị nhận được khi AI bỏ trống trường này.
 */
export const getConfidenceLevel = (value) =>
  (typeof value === 'number' && Number.isFinite(value))
    ? CONFIDENCE_LEVELS.find((level) => value >= level.min) || CONFIDENCE_LEVELS[CONFIDENCE_LEVELS.length - 1]
    : null;

/**
 * Các mốc hiển thị tiến trình, tính theo giây đã trôi qua.
 * Backend không có event tiến trình nào (một lời gọi đồng bộ dài), nên đây là mô tả trung thực theo
 * thời gian chứ không phải phần trăm thật.
 */
export const ANALYZE_STAGES = [
  { atSecond: 0, step: 'Bước 1/4', label: 'Đang gửi tài liệu lên máy chủ…' },
  { atSecond: 6, step: 'Bước 2/4', label: 'Đang đọc và bóc tách nội dung tài liệu…' },
  { atSecond: 18, step: 'Bước 3/4', label: 'AI đang phân tích ngành hàng, khách hàng mục tiêu và giọng thương hiệu…' },
  { atSecond: 40, step: 'Bước 4/4', label: 'AI đang dựng bộ khung Chiến dịch → Chủ đề → Bài viết…' },
];

export const ANALYZE_EXPECTED_SECONDS = 90;
export const ANALYZE_SLOW_WARNING_SECOND = 100;
/** Không bao giờ để thanh tiến trình chạm 100% trước khi có phản hồi thật. */
export const ANALYZE_PROGRESS_CEILING = 95;

const MB = 1024 * 1024;

export const getFileExtension = (fileName) => {
  if (!fileName || typeof fileName !== 'string') return '';
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop().toUpperCase() : '';
};

export const isPlannerReadableExtension = (extension) =>
  PLANNER_ACCEPTED_EXTENSIONS.includes((extension || '').toUpperCase());

/** Tài liệu đã lưu có thể lớn hơn giới hạn planner vì Cloudinary cho upload tới 25MB. */
export const isDocumentSelectable = (doc) => {
  if (!doc) return false;
  if (!isPlannerReadableExtension(getFileExtension(doc.name))) return false;
  if (typeof doc.fileSize === 'number' && doc.fileSize > PLANNER_LIMITS.maxFileSizeMB * MB) return false;
  return true;
};

export const getUnselectableReason = (doc) => {
  if (!isPlannerReadableExtension(getFileExtension(doc?.name))) {
    return `AI Planner chưa đọc được định dạng này (chỉ ${PLANNER_FORMATS_LABEL})`;
  }
  if (typeof doc?.fileSize === 'number' && doc.fileSize > PLANNER_LIMITS.maxFileSizeMB * MB) {
    return `Tài liệu vượt quá ${PLANNER_LIMITS.maxFileSizeMB}MB nên AI Planner không phân tích được`;
  }
  return '';
};

const toMB = (bytes) => (bytes / MB).toFixed(1);

/**
 * Kiểm tra lựa chọn trước khi gửi.
 *
 * `uploadBytes` (chỉ file mới) được tách khỏi `totalBytes` (file mới + tài liệu đã chọn) một cách có
 * chủ đích: nếu người dùng chỉ tick tài liệu đã có trên server thì `uploadBytes` bằng 0 và quy tắc
 * dung lượng gửi không được chặn oan họ.
 */
export function validatePlannerSelection({ pendingFiles = [], selectedDocIds = [], documents = [] }) {
  const errors = [];
  const warnings = [];

  const selectedDocs = documents.filter((doc) => selectedDocIds.includes(doc.id));
  const fileCount = pendingFiles.length + selectedDocIds.length;

  const uploadBytes = pendingFiles.reduce((sum, item) => sum + (item.size || 0), 0);
  const storedBytes = selectedDocs.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);
  const totalBytes = uploadBytes + storedBytes;

  if (fileCount > PLANNER_LIMITS.maxFiles) {
    errors.push(
      `Bạn đang chọn ${fileCount} tài liệu, tối đa ${PLANNER_LIMITS.maxFiles} tài liệu mỗi lần ` +
      `phân tích. Hãy bỏ bớt ${fileCount - PLANNER_LIMITS.maxFiles} tài liệu.`
    );
  }

  pendingFiles.forEach((item) => {
    if (!isPlannerReadableExtension(item.ext)) {
      errors.push(
        `File "${item.name}" có định dạng .${(item.ext || '?').toLowerCase()} — ` +
        `AI Planner chỉ đọc được ${PLANNER_FORMATS_LABEL}.`
      );
      return;
    }
    if (!item.size) {
      errors.push(`File "${item.name}" rỗng (0 KB). Hãy kiểm tra lại file.`);
      return;
    }
    if (item.size > PLANNER_LIMITS.maxFileSizeMB * MB) {
      errors.push(
        `File "${item.name}" nặng ${toMB(item.size)}MB, ` +
        `vượt giới hạn ${PLANNER_LIMITS.maxFileSizeMB}MB mỗi file.`
      );
    }
  });

  if (totalBytes > PLANNER_LIMITS.maxTotalMB * MB) {
    errors.push(
      `Tổng dung lượng tài liệu là ${toMB(totalBytes)}MB, vượt giới hạn ` +
      `${PLANNER_LIMITS.maxTotalMB}MB mỗi lần phân tích. Hãy chia thành nhiều lần.`
    );
  }

  const selectedNames = new Set(selectedDocs.map((doc) => doc.name));
  pendingFiles.forEach((item) => {
    if (selectedNames.has(item.name)) {
      warnings.push(`"${item.name}" trùng tên với tài liệu đã có trong thư viện — AI sẽ đọc cả hai bản.`);
    }
  });

  return {
    fileCount,
    uploadBytes,
    storedBytes,
    totalBytes,
    errors,
    warnings,
    canSubmit: fileCount > 0 && errors.length === 0,
  };
}
