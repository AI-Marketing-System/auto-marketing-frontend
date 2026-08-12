import { PLANNER_FORMATS_LABEL, PLANNER_LIMITS, PLANNER_LIMITS_LABEL } from './plannerConstants';

/**
 * Toàn bộ chữ hiển thị của trang AI Workspace Planner.
 * Gom vào object hằng theo đúng kiểu ACTION_MODAL_COPY trong campaigns/utils/campaignUtils.js.
 */

export const PLANNER_INTRO = {
  eyebrow: 'AI Workspace Planner',
  title: 'Để AI đọc tài liệu của bạn và đề xuất bộ khung kế hoạch marketing',
  lead:
    'AI Workspace Planner đọc các tài liệu bạn cung cấp (brief thương hiệu, catalogue sản phẩm, ' +
    'bảng giá, báo cáo khách hàng…) rồi đề xuất một bản nháp kế hoạch marketing cho workspace này.',

  readsTitle: 'AI đọc gì?',
  reads: [
    'Các tài liệu bạn tích chọn trong thư viện tài liệu của workspace.',
    'Các file bạn kéo thả thêm ngay tại trang này (có thể chọn lưu vào thư viện hoặc không).',
    `Định dạng đọc được: ${PLANNER_FORMATS_LABEL}. ${PLANNER_LIMITS_LABEL}.`,
  ],

  producesTitle: 'AI trả về gì?',
  produces: [
    'Tổng quan workspace: mô tả doanh nghiệp, khách hàng mục tiêu, giọng điệu thương hiệu.',
    'Danh sách thông tin còn thiếu mà AI cần bạn bổ sung để kế hoạch chính xác hơn.',
    'Bộ khung Chiến dịch → Chủ đề → Bài viết. Mỗi bài gồm tiêu đề, mục tiêu, tóm tắt nội dung, ' +
      'gợi ý hình ảnh, hashtag, kênh đăng, thời điểm đăng và độ tin cậy của AI.',
  ],

  notTitle: 'AI KHÔNG làm gì?',
  not: [
    'Không viết caption Facebook hoàn chỉnh — đây chỉ là bộ khung để bạn triển khai tiếp.',
    'Không tạo Chiến dịch, Chủ đề hay Bài viết thật trong hệ thống.',
    'Không tự đăng bài và không thay đổi bất cứ dữ liệu nào đang có trong workspace của bạn.',
  ],

  durationNote:
    'Một lần phân tích thường mất 15–90 giây vì AI phải đọc toàn bộ tài liệu. ' +
    'Bạn có thể huỷ giữa chừng bất cứ lúc nào.',
  draftNote:
    'Kết quả và mọi chỉnh sửa của bạn được tự động lưu nháp trên máy chủ theo từng workspace, ' +
    'nên tải lại trang (F5) sẽ không mất dữ liệu.',

  steps: [
    { n: 1, title: 'Chọn tài liệu', body: 'Tích chọn tài liệu đã có hoặc kéo thả file mới.' },
    { n: 2, title: 'AI phân tích', body: 'Đợi 15–90 giây, có thể huỷ bất cứ lúc nào.' },
    {
      n: 3,
      title: 'Xem & chỉnh sửa bản nháp',
      body: 'Sửa trực tiếp mọi nội dung, thêm hoặc bớt chiến dịch, chủ đề, bài viết.',
    },
  ],

  collapseLabel: 'Thu gọn phần giới thiệu',
  expandLabel: 'AI Workspace Planner là gì?',
};

export const PLANNER_NOT_APPLIED_NOTICE = {
  title: 'Đây là bản xem trước — chưa tạo gì thật trong hệ thống',
  body:
    'AI Planner chỉ tạo bản nháp gợi ý. Chưa có Chiến dịch, Chủ đề hay Bài viết nào được tạo trong ' +
    'workspace của bạn. Bạn có thể chỉnh sửa và lưu nháp tại đây; để đưa vào hệ thống, hãy dùng nút ' +
    '"Tạo chiến dịch" ở trang Chiến dịch.',
  futureNote: 'Chức năng "Tạo Campaign thật từ bản nháp" đang được phát triển và chưa khả dụng.',
};

