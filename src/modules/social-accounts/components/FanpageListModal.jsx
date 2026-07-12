import { useState, useEffect } from 'react';
import { getFanpages, syncFanpages } from '../api/socialAccountApi';

export default function FanpageListModal({ isOpen, onClose, account }) {
  const [fanpages, setFanpages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  const fetchFanpages = async () => {
    if (!account) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getFanpages(account.id);
      setFanpages(data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách Fanpage');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && account) {
      fetchFanpages();
    }
  }, [isOpen, account]);

  const handleSync = async () => {
    if (!account) return;
    setSyncing(true);
    setError(null);
    try {
      const data = await syncFanpages(account.id);
      setFanpages(data || []);
    } catch (err) {
      setError(err.message || 'Đồng bộ thất bại');
    } finally {
      setSyncing(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const parsePermissions = (permissionsStr) => {
    if (!permissionsStr) return [];
    try {
      return JSON.parse(permissionsStr);
    } catch {
      return permissionsStr.split(',').map((p) => p.trim().replace(/"/g, ''));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fanpage-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Quản lý Fanpage</h2>
          {account && <p className="modal-subtitle">{account.name}</p>}
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="fanpage-modal__toolbar">
            <button
              type="button"
              className="fanpage-modal__sync-btn"
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? (
                <>
                  <span className="connect-btn__spinner" />
                  <span>Đang đồng bộ...</span>
                </>
              ) : (
                <>
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
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  <span>Đồng bộ từ Facebook</span>
                </>
              )}
            </button>
          </div>

          {error && <div className="fanpage-modal__error">{error}</div>}

          {loading ? (
            <div className="fanpage-modal__loading">
              <span className="connect-btn__spinner" />
              <span>Đang tải danh sách Fanpage...</span>
            </div>
          ) : fanpages.length === 0 ? (
            <div className="fanpage-modal__empty">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p>Chưa có Fanpage nào được đồng bộ.</p>
              <p className="fanpage-modal__empty-hint">
                Nhấn "Đồng bộ từ Facebook" để tải danh sách.
              </p>
            </div>
          ) : (
            <div className="fanpage-modal__grid">
              {fanpages.map((page) => (
                <div key={page.id} className="fanpage-card">
                  <div className="fanpage-card__avatar">
                    {page.avatarUrl ? (
                      <img
                        src={page.avatarUrl}
                        alt={page.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="fanpage-card__avatar-fallback"
                      style={{ display: page.avatarUrl ? 'none' : 'flex' }}
                    >
                      {getInitials(page.name)}
                    </div>
                  </div>
                  <div className="fanpage-card__info">
                    <h4 className="fanpage-card__name">{page.name}</h4>
                    <div className="fanpage-card__status-row">
                      <span
                        className={`fanpage-card__status-badge fanpage-card__status-badge--${page.status?.toLowerCase()}`}
                      >
                        {page.status === 'ACTIVE' ? 'Đang quản lý' : page.status}
                      </span>
                    </div>
                    {page.lastSyncedAt && (
                      <span className="fanpage-card__synced">
                        Đồng bộ: {new Date(page.lastSyncedAt).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>
                  <div className="fanpage-card__permissions">
                    <span className="fanpage-card__permissions-label">Quyền:</span>
                    <div className="fanpage-card__permissions-list">
                      {parsePermissions(page.permissions).length > 0 ? (
                        parsePermissions(page.permissions).map((perm, i) => (
                          <span key={i} className="fanpage-card__permission-tag">
                            {perm}
                          </span>
                        ))
                      ) : (
                        <span className="fanpage-card__no-perms">Không có</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
