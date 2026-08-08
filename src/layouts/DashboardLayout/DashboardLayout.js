import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/env';
import Sidebar from './Sidebar';
import UserDropdown from './UserDropdown';
import UpgradeModal from '../../modules/subscription/components/UpgradeModal';
import QuotaModal from '../../modules/subscription/components/QuotaModal';
import { QuotaProvider } from '../../modules/subscription/context/QuotaContext';
import SettingsModal from '../../modules/auth/components/SettingsModal';
import './DashboardLayout.css';

function CampaignTabs() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract workspaceId from pathname if present
  const wsMatch = location.pathname.match(/\/workspaces\/([^/]+)/);
  const workspaceId = wsMatch ? wsMatch[1] : null;

  // Xác định tab active dựa trên hash hoặc pathname
  const isSchedule = location.hash === '#schedule';

  const navigateTo = (hash) => {
    if (workspaceId) {
      navigate(`/workspaces/${workspaceId}/campaigns${hash}`);
    } else {
      navigate(`/campaigns${hash}`);
    }
  };

  return (
    <div className="topbar__campaign-tabs">
      <button
        type="button"
        className={`topbar__tab-btn${!isSchedule ? ' topbar__tab-btn--active' : ''}`}
        onClick={() => navigateTo('')}
        id="tab-chien-dich"
      >
        Chiến dịch
      </button>
      <button
        type="button"
        className={`topbar__tab-btn${isSchedule ? ' topbar__tab-btn--active' : ''}`}
        onClick={() => navigateTo('#schedule')}
        id="tab-lich-dang"
      >
        Lịch đăng
      </button>
    </div>
  );
}

export default function DashboardLayout({ children, variant = 'dashboard' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isCampaignArea = location.pathname.includes('/campaigns');
  const isSocialAccounts = location.pathname === '/social-accounts';

  const [subscription, setSubscription] = useState({
    id: null,
    planName: 'Free',
    planPrice: 0,
    isTrial: false,
  });
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsActiveTab, setSettingsActiveTab] = useState('account');

  const fetchSubscription = () => {
    const token = localStorage.getItem('marqops.authLab.accessToken');
    if (!token) return;

    fetch(`${API_BASE_URL}/subscriptions/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('No subscription');
        }
        return res.json();
      })
      .then((resJson) => {
        if (resJson && resJson.success && resJson.data) {
          setSubscription({
            id: resJson.data.id,
            planName: resJson.data.planName,
            planPrice: resJson.data.planPrice || 0,
            isTrial: resJson.data.isTrial || false,
            startDate: resJson.data.startDate,
            endDate: resJson.data.endDate,
          });
        }
      })
      .catch((err) => {
        setSubscription({ id: null, planName: 'Free', planPrice: 0, isTrial: false });
      });
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('payment_success') === 'true') {
      setIsUpgradeModalOpen(true);
      // Xóa query param để không bị mở lại khi F5
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const [kickedWorkspaceId, setKickedWorkspaceId] = useState(null);

  useEffect(() => {
    const handlePaymentRequired = () => {
      setIsUpgradeModalOpen(true);
    };

    const handleMemberRemoved = (e) => {
      const removedWorkspaceId = e.detail?.workspaceId;
      const currentWorkspaceMatch = location.pathname.match(/\/workspaces\/([^/]+)/);
      const currentWorkspaceId = currentWorkspaceMatch ? currentWorkspaceMatch[1] : null;

      if (removedWorkspaceId && currentWorkspaceId === removedWorkspaceId) {
        setKickedWorkspaceId(removedWorkspaceId);
      }
    };

    window.addEventListener('subscription:payment_required', handlePaymentRequired);
    window.addEventListener('workspace:member_removed', handleMemberRemoved);
    return () => {
      window.removeEventListener('subscription:payment_required', handlePaymentRequired);
      window.removeEventListener('workspace:member_removed', handleMemberRemoved);
    };
  }, [location.pathname]);

  const handleKickedAcknowledge = () => {
    setKickedWorkspaceId(null);
    navigate('/dashboard');
  };

  return (
    <QuotaProvider>
      <div className="layout">
        <Sidebar variant={variant} />
        <div className="main">
          <header className="topbar">
            <div className="topbar__left">
              <span className="topbar__title">
                {isSocialAccounts
                  ? 'Tài khoản mạng xã hội'
                  : variant === 'admin'
                    ? 'Admin'
                    : 'Dashboard'}
              </span>
            </div>

            {/* Tabs Chiến dịch / Lịch đăng — chỉ hiển thị trong khu vực campaigns */}
            {isCampaignArea && <CampaignTabs />}

            <div className="topbar__right">
              {/* <button type="button" className="topbar__help">
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
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
                </svg>
                <span>Trợ giúp</span>
              </button> */}
              <UserDropdown
                subscription={subscription}
                onUpgradeClick={() => setIsUpgradeModalOpen(true)}
                onQuotaClick={() => setIsQuotaModalOpen(true)}
                onProfileClick={() => {
                  setSettingsActiveTab('account');
                  setIsSettingsOpen(true);
                }}
                onSettingsClick={() => {
                  setSettingsActiveTab('billing');
                  setIsSettingsOpen(true);
                }}
              />
            </div>
          </header>
          <main className="content">{children}</main>
        </div>

        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          onUpgradeSuccess={fetchSubscription}
          currentSubscription={subscription}
        />

        <QuotaModal
          isOpen={isQuotaModalOpen}
          onClose={() => setIsQuotaModalOpen(false)}
          onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          initialTab={settingsActiveTab}
          subscription={subscription}
          onCancelSuccess={fetchSubscription}
        />

        {kickedWorkspaceId && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{
              background: '#fff',
              padding: '32px',
              borderRadius: '16px',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <h3 style={{ margin: '0 0 12px', fontSize: '20px', color: '#0f172a' }}>Quyền truy cập bị thu hồi</h3>
              <p style={{ margin: '0 0 24px', color: '#475569', lineHeight: 1.5 }}>
                Quản trị viên đã xóa bạn khỏi Workspace này. Bạn không thể tiếp tục thao tác và các thay đổi chưa lưu sẽ không được giữ lại.
              </p>
              <button
                onClick={handleKickedAcknowledge}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#2563eb'}
                onMouseOut={(e) => e.target.style.background = '#3b82f6'}
              >
                Quay lại trang chủ
              </button>
            </div>
          </div>
        )}
      </div>
    </QuotaProvider>
  );
}
