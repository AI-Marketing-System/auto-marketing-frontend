import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './DashboardLayout.css';

export default function UserDropdown({ subscription, onUpgradeClick }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await logout('/api/v1');
    navigate('/login', { replace: true });
  };

  const getInitials = (name) => {
    if (!name) return "US";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="user-dropdown" ref={ref}>
      {/* Khối Pill Widget thống nhất bao bọc toàn bộ thông tin */}
      <div className="user-dropdown__pill-container">
        
        {/* Click vào Avatar + Tên để mở rộng Dropdown */}
        <div className="user-dropdown__profile-trigger" onClick={() => setOpen((v) => !v)}>
          <div className="user-dropdown__avatar-circle">
            {getInitials(user?.fullName)}
          </div>
          <div className="user-dropdown__profile-details">
            <span className="user-dropdown__name-text">{user?.fullName || 'User'}</span>
            <span className="user-dropdown__tier-text">
              {subscription?.planName || 'Free'} {subscription?.isTrial ? "(Dùng thử)" : ""}
            </span>
          </div>
        </div>

        {/* Nút nâng cấp nằm gọn bên phải cùng */}
        {subscription?.planName !== 'Admin' && (
          <button 
            type="button" 
            className="user-dropdown__btn-upgrade"
            onClick={onUpgradeClick}
          >
            Nâng cấp
          </button>
        )}
      </div>

      {open && (
        <div className="user-dropdown__menu">
          <div className="user-dropdown__header">
            <div className="user-dropdown__header-name">{user?.fullName}</div>
            <div className="user-dropdown__header-email">{user?.email}</div>
          </div>
          <div className="user-dropdown__divider" />
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
        </div>
      )}
    </div>
  );
}
