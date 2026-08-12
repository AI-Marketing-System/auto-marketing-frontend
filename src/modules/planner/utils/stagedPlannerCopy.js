/**
 * Toàn bộ chữ hiển thị của trang AI Staged Planner (luồng 4 bước).
 * Cấu trúc tương tự plannerCopy.js — gom theo đúng kiểu object hằng
 * để dễ tìm, dễ sửa, không rải string literal trong JSX.
 */

// ─── Tiêu đề trang & thông tin chung ────────────────────────────────────────

export const STAGED_PLANNER_PAGE = {
  title: 'AI Staged Planner',
  subtitle: 'Lên kế hoạch marketing theo từng bước — AI sinh nội dung, bạn kiểm duyệt.',
  backToCampaigns: 'Về trang chiến dịch',
};

// ─── Tên 4 bước trong progress bar ──────────────────────────────────────────

export const STAGED_PLANNER_STAGES = {
  init: 'Thông tin doanh nghiệp',
  campaigns: 'Chiến dịch',
  topics: 'Chủ đề',
  posts: 'Bài viết',
  review: 'Review & Hoàn tất',
};

// ─── Bước 0: Init Form ───────────────────────────────────────────────────────

export const STAGED_PLANNER_INTRO = {
  eyebrow: 'AI Staged Planner',
  title: 'Lên kế hoạch marketing từng bước cùng AI',
  lead:
    'AI Staged Planner giúp bạn xây dựng kế hoạch marketing bài bản qua 4 bước. ' +
    'Khác với cách tạo toàn bộ một lần, luồng này cho phép bạn kiểm duyệt và điều chỉnh ' +
    'chi tiết ở từng giai đoạn trước khi sinh nội dung tiếp theo.',

  readsTitle: 'Bước 1: Khởi tạo',
  reads: [
    'Bạn cung cấp thông tin cốt lõi của doanh nghiệp (Tầm nhìn, Chân dung khách hàng...).',
    'Tải lên các tài liệu bổ sung (Brief, Catalogue...).',
    'AI sẽ đọc và phân tích bối cảnh để làm cơ sở cho các bước sau.',
  ],

  producesTitle: 'Bước 2-4: Khai triển',
  produces: [
    'Chiến dịch: AI đề xuất các chiến dịch quảng bá lớn.',
    'Chủ đề: Từ các chiến dịch đã chốt, AI sinh ra các chủ đề nhỏ hơn.',
    'Bài viết: Cuối cùng, AI tạo khung bài viết chi tiết cho từng chủ đề (tiêu đề, mục tiêu, gợi ý media...).',
  ],

  notTitle: 'Lưu ý quan trọng',
  not: [
    'Tại mỗi bước, bạn có quyền tự do chỉnh sửa, thêm bớt, hoặc yêu cầu AI sinh lại trước khi đi tiếp.',
    'Mọi kết quả đang xem chỉ là bản nháp. Chưa có dữ liệu nào được tạo thật vào hệ thống.',
    'Chỉ khi bạn bấm "Khởi Tạo Kế Hoạch Workspace" ở bước cuối, dữ liệu mới được đẩy vào CSDL.',
  ],

  durationNote:
    'Quá trình sinh dữ liệu ở mỗi bước thường mất từ 15-30 giây.',
  draftNote:
    'Mọi chỉnh sửa của bạn được tự động lưu nháp. Bạn có thể rời đi và quay lại sau mà không mất dữ liệu.',

  steps: [
    { n: 1, title: 'Khởi tạo', body: 'Nhập thông tin doanh nghiệp & tài liệu.' },
    { n: 2, title: 'Chiến dịch', body: 'Duyệt và chốt danh sách Chiến dịch.' },
    { n: 3, title: 'Chủ đề', body: 'Duyệt và chốt danh sách Chủ đề.' },
    { n: 4, title: 'Bài viết', body: 'Review bộ khung Bài viết & Hoàn tất.' },
  ],

  collapseLabel: 'Thu gọn hướng dẫn',
  expandLabel: 'Quy trình hoạt động của AI Staged Planner',
};

