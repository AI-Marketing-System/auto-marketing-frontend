export default function SocialAccountCard({ account, onManageFanpages, onDisconnect }) {
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getInitials = (name) => {
    if (!name) return 'FB';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDisconnect = () => {
    if (window.confirm(`Bạn có chắc muốn ngắt kết nối tài khoản "${account.name}"?`)) {
      if (onDisconnect) onDisconnect(account.id);
    }
  };

  return (
    <div className="sa-card">
      <div className="sa-card__header">
        <div className="sa-card__avatar-wrapper">
          {account.avatarUrl ? (
            <img
              src={account.avatarUrl}
              alt={account.name}
              className="sa-card__avatar"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="sa-card__avatar-fallback"
            style={{ display: account.avatarUrl ? 'none' : 'flex' }}
          >
            {getInitials(account.name)}
          </div>
          <div className="sa-card__provider-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
        </div>
        <div className="sa-card__info">
          <h3 className="sa-card__name">{account.name || 'Facebook Account'}</h3>
          <p className="sa-card__provider">
            {account.provider === 'facebook' ? 'Facebook' : account.provider}
          </p>
        </div>
        <div
          className={`sa-card__status ${account.isActive ? 'sa-card__status--active' : 'sa-card__status--inactive'}`}
        >
          <span className="sa-card__status-dot" />
          {account.isActive ? 'Đã kết nối' : 'Đã ngắt'}
        </div>
      </div>

      <div className="sa-card__meta">
        <div className="sa-card__meta-item">
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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>Kết nối: {formatDate(account.connectedAt)}</span>
        </div>
        <div className="sa-card__meta-item">
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
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>
            ID: {account.providerUserId ? account.providerUserId.slice(0, 12) + '...' : 'N/A'}
          </span>
        </div>
      </div>

      <div className="sa-card__actions">
        <button
          type="button"
          className="sa-card__btn sa-card__btn--primary"
          onClick={() => onManageFanpages(account)}
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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>Quản lý Fanpage</span>
        </button>
        <button
          type="button"
          className="sa-card__btn sa-card__btn--danger"
          onClick={handleDisconnect}
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
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          <span>Ngắt kết nối</span>
        </button>
      </div>
    </div>
  );
}
