import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import UserDropdown from './UserDropdown';
import './DashboardLayout.css';

/** Tabs hiển thị khi đang ở khu vực Chiến dịch / Lịch đăng */
function CampaignTabs() {
  const location = useLocation();
  const navigate = useNavigate();

  // Xác định tab active dựa trên hash hoặc pathname
  const isSchedule = location.hash === '#schedule';

  return (
    <div className="topbar__campaign-tabs">
      <button
        type="button"
        className={`topbar__tab-btn${!isSchedule ? ' topbar__tab-btn--active' : ''}`}
        onClick={() => navigate('/campaigns')}
        id="tab-chien-dich"
      >
        Chiến dịch
      </button>
      <button
        type="button"
        className={`topbar__tab-btn${isSchedule ? ' topbar__tab-btn--active' : ''}`}
        onClick={() => navigate('/campaigns#schedule')}
        id="tab-lich-dang"
      >
        Lịch đăng
      </button>
    </div>
  );
}

export default function DashboardLayout({ children, variant = 'dashboard' }) {
  const location = useLocation();
  const isCampaignArea = location.pathname === '/campaigns';

  return (
    <div className="layout">
      <Sidebar variant={variant} />
      <div className="main">
        <header className="topbar">
          <div className="topbar__left">
            <span className="topbar__title">
              {variant === 'admin' ? 'Admin' : 'Dashboard'}
            </span>
          </div>

          {/* Tabs Chiến dịch / Lịch đăng — chỉ hiển thị trong khu vực campaigns */}
          {isCampaignArea && <CampaignTabs />}

          <div className="topbar__right">
            <button type="button" className="topbar__help">
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
            </button>
            <UserDropdown />
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