export const PLANNER_SECTION_LABELS = {
  pageTitle: 'AI Workspace Planner',
  sources: 'Bước 1 · Chọn nguồn tài liệu',
  library: 'Thư viện tài liệu của workspace',
  newFiles: 'File thêm cho lần phân tích này',
  analyze: 'Phân tích với AI',
  analyzing: 'Đang phân tích…',
  result: 'Bản nháp kế hoạch do AI đề xuất',
  overview: 'Tổng quan workspace',
  missingInfo: 'Thông tin AI còn thiếu',
  reanalyze: 'Phân tích lại',
  discardDraft: 'Xoá bản nháp',
  copyJson: 'Sao chép kế hoạch (JSON)',
  downloadJson: 'Tải xuống .json',
  backToCampaigns: 'Về trang chiến dịch',
  expandAll: 'Mở tất cả',
  collapseAll: 'Thu gọn tất cả',
  addCampaign: 'Thêm chiến dịch',
  addTopic: 'Thêm chủ đề',
  addPost: 'Thêm bài viết',
};

export const PLANNER_FIELD_LABELS = {
  workspaceName: 'Tên workspace theo AI',
  workspaceDescription: 'Mô tả workspace',
  businessSummary: 'Tóm tắt doanh nghiệp',
  targetAudience: 'Khách hàng mục tiêu',
  brandTone: 'Giọng điệu thương hiệu',
  campaignName: 'Tên chiến dịch',
  objective: 'Mục tiêu',
  description: 'Mô tả',
  startDate: 'Ngày bắt đầu',
  endDate: 'Ngày kết thúc',
  topicName: 'Tên chủ đề',
  postTitle: 'Tiêu đề bài viết',
  contentBrief: 'Tóm tắt nội dung',
  mediaSuggestion: 'Gợi ý hình ảnh / video',
  hashtagsSuggestion: 'Hashtag gợi ý',
  platformSuggestion: 'Kênh đăng gợi ý',
  scheduleSuggestion: 'Thời điểm đăng gợi ý',
  note: 'Ghi chú của AI',
  confidence: 'Độ tin cậy',
};

export const PLANNER_EMPTY_STATES = {
  noMissingInfo: 'AI không báo thiếu thông tin nào. Tài liệu của bạn khá đầy đủ.',
  noCampaigns:
    'AI không đề xuất được chiến dịch nào từ tài liệu này. Hãy thử bổ sung tài liệu chi tiết hơn ' +
    'về sản phẩm và khách hàng.',
  noTopics: 'Chiến dịch này chưa có chủ đề. Bấm "Thêm chủ đề" để tự thêm.',
  noPosts: 'Chủ đề này chưa có bài viết. Bấm "Thêm bài viết" để tự thêm.',
  emptyField: '(AI không đưa ra nội dung — bấm để tự điền)',
  noDocuments: 'Chưa có tài liệu nào',
  noDocumentsHint: 'Kéo thả file vào khu vực upload để thêm tài liệu',
  noSearchResult: 'Không tìm thấy tài liệu nào khớp từ khoá.',
};

export const PLANNER_PROGRESS_COPY = {
  honesty:
    'Không thể hiển thị % chính xác vì máy chủ chỉ trả kết quả một lần khi xong. ' +
    'Thời gian thường là 15–90 giây.',
  slowWarning:
    'Vẫn đang chạy. Tài liệu dài có thể mất tới 2–3 phút. ' +
    'Bạn có thể huỷ và thử lại với ít tài liệu hơn.',
  cancel: 'Huỷ phân tích',
  cancelled:
    'Đã huỷ phân tích. Các tài liệu bạn chọn vẫn được giữ nguyên — ' +
    'bấm "Phân tích với AI" để thử lại.',
};

export const PLANNER_DRAFT_COPY = {
  pending: 'Đang lưu nháp…',
  saved: (time) => `● Đã lưu nháp lúc ${time}`,
  // Nháp giờ lưu trên máy chủ nên "bộ nhớ trình duyệt đã đầy" là chẩn đoán sai.
  failed:
    '⚠ Không lưu được nháp lên máy chủ — chỉnh sửa của bạn vẫn còn trên trang này. ' +
    'Hãy kiểm tra kết nối rồi sửa tiếp để lưu lại.',
  loading: 'Đang tải bản nháp đã lưu…',
  loadFailed:
    'Không tải được bản nháp đã lưu từ máy chủ. Bạn vẫn có thể chọn tài liệu và phân tích lại.',
  discardFailed: 'Không xoá được bản nháp trên máy chủ. Bản nháp vẫn còn — vui lòng thử lại.',
  restored: (time) => `Đã phục hồi bản nháp lưu lúc ${time}.`,
  discardConfirm:
    'Xoá bản nháp đã lưu? Mọi chỉnh sửa của bạn sẽ mất và bạn cần phân tích lại từ đầu.',
  reanalyzeConfirm:
    'Phân tích lại sẽ thay thế bản nháp hiện tại bằng kết quả mới từ AI. Bạn có chắc chắn?',
};

