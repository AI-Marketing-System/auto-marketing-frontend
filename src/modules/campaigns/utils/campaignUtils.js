export const CAMPAIGN_STATUS = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
};

export const mapStatusToLabel = (status) => {
  switch (status) {
    case CAMPAIGN_STATUS.ACTIVE:
      return 'Đang chạy';
    case CAMPAIGN_STATUS.PAUSED:
      return 'Tạm dừng';
    case CAMPAIGN_STATUS.COMPLETED:
      return 'Hoàn thành';
    default:
      return status || 'Không xác định';
  }
};

export const mapStatusToDisplay = (status) => {
  switch (status) {
    case CAMPAIGN_STATUS.ACTIVE:
      return '🟢 Đang chạy';
    case CAMPAIGN_STATUS.PAUSED:
      return '🟡 Tạm dừng';
    case CAMPAIGN_STATUS.COMPLETED:
      return '🔵 Hoàn thành';
    default:
      return status ? `⚪ ${status}` : '⚪ Không xác định';
  }
};

export const mapStatusToApiValue = (status) => {
  switch (status) {
    case CAMPAIGN_STATUS.ACTIVE:
    case 'Đang chạy':
    case '🟢 Đang chạy':
      return CAMPAIGN_STATUS.ACTIVE;
    case CAMPAIGN_STATUS.PAUSED:
    case 'Tạm dừng':
    case '🟡 Tạm dừng':
      return CAMPAIGN_STATUS.PAUSED;
    case CAMPAIGN_STATUS.COMPLETED:
    case 'Hoàn thành':
    case '🔵 Hoàn thành':
      return CAMPAIGN_STATUS.COMPLETED;
    default:
      return '';
  }
};

export const getStatusClassName = (rawStatus) => {
  if (rawStatus === CAMPAIGN_STATUS.ACTIVE) return 'active';
  if (rawStatus === CAMPAIGN_STATUS.PAUSED) return 'paused';
  return 'completed';
};

export const getStatusPillClassName = (rawStatus) => {
  let statusClass = 'status-pill';
  if (rawStatus === CAMPAIGN_STATUS.ACTIVE) statusClass += ' status-running';
  else if (rawStatus === CAMPAIGN_STATUS.PAUSED) statusClass += ' status-paused';
  else if (rawStatus === CAMPAIGN_STATUS.COMPLETED) statusClass += ' status-completed';
  return statusClass;
};

export const formatDate = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return '';
  }
};

export const formatRange = (start, end) => {
  const s = formatDate(start);
  const e = formatDate(end);
  if (s && e) return `${s} - ${e}`;
  if (s) return `Từ ${s}`;
  if (e) return `Đến ${e}`;
  return '--';
};

export const generateInitials = (title) => {
  const normalized = String(title || '').trim();
  if (!normalized) return 'CD';
  const words = normalized.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return normalized.substring(0, 2).toUpperCase();
};

export const getInitialBgColor = (id) => {
  const schemes = ['#f3e8ff', '#ffedd5', '#dcfce7', '#e0f2fe'];
  return schemes[Number(id) % schemes.length];
};

export const getInitialTextColor = (id) => {
  const colors = ['#7c3aed', '#ea580c', '#15803d', '#0369a1'];
  return colors[Number(id) % colors.length];
};

export const extractCreatorInfo = (campaign) => {
  const createdBy =
    campaign.createdBy ??
    campaign.userId ??
    campaign.ownerId ??
    campaign.createdByUserId ??
    campaign.user?.id ??
    campaign.creator?.id ??
    null;

  const creatorName =
    campaign.creatorName ||
    campaign.createdByName ||
    campaign.ownerName ||
    campaign.user?.fullName ||
    campaign.user?.name ||
    campaign.creator?.name ||
    campaign.creator?.fullName ||
    '';

  return { createdBy, creatorName };
};

export const extractCreatorsFromCampaigns = (campaigns, currentUser = null) => {
  const map = new Map();

  campaigns.forEach((item) => {
    if (item.createdBy == null || item.createdBy === '') return;
    map.set(String(item.createdBy), {
      id: String(item.createdBy),
      label: item.creatorName || `User #${item.createdBy}`,
    });
  });

  if (currentUser?.id != null && !map.has(String(currentUser.id))) {
    map.set(String(currentUser.id), {
      id: String(currentUser.id),
      label: currentUser.fullName || currentUser.email || `User #${currentUser.id}`,
    });
  }

  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, 'vi'));
};

export const mapCampaignFromApi = (campaign) => {
  const rawStatus = campaign.status || CAMPAIGN_STATUS.ACTIVE;
  const { createdBy, creatorName } = extractCreatorInfo(campaign);

  return {
    id: campaign.id,
    initials: generateInitials(campaign.name || campaign.title || 'CD'),
    initialsBg: getInitialBgColor(campaign.id),
    initialsColor: getInitialTextColor(campaign.id),
    rawStatus,
    status: mapStatusToDisplay(rawStatus),
    statusLabel: mapStatusToLabel(rawStatus),
    title: campaign.name || campaign.title || 'Chiến dịch mới',
    description: campaign.description || '',
    dateRange: formatRange(campaign.startDate, campaign.endDate),
    createdAt: campaign.createdDate || campaign.createdAt || campaign.startDate || '',
    createdBy: createdBy ?? '',
    creatorName: creatorName || (createdBy ? `User #${createdBy}` : 'Không rõ'),
    creatorInitials: generateInitials(creatorName || (createdBy ? `U${createdBy}` : '?')),
    topicsCount: campaign.topicsCount ?? 0,
    postsCount: campaign.postsCount ?? 0,
    workspaceId: campaign.workspaceId,
    workspaceName: campaign.workspaceName || '',
  };
};

export const ACTION_MODAL_COPY = {
  pause: {
    title: 'Tạm dừng chiến dịch?',
    body: 'Chiến dịch sẽ ngừng chạy tạm thời. Bạn có thể tiếp tục lại sau.',
    confirm: 'Tạm dừng',
  },
  resume: {
    title: 'Tiếp tục chiến dịch?',
    body: 'Chiến dịch sẽ được chuyển về trạng thái đang chạy.',
    confirm: 'Tiếp tục',
  },
  complete: {
    title: 'Hoàn thành chiến dịch?',
    body: 'Chiến dịch sẽ được đánh dấu hoàn thành và không thể tiếp tục chạy.',
    confirm: 'Hoàn thành',
  },
  delete: {
    title: 'Xóa chiến dịch?',
    body: 'Chiến dịch cùng tất cả các topic và bài viết liên quan sẽ bị xóa. Hành động này không thể hoàn tác.',
    confirm: 'Xóa',
  },
};
