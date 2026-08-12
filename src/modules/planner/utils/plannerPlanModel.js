/**
 * Chuẩn hoá và chỉnh sửa bản kế hoạch AI trả về.
 *
 * Mọi mutator đều thuần và bất biến: `(plan, ...args) => newPlan`. Trang planner chỉ truyền xuống
 * MỘT dispatcher `onChange(mutator, ...args)` nên cây 3 cấp không phải luồn 12 callback.
 */

let idCounter = 0;
const nextId = (prefix) => {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
};

const str = (value) => (typeof value === 'string' ? value : value == null ? '' : String(value));

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** `<input type="date">` chỉ nhận đúng YYYY-MM-DD; giá trị khác trả về rỗng thay vì "Invalid Date". */
export const toDateInputValue = (value) => {
  const text = str(value).trim();
  return ISO_DATE.test(text) ? text : '';
};

const normalizeConfidence = (value) => {
  // Giữ nguyên `number|null`. Không dùng `value || null`: confidence = 0 là câu trả lời
  // "rất thấp" hợp lệ và phải hiện 0%, không phải "—".
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(1, Math.max(0, value));
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : null;
};

export const createEmptyPost = () => ({
  id: nextId('post'),
  title: '',
  objective: '',
  contentBrief: '',
  mediaSuggestion: '',
  hashtagsSuggestion: '',
  platformSuggestion: 'Facebook',
  scheduleSuggestion: '',
  confidence: null,
  note: '',
});

export const createEmptyTopic = () => ({
  id: nextId('topic'),
  name: '',
  description: '',
  posts: [createEmptyPost()],
});

export const createEmptyCampaign = () => ({
  id: nextId('camp'),
  name: '',
  objective: '',
  description: '',
  startDate: '',
  endDate: '',
  topics: [createEmptyTopic()],
});

const normalizePost = (post) => ({
  id: nextId('post'),
  title: str(post?.title),
  objective: str(post?.objective),
  contentBrief: str(post?.contentBrief),
  mediaSuggestion: str(post?.mediaSuggestion),
  hashtagsSuggestion: str(post?.hashtagsSuggestion),
  platformSuggestion: str(post?.platformSuggestion),
  scheduleSuggestion: str(post?.scheduleSuggestion),
  confidence: normalizeConfidence(post?.confidence),
  note: str(post?.note),
});

const normalizeTopic = (topic) => ({
  id: nextId('topic'),
  name: str(topic?.name),
  description: str(topic?.description),
  posts: Array.isArray(topic?.posts) ? topic.posts.map(normalizePost) : [],
});

const normalizeCampaign = (campaign) => ({
  id: nextId('camp'),
  name: str(campaign?.name),
  objective: str(campaign?.objective),
  description: str(campaign?.description),
  startDate: toDateInputValue(campaign?.startDate),
  endDate: toDateInputValue(campaign?.endDate),
  topics: Array.isArray(campaign?.topics) ? campaign.topics.map(normalizeTopic) : [],
});

/** Gắn id ổn định phía client (backend không trả id) và ép mọi field nullable về chuỗi rỗng. */
export const normalizePlan = (raw) => ({
  workspaceName: str(raw?.workspaceName),
  workspaceDescription: str(raw?.workspaceDescription),
  businessSummary: str(raw?.businessSummary),
  targetAudience: str(raw?.targetAudience),
  brandTone: str(raw?.brandTone),
  missingInformation: Array.isArray(raw?.missingInformation)
    ? raw.missingInformation.map(str).filter((item) => item.trim() !== '')
    : [],
  campaigns: Array.isArray(raw?.campaigns) ? raw.campaigns.map(normalizeCampaign) : [],
});

// ----- Mutators -----

export const setOverviewField = (plan, field, value) => ({ ...plan, [field]: value });

const mapCampaigns = (plan, campaignId, updater) => ({
  ...plan,
  campaigns: plan.campaigns.map((campaign) => (campaign.id === campaignId ? updater(campaign) : campaign)),
});

const mapTopics = (plan, campaignId, topicId, updater) =>
  mapCampaigns(plan, campaignId, (campaign) => ({
    ...campaign,
    topics: campaign.topics.map((topic) => (topic.id === topicId ? updater(topic) : topic)),
  }));

export const setCampaignField = (plan, campaignId, field, value) =>
  mapCampaigns(plan, campaignId, (campaign) => ({ ...campaign, [field]: value }));

