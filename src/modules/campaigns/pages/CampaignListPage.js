import React, { useCallback, useEffect, useMemo, useState } from 'react';
import '../styles/CampaignListPage.css';
import '../../../modules/social-accounts/styles/SocialAccountsPage.css';
import CreateCampaignModal from '../components/CreateCampaignModal';
import InviteMemberModal from '../../workspace/components/InviteMemberModal';
import CampaignCard from '../components/CampaignCard';
import CampaignActions from '../components/CampaignActions';
import WorkspaceFanpageBar from '../components/WorkspaceFanpageBar';
import AvatarGroup from '../../workspace/components/AvatarGroup';
import WorkspaceMembersModal from '../../workspace/components/WorkspaceMembersModal';
import WorkspaceContentSummary from '../components/WorkspaceContentSummary';
import WorkspaceDocumentModal from '../components/WorkspaceDocumentModal';
import { workspaceApi as wsApi } from '../../workspace/api/workspaceApi';
import { documentApi } from '../api/documentApi';
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
  const [isWorkspaceMembersModalOpen, setIsWorkspaceMembersModalOpen] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
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

  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [workspaceDocCount, setWorkspaceDocCount] = useState(0);

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
    if (workspaceFilter !== 'ALL') {
      wsApi.getWorkspaceMembers(workspaceFilter)
        .then(res => setWorkspaceMembers(res.data || []))
        .catch(console.error);
        
      documentApi.list(API_BASE_URL, workspaceFilter, { page: 0, size: 1 })
        .then(res => setWorkspaceDocCount(res?.data?.totalElements || 0))
        .catch(() => setWorkspaceDocCount(0));
    } else {
      setWorkspaceMembers([]);
      setWorkspaceDocCount(0);
    }
  }, [workspaceFilter]);

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
              {workspaceFilter !== 'ALL' && selectedWorkspace && (
                <div style={{ marginLeft: '12px' }}>
                  <AvatarGroup 
                    members={workspaceMembers} 
                    max={4}
                    onAddClick={() => setIsInviteModalOpen(true)}
                    onGroupClick={() => setIsWorkspaceMembersModalOpen(true)}
                  />
                </div>
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

        {workspaceFilter !== 'ALL' && (
          <div style={{ marginBottom: '24px' }}>
            <WorkspaceContentSummary workspaceId={workspaceFilter} />
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(to right, #f8fafc, #f1f5f9)',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px 20px',
              marginTop: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '10px', borderRadius: '10px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
                    Thư viện tài liệu AI <span style={{ color: '#64748b', fontWeight: 400 }}>({workspaceDocCount} tài liệu)</span>
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                    Nơi lưu trữ các tài liệu (Brand Guidelines, Catalogue...) để AI đọc hiểu và lập kế hoạch Marketing chuẩn xác hơn.
                  </p>
                </div>
              </div>
              <button 
                className="wp-btn"
                style={{ background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                onClick={() => setIsDocModalOpen(true)}
              >
                Quản lý tài liệu
              </button>
            </div>
          </div>
        )}

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

      <WorkspaceMembersModal
        isOpen={isWorkspaceMembersModalOpen}
        onClose={() => setIsWorkspaceMembersModalOpen(false)}
        workspaceId={activeWorkspaceId ?? currentWorkspaceId}
        workspaceName={selectedWorkspace?.name}
        currentUserRole={selectedWorkspace?.role}
        currentUserId={user?.id}
        isTrueOwner={selectedWorkspace?.ownerId === user?.id}
        onLeaveSuccess={() => {
          setIsWorkspaceMembersModalOpen(false);
          navigate('/dashboard');
        }}
      />
      {workspaceFilter !== 'ALL' && (
        <WorkspaceDocumentModal 
          workspaceId={workspaceFilter} 
          isOpen={isDocModalOpen} 
          onClose={() => {
            setIsDocModalOpen(false);
            // Cập nhật lại count sau khi modal đóng (lỡ user có upload/xóa)
            documentApi.list(API_BASE_URL, workspaceFilter, { page: 0, size: 1 })
              .then(res => setWorkspaceDocCount(res?.data?.totalElements || 0))
              .catch(() => {});
          }} 
        />
      )}
    </div>
  );
}

export default CampaignListPage;
