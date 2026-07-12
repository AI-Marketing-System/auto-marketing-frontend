import { useState, useEffect } from 'react';
import { getWorkspaceFanpages, removeFanpageFromWorkspace } from '../api/workspaceFanpageApi';
import AddFanpageToWorkspaceModal from './AddFanpageToWorkspaceModal';

export default function WorkspaceFanpageBar({ workspaceId }) {
  const [fanpages, setFanpages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchFanpages = async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const data = await getWorkspaceFanpages(workspaceId);
      setFanpages(data || []);
    } catch (err) {
      console.error('Failed to load workspace fanpages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFanpages();
  }, [workspaceId]);

  const handleAddSuccess = (newFanpage) => {
    setIsAddModalOpen(false);
    fetchFanpages();
  };

  const handleRemove = async (fanpageId, fanpageName) => {
    if (!window.confirm(`Xoá "${fanpageName}" khỏi Workspace?`)) return;
    try {
      await removeFanpageFromWorkspace(workspaceId, fanpageId);
      setFanpages((prev) => prev.filter((fp) => fp.fanpageId !== fanpageId));
    } catch (err) {
      alert(err.message || 'Xoá thất bại');
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

  return (
    <>
      <div className="connected-accounts-section">
        {loading ? (
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Đang tải...</span>
        ) : fanpages.length === 0 ? (
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Chưa có Fanpage</span>
        ) : (
          fanpages.map((fp) => (
            <div
              key={fp.id}
              className="connected-avatar-wrapper"
              title={`${fp.fanpageName} (${fp.socialAccountName || 'N/A'})`}
            >
              <div className="avatar-img-circle" style={{ backgroundColor: '#3b82f6' }}>
                {fp.fanpageAvatarUrl ? (
                  <img
                    src={fp.fanpageAvatarUrl}
                    alt={fp.fanpageName}
                    className="avatar-img-circle-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span
                  className="avatar-initial"
                  style={{ display: fp.fanpageAvatarUrl ? 'none' : 'flex' }}
                >
                  {getInitials(fp.fanpageName)}
                </span>
              </div>
              <div className="social-badge facebook-badge">
                <span>f</span>
              </div>
              <button
                type="button"
                className="fanpage-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(fp.fanpageId, fp.fanpageName);
                }}
                title="Xoá fanpage khỏi workspace"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))
        )}

        {/* Add Fanpage Button */}
        <button
          type="button"
          className="add-account-circle-btn"
          onClick={() => setIsAddModalOpen(true)}
          title="Thêm Fanpage vào Workspace"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <AddFanpageToWorkspaceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        workspaceId={workspaceId}
        onSuccess={handleAddSuccess}
      />
    </>
  );
}
