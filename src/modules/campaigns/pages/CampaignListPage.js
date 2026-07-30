import React, { useCallback, useEffect, useMemo, useState } from 'react';
import '../styles/CampaignListPage.css';
import '../../../modules/social-accounts/styles/SocialAccountsPage.css';
import CreateCampaignModal from '../components/CreateCampaignModal';
import InviteMemberModal from '../../workspace/components/InviteMemberModal';
import CampaignCard from '../components/CampaignCard';
import CampaignActions from '../components/CampaignActions';
import WorkspaceFanpageBar from '../components/WorkspaceFanpageBar';
import {
  campaignApi,
  mapSortField,
  parsePaginatedResponse,
  parseWorkspacesResponse,
  workspaceApi,
} from '../api/campaignApi';
import {
  ACTION_MODAL_COPY,
  CAMPAIGN_STATUS,
  extractCreatorsFromCampaigns,
  formatDate,
  getStatusClassName,
  mapCampaignFromApi,
  mapStatusToApiValue,
  mapStatusToLabel,
} from '../utils/campaignUtils';
import { API_BASE_URL } from '../../../config/env';
import { useAuth } from '../../../context/AuthContext';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import SchedulePage from '../../schedule/pages/SchedulePage';

const SUMMARY_ITEMS = [
  { key: 'total', label: 'Tổng chiến dịch', tone: 'total' },
  { key: 'active', label: 'Đang chạy', tone: 'active' },
  { key: 'paused', label: 'Tạm dừng', tone: 'paused' },
  { key: 'completed', label: 'Hoàn thành', tone: 'completed' },
];

