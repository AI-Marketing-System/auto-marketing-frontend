import { useState, useEffect } from 'react';
import { listSocialAccounts } from '../../social-accounts/api/socialAccountApi';
import {
  getAvailableFanpages,
  addFanpageToWorkspace,
  getWorkspaceFanpages,
  removeFanpageFromWorkspace,
} from '../api/workspaceFanpageApi';

export default function AddFanpageToWorkspaceModal({ isOpen, onClose, workspaceId, onSuccess }) {
  const [fanpagesByAccount, setFanpagesByAccount] = useState([]);
  const [existingFanpageIds, setExistingFanpageIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  // Load tất cả fanpage available từ tất cả social accounts
  useEffect(() => {
    if (!isOpen || !workspaceId) return;

    async function loadAll() {
      setLoading(true);
      setError(null);
      try {
        // 1. Lấy danh sách fanpage đã có trong workspace
        const existing = await getWorkspaceFanpages(workspaceId);
        setExistingFanpageIds(existing.map((fp) => fp.fanpageId));

        // 2. Lấy danh sách social accounts
        const accounts = await listSocialAccounts();

        // 3. Với mỗi account, lấy available fanpages
        const results = [];
        for (const acc of accounts) {
          const fanpages = await getAvailableFanpages(acc.id);
          results.push({
            accountId: acc.id,
            accountName: acc.name,
            avatarUrl: acc.avatarUrl,
            fanpages: fanpages,
          });
        }
        setFanpagesByAccount(results);
      } catch (err) {
        setError(err.message || 'Không thể tải danh sách Fanpage');
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [isOpen, workspaceId]);

  const handleAdd = async (fanpageId) => {
    setAddingId(fanpageId);
    setError(null);
    try {
      const result = await addFanpageToWorkspace(workspaceId, fanpageId);
      setExistingFanpageIds((prev) => [...prev, fanpageId]);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setError(err.message || 'Thêm Fanpage thất bại');
    } finally {
      setAddingId(null);
    }
  };

  const handleRemove = async (fanpageId, fanpageName) => {
    if (!window.confirm(`Xoá "${fanpageName}" khỏi Workspace?`)) return;
    setRemovingId(fanpageId);
    setError(null);
    try {
      await removeFanpageFromWorkspace(workspaceId, fanpageId);
      setExistingFanpageIds((prev) => prev.filter((id) => id !== fanpageId));
    } catch (err) {
      setError(err.message || 'Xoá thất bại');
    } finally {
      setRemovingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fanpage-add-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Thêm Fanpage vào Workspace</h2>
            <p className="modal-subtitle">Chọn Fanpage để quản lý trong Workspace này (tối đa 5)</p>
          </div>
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
          {error && <div className="sa-page__error">{error}</div>}

          {loading ? (
            <div className="fanpage-modal__loading">
              <span className="connect-btn__spinner" />
              <span>Đang tải danh sách Fanpage...</span>
            </div>
          ) : (
            <div className="fanpage-add-accounts-list">
              {existingFanpageIds.length > 0 && (
                <div className="fanpage-add-section-label">
                  <span className="fanpage-add-section-title">Đã thêm vào Workspace</span>
                  <span className="fanpage-add-section-count">{existingFanpageIds.length}/5</span>
                </div>
              )}
              {existingFanpageIds.length > 0 && (
                <div className="fanpage-add-section">
                  {fanpagesByAccount
                    .flatMap((group) =>
                      group.fanpages.filter((fp) => existingFanpageIds.includes(fp.id))
                    )
                    .map((fp) => (
                      <div
                        key={`existing-${fp.id}`}
                        className="fanpage-add-item fanpage-add-item--added"
                      >
                        <div className="fanpage-add-item-avatar">
                          {fp.avatarUrl ? (
                            <img src={fp.avatarUrl} alt={fp.name} />
                          ) : (
                            <div className="fanpage-card__avatar-fallback">
                              {fp.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                        </div>
                        <div className="fanpage-add-item-info">
                          <a
                            href={`https://facebook.com/${fp.fbPageId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="fanpage-add-item-name"
                          >
                            {fp.name}
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                          <span className="fanpage-add-item-source">Đã liên kết</span>
                        </div>
                        <button
                          type="button"
                          className="fanpage-add-item-btn fanpage-add-item-btn--danger"
                          onClick={() => handleRemove(fp.id, fp.name)}
                          disabled={removingId === fp.id}
                        >
                          {removingId === fp.id ? '...' : 'Xoá'}
                        </button>
                      </div>
                    ))}
                </div>
              )}
              {fanpagesByAccount.map((group) => (
                <div key={group.accountId} className="fanpage-add-group">
                  <div className="fanpage-add-group-header">
                    <div className="sa-card__avatar-wrapper">
                      {group.avatarUrl ? (
                        <img src={group.avatarUrl} alt="" className="min-avatar" />
                      ) : (
                        <div className="min-avatar min-avatar--fallback">
                          {group.accountName?.charAt(0)?.toUpperCase() || 'F'}
                        </div>
                      )}
                    </div>
                    <span className="fanpage-add-group-name">{group.accountName}</span>
                  </div>
                  <div className="fanpage-add-items">
                    {group.fanpages.length === 0 ? (
                      <span className="fanpage-add-empty-text">Chưa có Fanpage nào</span>
                    ) : (
                      group.fanpages.map((fp) => {
                        const alreadyAdded = existingFanpageIds.includes(fp.id);
                        return (
                          <div
                            key={fp.id}
                            className={`fanpage-add-item ${alreadyAdded ? 'fanpage-add-item--added' : ''}`}
                          >
                            <div className="fanpage-add-item-avatar">
                              {fp.avatarUrl ? (
                                <img src={fp.avatarUrl} alt={fp.name} />
                              ) : (
                                <div className="fanpage-card__avatar-fallback">
                                  {fp.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                              )}
                            </div>
                            <div className="fanpage-add-item-info">
                              <a
                                href={`https://facebook.com/${fp.fbPageId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="fanpage-add-item-name"
                              >
                                {fp.name}
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                  <polyline points="15 3 21 3 21 9" />
                                  <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                              </a>
                              <span className="fanpage-add-item-source">
                                Từ: {group.accountName}
                              </span>
                            </div>
                            {alreadyAdded ? (
                              <span className="fanpage-add-item-check">&#10003; Đã thêm</span>
                            ) : (
                              <button
                                type="button"
                                className="fanpage-add-item-btn"
                                onClick={() => handleAdd(fp.id)}
                                disabled={addingId === fp.id}
                              >
                                {addingId === fp.id ? '...' : '+ Thêm'}
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
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