export const PLANNER_SELECTION_COPY = {
  emptyHint: 'Hãy chọn ít nhất 1 tài liệu hoặc kéo thả file mới để bắt đầu.',
  alsoSaveToLibrary: 'Đồng thời lưu các file mới vào thư viện tài liệu của workspace',
  alsoSaveHint: 'Bỏ tích nếu bạn chỉ muốn AI đọc một lần mà không lưu file lại.',
  selectAll: 'Chọn tất cả tài liệu AI đọc được',
  clearSelection: 'Bỏ chọn tất cả',
  summary: ({ fileCount, totalLabel }) => `Đã chọn ${fileCount} tài liệu · tổng ${totalLabel}`,
  limitsHint: `${PLANNER_LIMITS_LABEL}. Định dạng: ${PLANNER_FORMATS_LABEL}.`,
  dropzoneText: 'Kéo thả tài liệu vào đây, hoặc bấm để chọn file',
  dropzoneHint: 'Hỗ trợ nhiều file cùng lúc',
  dropzoneFormats: `${PLANNER_FORMATS_LABEL} — tối đa ${PLANNER_LIMITS.maxFileSizeMB}MB/file`,
  uploading: 'Đang tải lên...',
  removeFile: 'Bỏ file này',
  deleteConfirm: 'Bạn có chắc chắn muốn xóa tài liệu này?',
};