export const setTopicField = (plan, campaignId, topicId, field, value) =>
  mapTopics(plan, campaignId, topicId, (topic) => ({ ...topic, [field]: value }));

export const setPostField = (plan, campaignId, topicId, postId, field, value) =>
  mapTopics(plan, campaignId, topicId, (topic) => ({
    ...topic,
    posts: topic.posts.map((post) => (post.id === postId ? { ...post, [field]: value } : post)),
  }));

export const addCampaign = (plan) => ({ ...plan, campaigns: [...plan.campaigns, createEmptyCampaign()] });

export const removeCampaign = (plan, campaignId) => ({
  ...plan,
  campaigns: plan.campaigns.filter((campaign) => campaign.id !== campaignId),
});

export const addTopic = (plan, campaignId) =>
  mapCampaigns(plan, campaignId, (campaign) => ({
    ...campaign,
    topics: [...campaign.topics, createEmptyTopic()],
  }));

export const removeTopic = (plan, campaignId, topicId) =>
  mapCampaigns(plan, campaignId, (campaign) => ({
    ...campaign,
    topics: campaign.topics.filter((topic) => topic.id !== topicId),
  }));

export const addPost = (plan, campaignId, topicId) =>
  mapTopics(plan, campaignId, topicId, (topic) => ({
    ...topic,
    posts: [...topic.posts, createEmptyPost()],
  }));

export const removePost = (plan, campaignId, topicId, postId) =>
  mapTopics(plan, campaignId, topicId, (topic) => ({
    ...topic,
    posts: topic.posts.filter((post) => post.id !== postId),
  }));

// ----- Derived -----

export const countPlan = (plan) => {
  if (!plan) return { campaigns: 0, topics: 0, posts: 0, avgConfidence: null };

  let topics = 0;
  let posts = 0;
  let confidenceSum = 0;
  let confidenceCount = 0;

  plan.campaigns.forEach((campaign) => {
    topics += campaign.topics.length;
    campaign.topics.forEach((topic) => {
      posts += topic.posts.length;
      topic.posts.forEach((post) => {
        if (typeof post.confidence === 'number' && Number.isFinite(post.confidence)) {
          confidenceSum += post.confidence;
          confidenceCount += 1;
        }
      });
    });
  });

  return {
    campaigns: plan.campaigns.length,
    topics,
    posts,
    avgConfidence: confidenceCount > 0 ? confidenceSum / confidenceCount : null,
  };
};

/** Chỉ dùng để hiển thị chip; việc chỉnh sửa vẫn diễn ra trên chuỗi gốc để không mất dữ liệu. */
export const parseHashtags = (value) =>
  str(value)
    .split(/[\s,]+/)
    .map((token) => token.trim().replace(/^#+/, ''))
    .filter((token) => token.length > 0)
    .map((token) => `#${token}`);

/** Mở sẵn campaign đầu tiên và topic đầu của nó, để người dùng thấy ngay có nội dung gì. */
export const defaultExpanded = (plan) => {
  const expanded = {};
  const firstCampaign = plan?.campaigns?.[0];
  if (!firstCampaign) return expanded;
  expanded[firstCampaign.id] = true;
  const firstTopic = firstCampaign.topics?.[0];
  if (firstTopic) expanded[firstTopic.id] = true;
  return expanded;
};

export const collectAllNodeIds = (plan) => {
  const ids = [];
  (plan?.campaigns || []).forEach((campaign) => {
    ids.push(campaign.id);
    (campaign.topics || []).forEach((topic) => {
      ids.push(topic.id);
      (topic.posts || []).forEach((post) => ids.push(post.id));
    });
  });
  return ids;
};

/** Bỏ id client trước khi copy/tải xuống — chúng chỉ là chi tiết nội bộ của UI. */
export const toExportJson = (plan) => ({
  workspaceName: plan.workspaceName,
  workspaceDescription: plan.workspaceDescription,
  businessSummary: plan.businessSummary,
  targetAudience: plan.targetAudience,
  brandTone: plan.brandTone,
  missingInformation: plan.missingInformation,
  campaigns: plan.campaigns.map(({ id: _cid, topics, ...campaign }) => ({
    ...campaign,
    topics: topics.map(({ id: _tid, posts, ...topic }) => ({
      ...topic,
      posts: posts.map(({ id: _pid, ...post }) => post),
    })),
  })),
});
