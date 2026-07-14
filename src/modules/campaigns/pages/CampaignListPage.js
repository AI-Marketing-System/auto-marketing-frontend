import React, { useEffect, useState } from 'react';
import '../styles/CampaignListPage.css';
import '../../../modules/social-accounts/styles/SocialAccountsPage.css';
import CampaignCard from '../components/CampaignCard';
import CreateCampaignModal from '../components/CreateCampaignModal';
import WorkspaceFanpageBar from '../components/WorkspaceFanpageBar';
import { campaignApi, workspaceApi } from '../api/campaignApi';
import { API_BASE_URL } from '../../../config/env';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import SchedulePage from '../../schedule/pages/SchedulePage';

const mapStatusToVietnamese = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'Đang chạy';
    case 'PAUSED':
      return 'Tạm dừng';
    case 'COMPLETED':
      return 'Hoàn thành';
    default:
      return status || 'Đang chạy';
  }
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return '';
  }
};

const formatRange = (start, end) => {
  const s = formatDate(start);
  const e = formatDate(end);
  if (s && e) return `${s} - ${e}`;
  if (s) return `Từ ${s}`;
  if (e) return `Đến ${e}`;
  return '--';
};

function CampaignListPage() {
  const location = useLocation();
  const isScheduleTab = location.hash === '#schedule';

  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const currentWorkspaceId = workspaceId ? Number(workspaceId) : null;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    workspaceApi
      .myWorkspaces(API_BASE_URL)
      .then((res) => {
        const wsList = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        if (!cancelled && wsList.length > 0) {
          setWorkspaces(wsList);
        } else if (!cancelled) {
          setWorkspaces([]);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (currentWorkspaceId == null) return;
    async function loadCampaigns() {
      setLoading(true);
      setError(null);
      try {
        const response = await campaignApi.list(API_BASE_URL, currentWorkspaceId);
        // Backend returns ApiResponse<PageResponse<CampaignResponse>> when filtering
        // PageResponse has: content, totalElements, totalPages, etc.
        let campaignsData = [];
        if (Array.isArray(response)) {
          campaignsData = response;
        } else if (response?.data?.content && Array.isArray(response.data.content)) {
          campaignsData = response.data.content;
        } else if (Array.isArray(response?.data)) {
          campaignsData = response.data;
        }
        if (Array.isArray(campaignsData)) {
          setCampaigns(
            campaignsData.map((campaign) => ({
              id: campaign.id,
              initials: generateInitials(campaign.name || campaign.title || 'CD'),
              initialsBg: getInitialBgColor(campaign.id),
              initialsColor: getInitialTextColor(campaign.id),
              status: mapStatusToVietnamese(campaign.status),
              title: campaign.name || campaign.title || 'Chiến dịch mới',
              dateRange: formatRange(campaign.startDate, campaign.endDate),
              topicsCount: campaign.topicsCount ?? 0,
              postsCount: campaign.postsCount ?? 0,
            }))
          );
        } else {
          setCampaigns([]);
        }
      } catch (err) {
        setError(err.message || 'Không thể tải chiến dịch');
      } finally {
        setLoading(false);
      }
    }

    loadCampaigns();
  }, [currentWorkspaceId]);

  const getInitialBgColor = (id) => {
    const schemes = ['#f3e8ff', '#ffedd5', '#dcfce7', '#e0f2fe'];
    return schemes[id % schemes.length];
  };

  const getInitialTextColor = (id) => {
    const colors = ['#7c3aed', '#ea580c', '#15803d', '#0369a1'];
    return colors[id % colors.length];
  };

  const generateInitials = (title) => {
    const words = title.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return title.substring(0, 2).toUpperCase();
  };

  const handleCreateCampaign = () => {
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data) => {
    try {
      const response = await campaignApi.create(data, API_BASE_URL);
      const created = response?.data || response;
      if (Number(created.workspaceId || data.workspaceId) === currentWorkspaceId) {
        setCampaigns((prev) => [
          {
            id: created.id || Date.now(),
            initials: generateInitials(created.name || data.title),
            initialsBg: getInitialBgColor(created.id || prev.length),
            initialsColor: getInitialTextColor(created.id || prev.length),
            status: mapStatusToVietnamese(created.status || data.status),
            title: created.name || data.title,
            dateRange: formatRange(
              created.startDate || data.startDate,
              created.endDate || data.endDate
            ),
            topicsCount: created.topicsCount ?? 0,
            postsCount: created.postsCount ?? 0,
          },
          ...prev,
        ]);
      }
      setIsModalOpen(false);
    } catch (err) {
      window.alert(err.message || 'Không thể tạo chiến dịch. Vui lòng thử lại.');
    }
  };

  const selectedWorkspace = workspaces.find((ws) => ws.id === currentWorkspaceId);

  const filteredCampaigns = campaigns.filter((camp) => {
    const matchesSearch = camp.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Tất cả' || camp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Nếu đang ở tab Lịch đăng, render SchedulePage toàn màn hình
  if (isScheduleTab) {
    return (
      <SchedulePage
        workspaceId={currentWorkspaceId}
        workspaces={workspaces}
        campaigns={campaigns}
      />
    );
  }

  return (
    <div className="campaign-page-container">
      {/* Campaign Main Body */}
      <main className="campaign-main-content">
        {/* Workspace Selector Bar */}
        <div className="workspace-selector-card">
          <div className="workspace-selector-dropdown">
            <div
              className="workspace-dropdown-trigger"
              onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
              onBlur={() => setTimeout(() => setWsDropdownOpen(false), 200)}
              tabIndex={0}
            >
              <span className="selected-workspace-name">
                {selectedWorkspace ? selectedWorkspace.name : 'Vui lòng chọn Workspace'}
              </span>
              <svg
                className={`dropdown-chevron ${wsDropdownOpen ? 'open' : ''}`}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {wsDropdownOpen && (
              <div className="workspace-dropdown-menu">
                {workspaces.length === 0 ? (
                  <div className="workspace-dropdown-item empty">Không có Workspace</div>
                ) : (
                  workspaces.map((ws) => (
                    <div
                      key={ws.id}
                      className={`workspace-dropdown-item ${ws.id === currentWorkspaceId ? 'active' : ''}`}
                      onClick={() => {
                        setWsDropdownOpen(false);
                        navigate(`/workspaces/${ws.id}/campaigns`);
                      }}
                    >
                      <span>{ws.name}</span>
                      {ws.id === currentWorkspaceId && (
                        <svg
                          className="check-icon"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Fanpage Avatar Stack */}
          {currentWorkspaceId && <WorkspaceFanpageBar workspaceId={currentWorkspaceId} />}
        </div>

        {/* Workspace Title & Create Campaign Button */}
        <div className="workspace-title-section">
          <div className="title-left">
            <span className="workspace-label">Workspace</span>
            <h1 className="workspace-title-main">
              {selectedWorkspace ? selectedWorkspace.name : 'Chọn Workspace'}
            </h1>
            <h2 className="section-subtitle">Chiến dịch</h2>
          </div>
          <div className="title-right">
            <button type="button" className="btn-create-campaign" onClick={handleCreateCampaign}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Tạo chiến dịch
            </button>
          </div>
        </div>

        <div className="campaign-summary-grid">
          <div className="campaign-summary-card">
            <span className="summary-label">Tổng chiến dịch</span>
            <strong className="summary-value">{campaigns.length}</strong>
          </div>
          <div className="campaign-summary-card">
            <span className="summary-label">Đang chạy</span>
            <strong className="summary-value">
              {campaigns.filter((camp) => camp.status === 'Đang chạy').length}
            </strong>
          </div>
          <div className="campaign-summary-card">
            <span className="summary-label">Tạm dừng</span>
            <strong className="summary-value">
              {campaigns.filter((camp) => camp.status === 'Tạm dừng').length}
            </strong>
          </div>
          <div className="campaign-summary-card">
            <span className="summary-label">Hoàn thành</span>
            <strong className="summary-value">
              {campaigns.filter((camp) => camp.status === 'Hoàn thành').length}
            </strong>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="filter-search-container">
          <div className="search-input-wrapper">
            <svg
              className="search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="search-campaign-input"
              placeholder="Tìm chiến dịch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="status-filter-wrapper">
            <select
              className="status-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Tất cả">Tất cả trạng thái</option>
              <option value="Đang chạy">Đang chạy</option>
              <option value="Tạm dừng">Tạm dừng</option>
              <option value="Hoàn thành">Hoàn thành</option>
            </select>
          </div>
        </div>

        {/* Loading & Error states */}
        {loading ? (
          <div className="empty-campaigns-state">
            <p className="empty-text">Đang tải chiến dịch...</p>
          </div>
        ) : error ? (
          <div className="empty-campaigns-state">
            <p className="empty-text">Lỗi: {error}</p>
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <div className="campaigns-cards-grid">
            {filteredCampaigns.map((camp) => (
              <CampaignCard
                key={camp.id}
                initials={camp.initials}
                initialsBg={camp.initialsBg}
                initialsColor={camp.initialsColor}
                status={camp.status}
                title={camp.title}
                dateRange={camp.dateRange}
                topicsCount={camp.topicsCount}
                postsCount={camp.postsCount}
                onClick={() => alert(`Truy cập chiến dịch: ${camp.title}`)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-campaigns-state">
            <p className="empty-text">Chưa có chiến dịch nào. Hãy tạo mới ngay!</p>
          </div>
        )}
      </main>

      <CreateCampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}

export default CampaignListPage;