export const STAGED_INIT_COPY = {
  stepTitle: 'Bước 1 — Khởi tạo Thông tin Doanh nghiệp',
  stepSubtitle:
    'Cung cấp các thông tin nền tảng về thương hiệu và tài liệu đính kèm. ' +
    'AI sẽ phân tích chuyên sâu để lên kế hoạch phù hợp.',
  fileLabel: 'File tài liệu đính kèm (Tuỳ chọn)',
  fileHint:
    'Kéo thả hoặc chọn các file brief, catalogue, bảng giá… ' +
    'AI sẽ đọc và kết hợp với thông tin bạn điền ở trên.',
  submitBtn: 'Tạo Kế Hoạch',
  loadingMsg: 'AI đang phân tích thông tin và khởi tạo danh sách chiến dịch…',
};

// ─── Bước 1: Campaigns Step ──────────────────────────────────────────────────

export const STAGED_CAMPAIGNS_COPY = {
  stepTitle: 'Bước 2 — Danh sách Chiến dịch Quảng bá',
  stepSubtitle:
    'Xem, chỉnh sửa hoặc thêm/xoá các chiến dịch trước khi chuyển sang sinh các chủ đề chi tiết.',
  addBtn: 'Thêm chiến dịch',
  proceedBtn: 'Tiếp tục — Sinh Chủ Đề',
  regenLoadingMsg: 'AI đang sinh lại danh sách chiến dịch…',
  proceedLoadingMsg: 'AI đang tạo danh sách chủ đề cho toàn bộ các chiến dịch…',
  emptyHint: 'Chưa có chiến dịch nào. Bấm \"+ Thêm chiến dịch\" để tự thêm.',
  deleteConfirm: 'Xoá chiến dịch này và tất cả chủ đề/bài viết liên quan?',
  newCampaignDefaults: {
    name: (n) => `Chiến dịch mới #${n}`,
    objective: 'Tăng nhận diện thương hiệu & tương tác khách hàng',
    description: 'Mô tả chi tiết chiến dịch',
  },
};

// ─── Bước 2: Topics Step ─────────────────────────────────────────────────────

export const STAGED_TOPICS_COPY = {
  stepTitle: 'Bước 3 — Danh sách Chủ đề Nội dung theo Chiến dịch',
  stepSubtitle:
    'Kiểm tra các chủ đề được AI khởi tạo cho từng chiến dịch. ' +
    'Bạn có thể tự do thêm/sửa/xoá bằng tay hoặc sinh lại.',
  addBtn: 'Thêm chủ đề',
  proceedBtn: 'Tiếp tục — Sinh Khung Bài Viết',
  regenLoadingMsg: 'AI đang sinh lại danh sách chủ đề…',
  proceedLoadingMsg: 'AI đang tạo danh sách bài viết skeleton cho toàn bộ các chủ đề…',
  emptyHint: 'Chưa có chủ đề nào trong chiến dịch này.',
  newTopicDefaults: {
    name: (n) => `Chủ đề mới #${n}`,
    description: 'Mô tả ngắn cho chủ đề này',
  },
};

// ─── Bước 3: Posts Step ──────────────────────────────────────────────────────

export const STAGED_POSTS_COPY = {
  stepTitle: 'Bước 4 — Khung Bài viết Skeleton',
  stepSubtitle:
    'Review và điều chỉnh trực tiếp các định hướng nội dung bài viết trước khi chốt tổng thể.',
  addBtn: 'Thêm bài viết',
  proceedBtn: 'Tiếp tục — Review & Hoàn Tất',
  regenLoadingMsg: 'AI đang sinh lại danh sách bài viết skeleton…',
  proceedLoadingMsg: 'Đang chuyển sang màn hình Review tổng thể…',
  emptyHint: 'Chưa có bài viết nào trong chủ đề này.',
  newPostDefaults: {
    title: (n) => `Bài viết mới #${n}`,
    objective: 'Thu hút sự chú ý của khách hàng',
    contentBrief: 'Tóm tắt nội dung chính cần truyền tải',
    mediaSuggestion: 'Hình ảnh thiết kế banner sản phẩm',
    hashtagsSuggestion: '#Marketing #AutoMarketing',
    platformSuggestion: 'Facebook',
    scheduleSuggestion: 'Buổi sáng (8h–9h)',
    confidence: 0.9,
    note: 'Tự thêm thủ công',
  },
};

