import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginModal from '../../modules/auth/components/LoginModal';
import './DashboardLayout.css';

export default function UserDropdown({
  subscription,
  onUpgradeClick,
  onQuotaClick,
  onProfileClick,
  onSettingsClick,
}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('main'); // 'main' or 'accounts'
  const { user, logout, sessions, switchAccount } = useAuth();
  const navigate = useNavigate();
  const ref = useRef(null);
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Don't close if clicking inside login modal
      if (e.target.closest('.login-modal-overlay')) return;
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
      <div className="user-dropdown__pill-container">
        <div className="user-dropdown__profile-trigger" onClick={() => setOpen((v) => !v)}>
          <div className="user-dropdown__avatar-circle">{getInitials(user?.fullName)}</div>
          <div className="user-dropdown__profile-details">
            <span className="user-dropdown__name-text">{user?.fullName || 'User'}</span>
            <span className="user-dropdown__tier-text">
              {subscription?.planName || 'Free'} {subscription?.isTrial ? '(Dùng thử)' : ''}
            </span>
          </div>
        </div>

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

              {onQuotaClick && (
                <button
                  className="user-dropdown__item"
                  onClick={() => {
                    setOpen(false);
                    onQuotaClick();
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
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                  <span>Hạn mức sử dụng</span>
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
                <span>Tài khoản</span>
              </div>

              <div className="user-dropdown__divider" />

              {/* List of active sessions */}
              {sessions?.map((s) => (
                <div 
                  key={s.user.id} 
                  className={`user-dropdown__account-item ${user?.id === s.user.id ? 'active' : ''}`}
                  onClick={() => {
                    if (user?.id !== s.user.id) {
                      switchAccount(s.user.id);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="user-dropdown__avatar-circle mini">
                    {getInitials(s.user?.fullName)}
                  </div>
                  <div className="user-dropdown__account-details">
                    <span className="user-dropdown__account-name">{s.user?.fullName}</span>
                    <span className="user-dropdown__account-email">{s.user?.email}</span>
                  </div>
                  {user?.id === s.user.id && (
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
                  )}
                </div>
              ))}

              <div className="user-dropdown__divider" />

              <button
                className="user-dropdown__item add-account-btn"
                onClick={() => setIsLoginModalOpen(true)}
              >
                <span className="add-account-icon">+</span>
                <span>Thêm tài khoản</span>
              </button>
            </>
          )}
        </div>
      )}
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onSuccess={() => {
           setOpen(false);
           setActiveTab('main');
        }}
      />
    </div>
  );
}
