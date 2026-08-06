/**
 * Constants cho staged generation flow.
 * Map với backend PlanStage enum.
 */
export const PLAN_STAGES = {
  INIT: 'INIT',
  CAMPAIGNS_GENERATED: 'CAMPAIGNS_GENERATED',
  TOPICS_GENERATED: 'TOPICS_GENERATED',
  POSTS_GENERATED: 'POSTS_GENERATED',
  CONFIRMED: 'CONFIRMED',
};

export const STAGE_LABELS = {
  [PLAN_STAGES.INIT]: 'Nhập thông tin',
  [PLAN_STAGES.CAMPAIGNS_GENERATED]: 'Chiến dịch',
  [PLAN_STAGES.TOPICS_GENERATED]: 'Chủ đề',
  [PLAN_STAGES.POSTS_GENERATED]: 'Bài viết',
  [PLAN_STAGES.CONFIRMED]: 'Hoàn tất',
};

export const STAGE_ORDER = [
  PLAN_STAGES.INIT,
  PLAN_STAGES.CAMPAIGNS_GENERATED,
  PLAN_STAGES.TOPICS_GENERATED,
  PLAN_STAGES.POSTS_GENERATED,
  PLAN_STAGES.CONFIRMED,
];

/**
 * Map stage transitions: stage hiện tại → có thể chuyển tới stage nào.
 * Dựa trên PlanStage.canTransitionTo() bên backend.
 */
export const STAGE_TRANSITIONS = {
  [PLAN_STAGES.INIT]: [PLAN_STAGES.CAMPAIGNS_GENERATED],
  [PLAN_STAGES.CAMPAIGNS_GENERATED]: [PLAN_STAGES.TOPICS_GENERATED],
  [PLAN_STAGES.TOPICS_GENERATED]: [PLAN_STAGES.POSTS_GENERATED],
  [PLAN_STAGES.POSTS_GENERATED]: [PLAN_STAGES.CONFIRMED],
  [PLAN_STAGES.CONFIRMED]: [],
};

export const ENTITY_SOURCE = {
  AI_GENERATED: 'AI_GENERATED',
  USER_EDITED: 'USER_EDITED',
  USER_CREATED: 'USER_CREATED',
};

export const ENTITY_SOURCE_LABELS = {
  [ENTITY_SOURCE.AI_GENERATED]: 'AI gợi ý',
  [ENTITY_SOURCE.USER_EDITED]: 'Đã chỉnh sửa',
  [ENTITY_SOURCE.USER_CREATED]: 'Tự tạo',
};

export const ENTITY_SOURCE_COLORS = {
  [ENTITY_SOURCE.AI_GENERATED]: { bg: '#e0f2fe', text: '#0369a1' },
  [ENTITY_SOURCE.USER_EDITED]: { bg: '#fef3c7', text: '#92400e' },
  [ENTITY_SOURCE.USER_CREATED]: { bg: '#dcfce7', text: '#166534' },
};

/** Seed input form fields */
export const SEED_INPUT_FIELDS = [
  {
    name: 'companyName',
    label: 'Tên công ty / thương hiệu',
    placeholder: 'VD: MIN Skin / Vinamilk / HighLands Coffee',
    required: true,
  },
  {
    name: 'visionMissionCoreValues',
    label: 'Tầm nhìn – Sứ mệnh – Giá trị cốt lõi',
    placeholder: 'VD: Trở thành thương hiệu mỹ phẩm thiên nhiên hàng đầu, mang lại vẻ đẹp tự nhiên & bền vững',
    required: false,
    as: 'textarea',
    rows: 2,
  },
  {
    name: 'industryAndBusinessModel',
    label: 'Ngành hàng & Mô hình kinh doanh',
    placeholder: 'VD: Mỹ phẩm & Lựa chọn chăm sóc da / B2C Ecommerce & Chuỗi cửa hàng',
    required: false,
  },
  {
    name: 'targetCustomerPersona',
    label: 'Chân dung khách hàng mục tiêu',
    placeholder: 'VD: Nữ từ 22-35 tuổi, dân văn phòng quan tâm mỹ phẩm thuần chay',
    required: false,
    as: 'textarea',
    rows: 2,
  },
  {
    name: 'brandTone',
    label: 'Giọng điệu thương hiệu',
    placeholder: 'VD: Chuyên nghiệp, Thân thiện, Trẻ trung, Tin cậy',
    required: false,
  },
  {
    name: 'campaignPeriod',
    label: 'Giai đoạn quảng bá',
    placeholder: 'VD: Q3 2026, Tháng 8 - Tháng 12/2026',
    required: false,
  },
  {
    name: 'additionalInstructions',
    label: 'Chỉ dẫn bổ sung',
    placeholder: 'VD: Ưu tiên nhấn mạnh thành phần thiên nhiên, không dùng từ ngữ quá hàn lâm',
    required: false,
    as: 'textarea',
    rows: 2,
  },
];