/** Ánh xạ HTTP status sang thông báo và hành động khắc phục. */
export const PLANNER_ERROR_COPY = {
  offline: {
    title: 'Mất kết nối tới máy chủ',
    body:
      'Không gửi được yêu cầu tới máy chủ. Hãy kiểm tra kết nối mạng và chắc chắn backend đang chạy, ' +
      'rồi thử lại.',
    actions: ['retry'],
  },
  400: {
    title: 'Tài liệu chưa hợp lệ',
    body:
      'Máy chủ không nhận được tài liệu hợp lệ. Nguyên nhân thường gặp: chưa chọn tài liệu nào, ' +
      'file rỗng, file có mật khẩu bảo vệ, hoặc định dạng chưa được hỗ trợ. ' +
      `Định dạng AI đọc được: ${PLANNER_FORMATS_LABEL}.`,
    actions: ['back-to-selection'],
  },
  401: {
    title: 'Phiên đăng nhập đã hết hạn',
    body: 'Bạn cần đăng nhập lại để tiếp tục. Bản nháp (nếu có) vẫn được giữ trên máy chủ.',
    actions: ['login'],
  },
  403: {
    title: 'Bạn không có quyền với workspace này',
    body:
      'Tài khoản của bạn không được phép phân tích workspace này. Hãy liên hệ chủ workspace để được ' +
      'thêm quyền. Nếu bạn vừa bị đăng xuất, hãy đăng nhập lại rồi thử lại.',
    actions: ['login', 'back-to-campaigns'],
  },
  404: {
    title: 'Không tìm thấy workspace hoặc tài liệu',
    body:
      'Workspace hoặc một trong các tài liệu bạn chọn không còn tồn tại (có thể đã bị xoá bởi người ' +
      'khác). Hãy tải lại danh sách tài liệu và chọn lại.',
    actions: ['reload-documents'],
  },
  413: {
    title: 'Tài liệu quá lớn',
    body:
      `Tổng dung lượng vượt quá giới hạn của máy chủ. Giới hạn: ${PLANNER_LIMITS_LABEL.toLowerCase()}. ` +
      'Hãy bỏ bớt file hoặc chia thành nhiều lần phân tích.',
    actions: ['back-to-selection'],
  },
  415: {
    title: 'Yêu cầu không đúng định dạng',
    body: 'Máy chủ yêu cầu dữ liệu dạng multipart/form-data. Hãy tải lại trang rồi thử lại.',
    actions: ['retry'],
  },
  422: {
    title: 'AI trả về kế hoạch chưa đạt yêu cầu',
    body:
      'AI đã đọc được tài liệu nhưng bản kế hoạch tạo ra không vượt qua bước kiểm tra. Thường là do ' +
      'tài liệu còn quá ít thông tin về sản phẩm, khách hàng hoặc mục tiêu kinh doanh. Hãy bổ sung ' +
      'tài liệu chi tiết hơn rồi thử lại.',
    actions: ['retry', 'back-to-selection'],
  },
  500: {
    title: 'Máy chủ gặp lỗi không mong muốn',
    body:
      'Đã có lỗi phía máy chủ. Hãy thử lại sau ít phút. Nếu vẫn lỗi, liên hệ quản trị viên và cho ' +
      'biết thời điểm bạn gặp lỗi.',
    actions: ['retry', 'contact-admin'],
  },
  502: {
    title: 'AI tạm thời không phản hồi đúng',
    body:
      'Dịch vụ AI trả về dữ liệu không đọc được. Lỗi này thường chỉ xảy ra tạm thời — trong phần lớn ' +
      'trường hợp chỉ cần bấm "Thử lại" là được.',
    actions: ['retry'],
    retryEmphasis: true,
  },
  503: {
    title: 'Chức năng AI chưa được cấu hình',
    body:
      'Máy chủ chưa có khoá API của dịch vụ AI nên chưa thể phân tích. Hãy liên hệ quản trị viên để ' +
      'cấu hình GEMINI_API_KEY.',
    actions: ['contact-admin'],
  },
  504: {
    title: 'AI phản hồi quá lâu',
    body:
      'Dịch vụ AI xử lý vượt quá thời gian chờ cho phép. Hãy thử lại với ít tài liệu hơn hoặc tài ' +
      'liệu ngắn hơn.',
    actions: ['back-to-selection', 'retry'],
  },
  default: {
    title: 'Không phân tích được',
    body: 'Đã có lỗi không xác định khi phân tích. Hãy thử lại; nếu vẫn lỗi, liên hệ quản trị viên.',
    actions: ['retry', 'contact-admin'],
  },
};

export const PLANNER_ERROR_ACTION_LABELS = {
  retry: 'Thử lại',
  'back-to-selection': 'Chọn lại tài liệu',
  'reload-documents': 'Tải lại danh sách tài liệu',
  'back-to-campaigns': 'Về trang chiến dịch',
  login: 'Đăng nhập lại',
  'contact-admin': 'Liên hệ quản trị viên',
};

/**
 * `AbortError` phải kiểm tra TRƯỚC, và `status === undefined` là dấu hiệu lỗi mạng: cả hai trường hợp
 * này requestJson đều throw mà không gắn `.status`.
 */
export function resolvePlannerError(err) {
  if (err?.name === 'AbortError') {
    return { kind: 'aborted' };
  }
  if (err?.status === undefined || err?.status === null) {
    return {
      kind: 'error',
      status: null,
      ...PLANNER_ERROR_COPY.offline,
      serverMessage: err?.message || '',
    };
  }

  const copy = PLANNER_ERROR_COPY[err.status] || PLANNER_ERROR_COPY.default;
  return {
    kind: 'error',
    status: err.status,
    ...copy,
    // Backend không có error code máy đọc được, chỉ có `message` tiếng Việt tự do — và message đó
    // thường CỤ THỂ hơn bất cứ copy theo status nào ta viết được, nên luôn hiển thị kèm.
    serverMessage: err?.body?.message || err?.message || '',
  };
}

export const PLANNER_UPLOAD_ERROR_COPY = {
  cloudinarySignature:
    'Lỗi xác thực Cloudinary (Invalid Signature). Vui lòng kiểm tra lại CLOUDINARY_API_SECRET trên ' +
    'server backend.',
  tooLarge: 'Kích thước file vượt quá giới hạn tải lên của máy chủ.',
  unsupported: 'Định dạng file không được máy chủ hỗ trợ.',
  fallback: 'Không thể tải tài liệu lên. Vui lòng thử lại sau.',
};
