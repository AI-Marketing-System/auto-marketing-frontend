import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './DashboardLayout.css';

export default function UserDropdown({
  subscription,
  onUpgradeClick,
  onProfileClick,
  onSettingsClick,
}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('main'); // 'main' or 'accounts'
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setActiveTab('main');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    setActiveTab('main');
    await logout('/api/v1');
    navigate('/login', { replace: true });
  };

  const getInitials = (name) => {
    if (!name) return 'US';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="user-dropdown" ref={ref}>
      {/* Khối Pill Widget thống nhất bao bọc toàn bộ thông tin */}
      <div className="user-dropdown__pill-container">
        {/* Click vào Avatar + Tên để mở rộng Dropdown */}
        <div className="user-dropdown__profile-trigger" onClick={() => setOpen((v) => !v)}>
          <div className="user-dropdown__avatar-circle">{getInitials(user?.fullName)}</div>
          <div className="user-dropdown__profile-details">
            <span className="user-dropdown__name-text">{user?.fullName || 'User'}</span>
            <span className="user-dropdown__tier-text">
              {subscription?.planName || 'Free'} {subscription?.isTrial ? '(Dùng thử)' : ''}
            </span>
          </div>
        </div>

        {/* Nút nâng cấp nằm gọn bên phải cùng */}
        {subscription?.planName !== 'Admin' && (
          <button type="button" className="user-dropdown__btn-upgrade" onClick={onUpgradeClick}>
            Nâng cấp
          </button>
        )}
      </div>

      {open && (
        <div className="user-dropdown__menu">
          {activeTab === 'main' ? (
            <>
              {/* Profile Header Button */}
              <div className="user-dropdown__header-item" onClick={() => setActiveTab('accounts')}>
                <div className="user-dropdown__avatar-circle">{getInitials(user?.fullName)}</div>
                <div className="user-dropdown__profile-details">
                  <span className="user-dropdown__name-text">{user?.fullName}</span>
                  <span className="user-dropdown__tier-text">
                    {subscription?.planName || 'Free'} {subscription?.isTrial ? '(Dùng thử)' : ''}
                  </span>
                </div>
                <span className="user-dropdown__chevron-right">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </span>
              </div>

              <div className="user-dropdown__divider" />

              {/* Menu Items */}
              {subscription?.planName !== 'Admin' && (
                <button
                  className="user-dropdown__item"
                  onClick={() => {
                    setOpen(false);
                    onUpgradeClick();
                  }}
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
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span>Nâng cấp gói</span>
                </button>
              )}

              <button
                className="user-dropdown__item"
                onClick={() => alert('Chức năng Cá nhân hóa đang phát triển.')}
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
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                <span>Cá nhân hóa</span>
              </button>

              <button
                className="user-dropdown__item"
                onClick={() => {
                  setOpen(false);
                  onProfileClick();
                }}
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Hồ sơ</span>
              </button>

              <button
                className="user-dropdown__item"
                onClick={() => {
                  setOpen(false);
                  onSettingsClick();
                }}
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
                <span>Cài đặt</span>
              </button>

              <div className="user-dropdown__divider" />

              <button
                className="user-dropdown__item"
                onClick={() => alert('Trợ giúp đang phát triển.')}
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
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>Trợ giúp</span>
                <span className="user-dropdown__chevron-right" style={{ marginLeft: 'auto' }}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </span>
              </button>

              <button className="user-dropdown__item" onClick={handleLogout}>
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
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Đăng xuất</span>
              </button>
            </>
          ) : (
            <>
              {/* Back Header */}
              <div className="user-dropdown__back-header" onClick={() => setActiveTab('main')}>
                <span className="user-dropdown__chevron-left">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </span>
                <span>{user?.email}</span>
              </div>

              <div className="user-dropdown__divider" />

              {/* Account details */}
              <div className="user-dropdown__account-item active">
                <div className="user-dropdown__avatar-circle mini">
                  {getInitials(user?.fullName)}
                </div>
                <div className="user-dropdown__account-details">
                  <span className="user-dropdown__account-name">{user?.fullName}</span>
                  <span className="user-dropdown__account-email">{user?.email}</span>
                </div>
                <span className="user-dropdown__checkmark">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
              </div>

              <div className="user-dropdown__divider" />

              <button
                className="user-dropdown__item add-account-btn"
                onClick={() => alert('Chức năng Thêm tài khoản đang phát triển.')}
              >
                <span className="add-account-icon">+</span>
                <span>Thêm tài khoản</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
