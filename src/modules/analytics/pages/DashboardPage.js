import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import '../styles/DashboardPage.css';
import Brand from '../../../public-site/components/Brand';
import WorkspaceCard from '../components/WorkspaceCard';
import SharedWorkspaceCard from '../components/SharedWorkspaceCard';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal';
import UpgradeModal from '../components/UpgradeModal';

function DashboardPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState({ planName: 'Free', planPrice: 0, isTrial: false });
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState([
    { id: 1, title: 'Client – Coffee House Brand', accountsCount: 2 },
    { id: 2, title: 'Thương hiệu của Nguyễn Gia Kiệt', accountsCount: 1 },
  ]);
  const [sharedWorkspaces] = useState([
    {
      id: 3,
      title: 'FitLife Nutrition',
      role: 'MEMBER',
      campaigns: ['FitLife Fanpage', 'Summer Campaign 2026'],
    },
    { id: 4, title: 'TechVista Solutions', role: 'ADMIN', campaigns: ['TechVista Marketing'] },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hàm tải thông tin Subscription của user từ Backend
  const fetchSubscription = () => {
    const token = localStorage.getItem("marqops.authLab.accessToken");
    if (!token) return;

    fetch("http://localhost:8080/api/v1/subscriptions/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("No subscription");
        }
        return res.json();
      })
      .then((resJson) => {
        if (resJson && resJson.success && resJson.data) {
          setSubscription({
            planName: resJson.data.planName,
            planPrice: resJson.data.planPrice || 0,
            isTrial: resJson.data.isTrial || false,
          });
        }
      })
      .catch((err) => {
        // Nếu lỗi (ví dụ 404 chưa đăng ký gói nào), mặc định là Free
        setSubscription({ planName: 'Free', planPrice: 0, isTrial: false });
      });
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleCreateWorkspace = () => {
    console.log('Opening create workspace modal');
    setIsModalOpen(true);
  };

  const handleModalSubmit = (data) => {
    console.log('Creating workspace with data:', data);
    setWorkspaces([...workspaces, { id: Date.now(), title: data.title, accountsCount: 0 }]);
    setIsModalOpen(false);
  };

  const handleSettingsClick = (workspace) => {
    console.log('Settings clicked for workspace:', workspace.title);
    alert(`Cài đặt Workspace: ${workspace.title}`);
  };

  const handleCardClick = (workspace) => {
    console.log('Workspace clicked:', workspace.title);
    alert(`Truy cập vào Workspace: ${workspace.title}`);
  };

  return (
    <div className="dashboard-container">
      {/* Top Navigation Header */}
      <header className="dashboard-header-bar">
        <div className="header-left">
          <Brand className="dashboard-brand" textClassName="brand-name" />
        </div>
        <div className="header-right">
          <button type="button" className="help-link-btn">
            <span className="help-text">Trợ giúp</span>
            <svg
              className="help-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
            </svg>
          </button>
          
          {/* Vùng hiển thị User và nút Nâng cấp dạng phẳng */}
          <div className="user-profile-widget">
            <div className="user-profile-avatar">
              {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'US'}
            </div>
            <div className="user-profile-details">
              <span className="user-profile-name">{user?.fullName || 'User'}</span>
              <span className="user-profile-tier">
                {subscription.planName} {subscription.isTrial ? "(Dùng thử)" : ""}
              </span>
            </div>
            <button 
              type="button" 
              className="btn-upgrade-action" 
              onClick={() => setIsUpgradeModalOpen(true)}
            >
              Nâng cấp
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Inner Body */}
      <main className="dashboard-main-content">
        <div className="dashboard-inner-container">
          {/* Greeting Header */}
          <div className="greeting-section">
            <h1 className="greeting-title">Xin chào {user?.fullName || 'User'} !</h1>
          </div>

          {/* Section 1: My Workspaces */}
          <section className="workspace-section-container">
            <div className="section-header">
              <div className="section-title-wrapper">
                <div className="icon-badge purple-badge">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 21h18M3 10h18M5 10V21M19 21V10M9 21V14h6v7M4 10l8-7 8 7" />
                  </svg>
                </div>
                <h2 className="section-title-text">Workspace của tôi</h2>
                <span className="tooltip-icon" title="Các workspace do bạn sở hữu">
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
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
                  </svg>
                </span>
              </div>
              <div className="section-meta-info">
                <span className="owner-role-badge">Vai trò: Owner</span>
                <span className="tier-label">Business Tier</span>
                <button
                  type="button"
                  className="icon-btn section-settings-btn"
                  onClick={() => alert('Cài đặt tài khoản/tổ chức')}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Grid of Workspaces */}
            <div className="workspaces-grid">
              {/* Creator Card */}
              <WorkspaceCard isCreator={true} onCardClick={handleCreateWorkspace} />

              {/* Normal Workspace Cards */}
              {workspaces.map((ws) => (
                <WorkspaceCard
                  key={ws.id}
                  title={ws.title}
                  accountsCount={ws.accountsCount}
                  onSettingsClick={() => handleSettingsClick(ws)}
                  onCardClick={() => handleCardClick(ws)}
                />
              ))}
            </div>
          </section>

          {/* Section 2: Shared Workspaces */}
          <section className="shared-section-container">
            <div className="section-header center-header">
              <div className="section-title-wrapper justify-center">
                <h2 className="section-title-text shared-title-text">Workspace được chia sẻ</h2>
                <span
                  className="tooltip-icon"
                  title="Các workspace được chia sẻ quyền quản trị/thành viên với bạn"
                >
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
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Flex / Grid of Shared Workspaces */}
            <div className="shared-workspaces-flex">
              {sharedWorkspaces.map((ws) => (
                <SharedWorkspaceCard
                  key={ws.id}
                  role={ws.role}
                  title={ws.title}
                  campaigns={ws.campaigns}
                  onSettingsClick={() => handleSettingsClick(ws)}
                  onCardClick={() => handleCardClick(ws)}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onUpgradeSuccess={fetchSubscription}
        currentSubscription={subscription}
      />
    </div>
  );
}

export default DashboardPage;
