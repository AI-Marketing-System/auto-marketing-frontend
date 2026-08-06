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

  useEffect(() => {
    const handlePaymentRequired = () => {
      setIsUpgradeModalOpen(true);
    };
    window.addEventListener('subscription:payment_required', handlePaymentRequired);
    return () => {
      window.removeEventListener('subscription:payment_required', handlePaymentRequired);
    };
  }, []);

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
      </div>
    </QuotaProvider>
  );
}
