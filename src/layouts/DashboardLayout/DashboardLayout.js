import Sidebar from './Sidebar';
import UserDropdown from './UserDropdown';
import './DashboardLayout.css';

export default function DashboardLayout({ children, variant = 'dashboard' }) {
  return (
    <div className="layout">
      <Sidebar variant={variant} />
      <div className="main">
        <header className="topbar">
          <div className="topbar__left">
            <span className="topbar__title">Dashboard</span>
          </div>
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
