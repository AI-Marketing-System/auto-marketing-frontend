import React, { useState, useEffect, useRef } from 'react';

function WorkspaceCard({
  isCreator = false,
  title,
  accountsCount,
  avatarUrl,
  onEditClick,
  onDeleteClick,
  onCardClick,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);
  if (isCreator) {
    return (
      <div className="workspace-card creator-card" onClick={onCardClick}>
        <div className="creator-icon-wrapper">
          <svg
            width="44"
            height="44"
            viewBox="0 0 44 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="22" cy="22" r="22" fill="#818cf8" />
            <circle cx="15" cy="15" r="4.5" fill="white" />
            <circle cx="29" cy="15" r="4.5" fill="white" />
            <circle cx="15" cy="29" r="4.5" fill="white" />
            <circle cx="29" cy="29" r="4.5" fill="white" />
            {/* Plus sign inside the bottom-right bubble */}
            <path d="M27 29h4M29 27v4" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <span className="creator-text">Tạo workspace mới</span>
      </div>
    );
  }

  return (
    <div className="workspace-card" onClick={onCardClick}>
      <div className="workspace-card-header">
        {avatarUrl ? (
          <img src={avatarUrl} alt={title} className="workspace-avatar" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
        ) : (
          <span className="workspace-tag">WORKSPACE</span>
        )}
        <div
          ref={dropdownRef}
          className="settings-btn"
          style={{ position: 'absolute', top: '14px', right: '14px', zIndex: 100 }}
        >
          <button
            type="button"
            className="icon-btn"
            style={{
              border: 'none',
              background: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
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
          </button>
          {showDropdown && (
            <div className="workspace-card-dropdown" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(false);
                  onEditClick && onEditClick();
                }}
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
                  style={{ marginRight: '8px' }}
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Chỉnh sửa
              </button>
              <button
                type="button"
                className="dropdown-item delete-option"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(false);
                  onDeleteClick && onDeleteClick();
                }}
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
                  style={{ marginRight: '8px' }}
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Xóa
              </button>
            </div>
          )}
        </div>
      </div>
      <h3 className="workspace-title">{title}</h3>
      <div className="workspace-card-footer">
        <span className="mini-logo-icon">
          <svg
            width="18"
            height="18"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M40 50 C 40 40, 50 30, 60 30 H 140 C 150 30, 160 40, 160 50 V 170 C 160 175, 155 180, 150 180 H 50 C 45 180, 40 175, 40 170 Z"
              fill="#783e19"
            />
            <rect x="50" y="60" width="100" height="110" rx="8" fill="#FDFBF7" />
            <path
              d="M50 68 C 50 64, 54 60, 58 60 H 142 C 146 60, 150 64, 150 68 V 90 H 50 Z"
              fill="#4e8250"
            />
            <circle cx="70" cy="45" r="8" fill="#E8DCC4" />
            <circle cx="100" cy="45" r="8" fill="#E8DCC4" />
            <circle cx="130" cy="45" r="8" fill="#E8DCC4" />
            <path d="M70 25 V 50" stroke="#708090" strokeWidth="8" strokeLinecap="round" />
            <path d="M100 25 V 50" stroke="#708090" strokeWidth="8" strokeLinecap="round" />
            <path d="M130 25 V 50" stroke="#708090" strokeWidth="8" strokeLinecap="round" />
            <rect x="65" y="105" width="12" height="12" rx="2" fill="#E8DCC4" />
            <rect x="85" y="105" width="12" height="12" rx="2" fill="#E8DCC4" />
            <rect x="105" y="105" width="12" height="12" rx="2" fill="#E8DCC4" />
            <rect x="125" y="105" width="12" height="12" rx="2" fill="#4e8250" />
            <rect x="65" y="125" width="12" height="12" rx="2" fill="#E8DCC4" />
            <rect x="85" y="125" width="12" height="12" rx="2" fill="#d05a3f" />
            <rect x="105" y="125" width="12" height="12" rx="2" fill="#E8DCC4" />
            <rect x="125" y="125" width="12" height="12" rx="2" fill="#E8DCC4" />
            <rect x="65" y="145" width="12" height="12" rx="2" fill="#E8DCC4" />
            <rect x="85" y="145" width="12" height="12" rx="2" fill="#E8DCC4" />
            <rect x="105" y="145" width="12" height="12" rx="2" fill="#3f6ad0" />
            <rect x="125" y="145" width="12" height="12" rx="2" fill="#E8DCC4" />
          </svg>
        </span>
        <span className="workspace-accounts-text">{accountsCount} Fanpages liên kết</span>
      </div>
    </div>
  );
}

export default WorkspaceCard;