// ─── Bước 4: Confirmed / Review Step ────────────────────────────────────────

export const STAGED_REVIEW_COPY = {
  stepTitle: 'Review Tổng Thể Kế Hoạch',
  stepSubtitle:
    'Toàn bộ kế hoạch đã được tạo. Bạn có thể chỉnh sửa lần cuối trước khi chốt và khởi tạo thật vào hệ thống.',
  brandInfoTitle: 'Thông tin Thương hiệu',
  planDetailTitle: (n) => `Chi tiết Kế Hoạch (${n} chiến dịch)`,
  finalizeBtn: '🚀 Khởi Tạo Kế Hoạch Workspace',
  finalizeLoadingMsg: 'Đang khởi tạo các Chiến dịch, Chủ đề & Bài viết vào Cơ sở dữ liệu…',
  notAppliedNotice:
    'Kế hoạch chưa được lưu vào hệ thống. Bấm \"Khởi Tạo\" để tạo thật Chiến dịch, Chủ đề và Bài viết.',
};

// ─── Nhãn các trường input ───────────────────────────────────────────────────

export const STAGED_FIELD_LABELS = {
  // Seed input
  companyName: 'Tên Công ty / Thương hiệu',
  visionMissionCoreValues: 'Tầm nhìn, Sứ mệnh & Giá trị cốt lõi',
  industryAndBusinessModel: 'Ngành hàng & Mô hình kinh doanh',
  targetCustomerPersona: 'Khách hàng mục tiêu (Persona)',
  brandTone: 'Giọng điệu thương hiệu',
  campaignPeriod: 'Giai đoạn chiến dịch (ví dụ: Q3/2025)',
  additionalInstructions: 'Yêu cầu bổ sung cho AI',

  // Campaign
  campaignName: 'Tên chiến dịch',
  campaignObjective: 'Mục tiêu chiến dịch',
  campaignDescription: 'Mô tả chiến dịch',
  startDate: 'Ngày bắt đầu',
  endDate: 'Ngày kết thúc',

  // Topic
  topicName: 'Tên chủ đề',
  topicDescription: 'Mô tả nội dung chủ đề',

  // Post
  postTitle: 'Tiêu đề bài viết',
  postObjective: 'Mục tiêu bài viết',
  contentBrief: 'Content Brief (Tóm tắt nội dung)',
  mediaSuggestion: 'Gợi ý Media/Hình ảnh',
  platformSuggestion: 'Nền tảng',
  scheduleSuggestion: 'Lịch đăng gợi ý',
  hashtagsSuggestion: 'Hashtags',
};

// ─── Regenerate Bar ──────────────────────────────────────────────────────────

export const STAGED_REGEN_COPY = {
  label: 'Hướng dẫn bổ sung cho AI khi sinh lại (tuỳ chọn)',
  placeholder: 'Ví dụ: Tập trung vào khách hàng trẻ, tone vui tươi hơn…',
  regenBtn: 'Sinh lại với AI',
};

// ─── Draft / Restore ─────────────────────────────────────────────────────────

export const STAGED_DRAFT_COPY = {
  loading: 'Đang tải cấu trúc kế hoạch…',
  loadFailed: 'Không tải được bản nháp đã lưu. Bạn có thể bắt đầu lại từ đầu.',
  saveFailed: '⚠ Không lưu được bản nháp lên máy chủ — chỉnh sửa của bạn vẫn còn trên trang này.',
};

// ─── Lỗi API chung ──────────────────────────────────────────────────────────

export const STAGED_ERROR_COPY = {
  generic: 'Có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại.',
  quota402: 'Bạn đã hết lượt sử dụng AI. Vui lòng nâng cấp gói để tiếp tục.',
};
