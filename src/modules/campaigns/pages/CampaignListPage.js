import React, { useEffect, useState } from 'react';
import '../styles/CampaignListPage.css';
import Brand from '../../../public-site/components/Brand';
import CampaignCard from '../components/CampaignCard';
import CreateCampaignModal from '../components/CreateCampaignModal';
import { campaignApi, workspaceApi } from '../api/campaignApi';
import { API_BASE_URL } from '../../../config/env';

function CampaignListPage() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    workspaceApi
      .myWorkspaces(API_BASE_URL)
      .then((res) => {
        if (!cancelled && res && res.data && Array.isArray(res.data)) {
          setWorkspaces(res.data);
          if (res.length > 0) setSelectedWorkspaceId(res.data[0].id);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedWorkspaceId == null) return;
    async function loadCampaigns() {
      setLoading(true);
      setError(null);
      try {
        const response = await campaignApi.list(API_BASE_URL);
        const data = Array.isArray(response) ? response : response?.data || [];
        if (Array.isArray(data)) {
          setCampaigns(
            data.map((campaign) => ({
              id: campaign.id,
              initials: generateInitials(campaign.name || campaign.title || 'CD'),
              initialsBg: getInitialBgColor(campaign.id),
              initialsColor: getInitialTextColor(campaign.id),
              status: campaign.status || 'Đang chạy',
              title: campaign.name || campaign.title || 'Chiến dịch mới',
              dateRange: campaign.dateRange || campaign.dates || '--',
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
  }, [selectedWorkspaceId]);

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
      setCampaigns((prev) => [
        {
          id: created.id || Date.now(),
          initials: generateInitials(created.name || data.title),
          initialsBg: getInitialBgColor(created.id || prev.length),
          initialsColor: getInitialTextColor(created.id || prev.length),
          status: created.status || data.status,
          title: created.name || data.title,
          dateRange: created.dateRange || data.dateRange,
          topicsCount: created.topicsCount ?? 0,
          postsCount: created.postsCount ?? 0,
        },
        ...prev,
      ]);
      setIsModalOpen(false);
    } catch (err) {
      window.alert(err.message || 'Không thể tạo chiến dịch. Vui lòng thử lại.');
    }
  };

  const selectedWorkspace = workspaces.find((ws) => ws.id === selectedWorkspaceId);

  const filteredCampaigns = campaigns.filter((camp) => {
    const matchesSearch = camp.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Tất cả' || camp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="campaign-page-container">
      {/* Navigation Header */}
      <header className="campaign-header-bar">
        <div className="header-left">
          <Brand className="campaign-brand" textClassName="brand-name" />
        </div>

        {/* Center Tab Selector */}
        <div className="header-center-tabs">
          <button
            type="button"
            className={`tab-link-btn ${activeTab === 'campaigns' ? 'active' : ''}`}
            onClick={() => setActiveTab('campaigns')}
          >
            Chiến dịch
          </button>
          <button
            type="button"
            className={`tab-link-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            Lịch đăng
          </button>
        </div>

        <div className="header-right">
          <button type="button" className="help-link-btn">
            <svg
              className="help-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
            </svg>
            <span className="help-text">Trợ giúp</span>
          </button>
          <div className="user-avatar-initials">NK</div>
        </div>
      </header>

      {/* Campaign Main Body */}
      <main className="campaign-main-content">
        {/* Workspace Selector Bar */}
        <div className="workspace-selector-card">
          <div className="workspace-selector-dropdown">
            <select
              className="selected-workspace-name"
              value={selectedWorkspaceId ?? ''}
              onChange={(e) => setSelectedWorkspaceId(Number(e.target.value))}
            >
              {workspaces.length === 0 && <option value="">Không có workspace</option>}
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          {/* Connected Social Accounts */}
          <div className="connected-accounts-section">
            <div className="connected-avatar-wrapper">
              <div className="avatar-img-circle bg-blue">
                <span className="avatar-initial">CH</span>
              </div>
              <div className="social-badge facebook-badge">
                <span>f</span>
              </div>
            </div>

            <div className="connected-avatar-wrapper">
              <div className="avatar-img-circle bg-orange">
                <span className="avatar-initial">PL</span>
              </div>
              <div className="social-badge facebook-badge">
                <span>f</span>
              </div>
            </div>

            {/* Add Account Button */}
            <button
              type="button"
              className="add-account-circle-btn"
              onClick={() => alert('Kết nối tài khoản mạng xã hội mới')}
            >
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
            </button>
          </div>
        </div>

        {/* Workspace Title & Create Campaign Button */}
        <div className="workspace-title-section">
          <div className="title-left">
            <span className="workspace-label">Workspace</span>
            <h1 className="workspace-title-main">
              {selectedWorkspace ? selectedWorkspace.name : 'Chọn workspace'}
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