function CampaignListPage() {
  const { user } = useAuth();
  const location = useLocation();
  const isScheduleTab = location.hash === '#schedule';

  const navigate = useNavigate();

  const { workspaceId } = useParams();
  const currentWorkspaceId = workspaceId ? Number(workspaceId) : null;

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [workspaceFilter, setWorkspaceFilter] = useState(currentWorkspaceId ?? 'ALL');
  const [creatorFilter, setCreatorFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(8);
  const [viewMode, setViewMode] = useState('cards');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    totalElements: 0,
    totalPages: 1,
    size: pageSize,
  });
  const [creators, setCreators] = useState([]);
  const [actionModal, setActionModal] = useState(null);
  const [actionPendingId, setActionPendingId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      workspaceApi.myWorkspaces(API_BASE_URL).catch(() => []),
      workspaceApi.memberWorkspaces(API_BASE_URL).catch(() => [])
    ])
      .then(([myRes, memberRes]) => {
        if (cancelled) return;
        const myWs = parseWorkspacesResponse(myRes);
        const memberWs = parseWorkspacesResponse(memberRes);
        const combined = [...myWs, ...memberWs];
        setWorkspaces(combined);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setWorkspaceFilter(currentWorkspaceId ?? 'ALL');
    setPage(0);
  }, [currentWorkspaceId]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchQuery(searchInput.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, statusFilter, workspaceFilter, creatorFilter, sortBy, sortDirection, pageSize]);

  const activeWorkspaceId = workspaceFilter === 'ALL' ? undefined : Number(workspaceFilter);

  const loadCreatorOptions = useCallback(
    async (workspaceIdValue) => {
      try {
        const response = await campaignApi.list(API_BASE_URL, {
          workspaceId: workspaceIdValue || undefined,
          page: 0,
          size: 300,
          sortBy: 'createdAt',
          sortDirection: 'desc',
        });
        const { content } = parsePaginatedResponse(response, 0, 300);
        const mapped = content.map(mapCampaignFromApi);
        setCreators(extractCreatorsFromCampaigns(mapped, user));
      } catch (err) {
        setCreators(
          user?.id
            ? [{ id: String(user.id), label: user.fullName || user.email || `User #${user.id}` }]
            : []
        );
      }
    },
    [user]
  );

  useEffect(() => {
    loadCreatorOptions(activeWorkspaceId);
  }, [activeWorkspaceId, loadCreatorOptions]);

  const loadCampaigns = useCallback(
    async (overrides = {}) => {
      const effectivePage = overrides.page ?? page;
      const effectivePageSize = overrides.pageSize ?? pageSize;
      const effectiveSearchQuery = overrides.searchQuery ?? searchQuery;
      const effectiveStatusFilter = overrides.statusFilter ?? statusFilter;
      const effectiveWorkspaceFilter = overrides.workspaceFilter ?? workspaceFilter;
      const effectiveCreatorFilter = overrides.creatorFilter ?? creatorFilter;
      const effectiveSortBy = overrides.sortBy ?? sortBy;
      const effectiveSortDirection = overrides.sortDirection ?? sortDirection;

      const effectiveWorkspaceId =
        effectiveWorkspaceFilter === 'ALL' ? undefined : Number(effectiveWorkspaceFilter);

      if (effectiveWorkspaceFilter !== 'ALL' && Number.isNaN(effectiveWorkspaceId)) return;

      setLoading(true);
      setError(null);
      try {
        const params = {
          workspaceId: effectiveWorkspaceId || undefined,
          search: effectiveSearchQuery || undefined,
          status: mapStatusToApiValue(effectiveStatusFilter) || undefined,
          createdBy:
            effectiveCreatorFilter === 'ALL' || Number.isNaN(Number(effectiveCreatorFilter))
              ? undefined
              : Number(effectiveCreatorFilter),
          sortBy: mapSortField(effectiveSortBy),
          sortDirection: effectiveSortDirection || undefined,
          page: effectivePage,
          size: effectivePageSize,
        };

        const response = await campaignApi.list(API_BASE_URL, params);
        let {
          content: campaignsData,
          totalElements,
          totalPages,
          number: responsePage,
          size: responseSize,
        } = parsePaginatedResponse(response, effectivePage, effectivePageSize);

        if (
          campaignsData.length === 0 &&
          totalElements === 0 &&
          !effectiveSearchQuery &&
          effectiveStatusFilter === 'ALL' &&
          effectiveCreatorFilter === 'ALL'
        ) {
          const fallbackResponse = await campaignApi.list(API_BASE_URL, {
            workspaceId: effectiveWorkspaceId || undefined,
            page: effectivePage,
            size: effectivePageSize,
          });
          const fallbackParsed = parsePaginatedResponse(
            fallbackResponse,
            effectivePage,
            effectivePageSize
          );
          if (fallbackParsed.content.length > 0) {
            campaignsData = fallbackParsed.content;
            totalElements = fallbackParsed.totalElements;
            totalPages = fallbackParsed.totalPages;
            responsePage = fallbackParsed.number;
            responseSize = fallbackParsed.size;
          }
        }

        const mapped = campaignsData.map(mapCampaignFromApi);
        setCampaigns(mapped);
        setPagination({
          pageNumber: responsePage,
          totalElements,
          totalPages: Math.max(1, totalPages),
          size: responseSize,
        });
      } catch (err) {
        setCampaigns([]);
        setPagination({ pageNumber: 0, totalElements: 0, totalPages: 1, size: pageSize });
        setError(err.message || 'Không thể tải chiến dịch');
      } finally {
        setLoading(false);
      }
    },
    [
      creatorFilter,
      page,
      pageSize,
      searchQuery,
      sortBy,
      sortDirection,
      statusFilter,
      workspaceFilter,
    ]
  );

  const loadAllCampaignsForSchedule = useCallback(async () => {
    if (!currentWorkspaceId) {
      setAllCampaigns([]);
      return;
    }
    try {
      const response = await campaignApi.list(API_BASE_URL, {
        workspaceId: currentWorkspaceId,
        page: 0,
        size: 200,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      });
      const { content } = parsePaginatedResponse(response, 0, 200);
      setAllCampaigns(content.map(mapCampaignFromApi));
    } catch (err) {
      setAllCampaigns([]);
    }
  }, [currentWorkspaceId]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  useEffect(() => {
    if (isScheduleTab) loadAllCampaignsForSchedule();
  }, [isScheduleTab, loadAllCampaignsForSchedule]);

  const handleCreateCampaign = () => setIsModalOpen(true);

  const handleModalSubmit = async (data) => {
    try {
      await campaignApi.create(data, API_BASE_URL);
      setIsModalOpen(false);
      setSearchInput('');
      setSearchQuery('');
      setStatusFilter('ALL');
      setCreatorFilter('ALL');
      setWorkspaceFilter(String(data.workspaceId));
      setPage(0);
      await loadCampaigns({
        page: 0,
        searchQuery: '',
        statusFilter: 'ALL',
        creatorFilter: 'ALL',
        workspaceFilter: String(data.workspaceId),
      });
      await loadCreatorOptions(data.workspaceId);
      if (isScheduleTab) await loadAllCampaignsForSchedule();
    } catch (err) {
      window.alert(err.message || 'Không thể tạo chiến dịch. Vui lòng thử lại.');
      throw err;
    }
  };

  const handleSort = (column) => {
    const apiColumn = column === 'createdDate' ? 'createdAt' : column === 'title' ? 'name' : column;
    if (sortBy === apiColumn) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(apiColumn);
    setSortDirection('asc');
  };

  const openActionModal = (campaign, action) => setActionModal({ campaign, action });

  const handleActionConfirm = async () => {
    if (!actionModal) return;

    const { campaign, action } = actionModal;
    setActionPendingId(campaign.id);
    try {
      if (action === 'pause') await campaignApi.pause(campaign.id, API_BASE_URL);
      else if (action === 'resume') await campaignApi.resume(campaign.id, API_BASE_URL);
      else if (action === 'delete') await campaignApi.delete(campaign.id, API_BASE_URL);
      else await campaignApi.complete(campaign.id, API_BASE_URL);

      setActionModal(null);
      await loadCampaigns();
      await loadCreatorOptions(activeWorkspaceId);
      if (isScheduleTab) await loadAllCampaignsForSchedule();
    } catch (err) {
      setError(err.message || 'Không thể cập nhật trạng thái chiến dịch');
    } finally {
      setActionPendingId(null);
    }
  };

  const selectedWorkspace = useMemo(
    () => workspaces.find((ws) => Number(ws.id) === Number(activeWorkspaceId)),
    [activeWorkspaceId, workspaces]
  );

  // Trang planner cần một workspaceId cụ thể trong URL. Giữ đúng thứ tự fallback mà modal Knowledge
  // Assets trước đây dùng, và thêm chặn trường hợp người dùng chưa có workspace nào.
  const plannerWorkspaceId = activeWorkspaceId ?? currentWorkspaceId ?? workspaces[0]?.id ?? null;

  const handleOpenPlanner = () => {
    if (!plannerWorkspaceId) {
      window.alert('Hãy chọn một workspace trước khi mở AI Workspace Planner.');
      return;
    }
    navigate(`/workspaces/${plannerWorkspaceId}/planner`);
  };

  const pageNumbers = useMemo(() => {
    const pages = [];
    const windowSize = 3;
    const start = Math.max(0, page - windowSize);
    const end = Math.min(pagination.totalPages - 1, page + windowSize);
    for (let index = start; index <= end; index += 1) pages.push(index);
    return pages;
  }, [page, pagination.totalPages]);

  const statusSummary = useMemo(
    () => ({
      total: pagination.totalElements,
      active: campaigns.filter((camp) => camp.rawStatus === CAMPAIGN_STATUS.ACTIVE).length,
      paused: campaigns.filter((camp) => camp.rawStatus === CAMPAIGN_STATUS.PAUSED).length,
      completed: campaigns.filter((camp) => camp.rawStatus === CAMPAIGN_STATUS.COMPLETED).length,
    }),
    [campaigns, pagination.totalElements]
  );

  const scheduleCampaigns = allCampaigns.length > 0 ? allCampaigns : campaigns;
  const modalCopy = actionModal ? ACTION_MODAL_COPY[actionModal.action] : null;

  if (isScheduleTab) {
    return (
      <SchedulePage
        workspaceId={currentWorkspaceId}
        workspaces={workspaces}
        campaigns={scheduleCampaigns}
      />
    );
  }

  return (
    <div className="campaign-page-container">
      <main className="campaign-main-content">
        <section className="campaign-hero-panel">
          <div className="campaign-hero-copy">
            <span className="workspace-label">Quản lý chiến dịch</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 className="workspace-title-main" style={{ margin: 0 }}>
                {workspaceFilter === 'ALL'
                  ? 'Tất cả workspace'
                  : selectedWorkspace
                    ? selectedWorkspace.name
                    : 'Chọn workspace'}
              </h1>
              {workspaceFilter !== 'ALL' && selectedWorkspace && selectedWorkspace.role === 'OWNER' && (
                <button
                  type="button"
                  className="btn-invite-member"
                  onClick={() => setIsInviteModalOpen(true)}
                  title="Mời thành viên"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    borderRadius: '6px',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                </button>
              )}
            </div>
            <p className="campaign-hero-subtitle">
              Theo dõi trạng thái, người tạo và thao tác chiến dịch trong một nơi.
            </p>
          </div>
          <div className="title-right">
            <div className="campaign-view-toggle">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
              >
                Thẻ
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                Bảng
              </button>
            </div>
            <button type="button" className="btn-create-campaign" onClick={handleCreateCampaign}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Tạo chiến dịch
            </button>
            <button
              type="button"
              className="btn-create-campaign btn-secondary"
              onClick={handleOpenPlanner}
              title="Quản lý tài liệu nguồn và chạy AI Workspace Planner"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Nguồn nội dung & AI Planner
            </button>
          </div>
        </section>

        <div className="workspace-selector-card">
          <div className="workspace-selector-dropdown">
            <div
              className="workspace-dropdown-trigger"
              onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
              onBlur={() => setTimeout(() => setWsDropdownOpen(false), 200)}
              tabIndex={0}
            >
              <span className="selected-workspace-name">
                {workspaceFilter === 'ALL'
                  ? 'Tất cả workspace'
                  : selectedWorkspace
                    ? selectedWorkspace.name
                    : 'Chọn workspace'}
              </span>
              <svg
                className={`dropdown-chevron ${wsDropdownOpen ? 'open' : ''}`}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {wsDropdownOpen && (
              <div className="workspace-dropdown-menu">
                {workspaces.length === 0 ? (
                  <div className="workspace-dropdown-item empty">Không có workspace</div>
                ) : (
                  <>
                    <div
                      className={`workspace-dropdown-item ${workspaceFilter === 'ALL' ? 'active' : ''}`}
                      onClick={() => {
                        setWsDropdownOpen(false);
                        setWorkspaceFilter('ALL');
                      }}
                    >
                      <span>Tất cả workspace</span>
                    </div>
                    {workspaces.map((ws) => (
                      <div
                        key={ws.id}
                        className={`workspace-dropdown-item ${Number(ws.id) === Number(activeWorkspaceId) ? 'active' : ''}`}
                        onClick={() => {
                          setWsDropdownOpen(false);
                          setWorkspaceFilter(String(ws.id));
                        }}
                      >
                        <span>{ws.name}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {currentWorkspaceId && <WorkspaceFanpageBar workspaceId={currentWorkspaceId} />}
        </div>

        <div className="campaign-summary-grid">
          {SUMMARY_ITEMS.map((item) => (
            <div key={item.key} className={`campaign-summary-card tone-${item.tone}`}>
              <span className="summary-label">{item.label}</span>
              <strong className="summary-value">{statusSummary[item.key]}</strong>
            </div>
          ))}
        </div>

        <div className="campaign-toolbar-card">
          <div className="campaign-toolbar">
            <div className="search-input-wrapper">
              <svg
                className="search-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="search-campaign-input"
                placeholder="Tìm theo tên hoặc mô tả chiến dịch..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') setSearchQuery(searchInput.trim());
                }}
              />
            </div>

            <div className="filter-group">
              <select
                className="filter-select"
                value={workspaceFilter}
                onChange={(e) => setWorkspaceFilter(e.target.value)}
              >
                <option value="ALL">Tất cả workspace</option>
                {workspaces.map((ws) => (
                  <option key={ws.id} value={String(ws.id)}>
                    {ws.name}
                  </option>
                ))}
              </select>

              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang chạy</option>
                <option value="PAUSED">Tạm dừng</option>
                <option value="COMPLETED">Hoàn thành</option>
              </select>

              <select
                className="filter-select"
                value={creatorFilter}
                onChange={(e) => setCreatorFilter(e.target.value)}
                disabled={creators.length === 0}
              >
                <option value="ALL">Tất cả người tạo</option>
                {creators.map((creator) => (
                  <option key={creator.id} value={creator.id}>
                    {creator.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {creators.length === 0 && (
            <p className="campaign-filter-hint">
              Chưa có dữ liệu người tạo từ API. Bộ lọc sẽ cập nhật khi backend trả về trường người
              tạo.
            </p>
          )}
        </div>

        {loading ? (
          <div className="empty-campaigns-state loading-state">
            <div className="loading-spinner" />
            <p className="empty-text">Đang tải chiến dịch...</p>
          </div>
        ) : error ? (
          <div className="empty-campaigns-state">
            <p className="empty-text">Lỗi: {error}</p>
            <button type="button" className="btn-create-campaign" onClick={() => loadCampaigns()}>
              Thử lại
            </button>
          </div>
        ) : campaigns.length > 0 ? (
          <>
            {viewMode === 'cards' ? (
              <div className="campaigns-cards-grid">
                {campaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onAction={openActionModal}
                    actionPendingId={actionPendingId}
                    actionPendingAction={actionModal?.action}
                  />
                ))}
              </div>
            ) : (
              <div className="campaign-table-shell">
                <table className="campaign-table">
                  <thead>
                    <tr>

                      <th>
                        <button
                          className="campaign-sort-button"
                          onClick={() => handleSort('title')}
                        >
                          Chiến dịch{' '}
                          {sortBy === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                        </button>
                      </th>
                      <th>Người tạo</th>
                      <th>
                        <button
                          className="campaign-sort-button"
                          onClick={() => handleSort('createdDate')}
                        >
                          Ngày tạo{' '}
                          {sortBy === 'createdAt' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                        </button>
                      </th>
                      <th>
                        <button
                          className="campaign-sort-button"
                          onClick={() => handleSort('status')}
                        >
                          Trạng thái{' '}
                          {sortBy === 'status' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                        </button>
                      </th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id}>

                        <td>
                          <div className="campaign-title-cell">
                            <div className="campaign-row-leading">
                              <span
                                className="campaign-row-avatar"
                                style={{
                                  backgroundColor: campaign.initialsBg,
                                  color: campaign.initialsColor,
                                }}
                              >
                                {campaign.initials}
                              </span>
                              <div>
                                <Link to={`/workspaces/${currentWorkspaceId || campaign.workspaceId}/campaigns/${campaign.id}/topics`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                  <span className="campaign-title-text" style={{ fontWeight: '600', color: '#4f46e5' }}>{campaign.title}</span>
                                </Link>
                                {campaign.description ? (
                                  <p className="campaign-desc-subtext">{campaign.description}</p>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="campaign-creator-chip table">
                            <span className="campaign-creator-avatar">
                              {campaign.creatorInitials}
                            </span>
                            <span className="campaign-creator-name">{campaign.creatorName}</span>
                          </div>
                        </td>
                        <td>{formatDate(campaign.createdAt) || campaign.dateRange}</td>
                        <td>
                          <span
                            className={`campaign-badge ${getStatusClassName(campaign.rawStatus)}`}
                          >
                            {mapStatusToLabel(campaign.rawStatus)}
                          </span>
                        </td>
                        <td>
                          <CampaignActions
                            campaign={campaign}
                            pendingId={actionPendingId}
                            pendingAction={actionModal?.action}
                            onAction={openActionModal}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pagination-bar standalone">
              <div className="pagination-summary">
                Hiển thị {campaigns.length > 0 ? page * pageSize + 1 : 0} -{' '}
                {Math.min((page + 1) * pageSize, pagination.totalElements)} /{' '}
                {pagination.totalElements} chiến dịch
              </div>
              <div className="pagination-controls">
                <select
                  className="page-size-select"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  <option value={6}>6 / trang</option>
                  <option value={8}>8 / trang</option>
                  <option value={10}>10 / trang</option>
                  <option value={12}>12 / trang</option>
                </select>
                <button
                  className="page-button"
                  disabled={page === 0}
                  onClick={() => setPage((prev) => prev - 1)}
                >
                  ←
                </button>
                {pageNumbers.map((pageIndex) => (
                  <button
                    key={pageIndex}
                    className={`page-button ${pageIndex === page ? 'active' : ''}`}
                    onClick={() => setPage(pageIndex)}
                  >
                    {pageIndex + 1}
                  </button>
                ))}
                <button
                  className="page-button"
                  disabled={page + 1 >= pagination.totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  →
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-campaigns-state">
            <div className="empty-state-icon">📋</div>
            <p className="empty-text">Chưa có chiến dịch nào phù hợp với bộ lọc.</p>
            <div className="empty-state-actions">
              <button type="button" className="btn-create-campaign" onClick={handleCreateCampaign}>
                Tạo chiến dịch đầu tiên
              </button>
              {workspaceFilter !== 'ALL' && (
                <button
                  type="button"
                  className="btn-secondary-ghost"
                  onClick={() => setWorkspaceFilter('ALL')}
                >
                  Xem tất cả workspace
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {actionModal && modalCopy ? (
        <div className="confirm-modal-backdrop" role="presentation">
          <div className="confirm-modal" role="dialog" aria-modal="true">
            <h3 className="confirm-modal-title">{modalCopy.title}</h3>
            <p className="confirm-modal-body">{modalCopy.body}</p>
            <div className="confirm-modal-actions">
              <button className="secondary" type="button" onClick={() => setActionModal(null)}>
                Hủy
              </button>
              <button className="primary" type="button" onClick={handleActionConfirm}>
                {modalCopy.confirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <CreateCampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        defaultWorkspaceId={activeWorkspaceId ?? currentWorkspaceId}
      />

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspaceId={activeWorkspaceId ?? currentWorkspaceId}
      />
    </div>
  );
}

export default CampaignListPage;
