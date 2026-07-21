import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../config/env';
import '../styles/DashboardPage.css';
import WorkspaceCard from '../components/WorkspaceCard';
import SharedWorkspaceCard from '../components/SharedWorkspaceCard';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal';

function DashboardPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sharedWorkspaces] = useState([
    {
      id: 3,
      title: 'FitLife Nutrition',
      role: 'MEMBER',
      campaigns: ['FitLife Fanpage', 'Summer Campaign 2026'],
    },
    { id: 4, title: 'TechVista Solutions', role: 'ADMIN', campaigns: ['TechVista Marketing'] },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);

  const fetchWorkspaces = () => {
    setLoading(true);
    const token = localStorage.getItem('marqops.authLab.accessToken');
    fetch(`${API_BASE_URL}/workspaces`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Không thể tải danh sách workspace');
        return res.json();
      })
      .then((resJson) => {
        if (resJson && resJson.success && resJson.data) {
          const mapped = resJson.data.map((ws) => ({
            id: ws.id,
            title: ws.name,
            description: ws.description,
            slug: ws.slug,
            accountsCount: ws.fanpageCount || 0,
          }));
          setWorkspaces(mapped);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreateWorkspace = () => {
    console.log('Opening create workspace modal');
    setIsModalOpen(true);
  };

  const handleModalSubmit = (data) => {
    const token = localStorage.getItem('marqops.authLab.accessToken');
    if (editingWorkspace) {
      // Edit Workspace
      fetch(`${API_BASE_URL}/workspaces/${editingWorkspace.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.title,
          description: data.description || '',
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Không thể cập nhật thông tin workspace');
          return res.json();
        })
        .then((resJson) => {
          if (resJson && resJson.success && resJson.data) {
            const updated = resJson.data;
            setWorkspaces((prev) =>
              prev.map((ws) =>
                ws.id === updated.id
                  ? {
                      ...ws,
                      title: updated.name,
                      description: updated.description,
                      slug: updated.slug,
                    }
                  : ws
              )
            );
            setEditingWorkspace(null);
            setIsModalOpen(false);
          } else {
            alert(resJson.message || 'Cập nhật workspace thất bại');
          }
        })
        .catch((err) => {
          alert(err.message || 'Đã xảy ra lỗi khi cập nhật workspace');
        });
    } else {
      // Create Workspace
      fetch(`${API_BASE_URL}/workspaces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.title,
          description: data.description || '',
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Không thể tạo workspace mới');
          return res.json();
        })
        .then((resJson) => {
          if (resJson && resJson.success && resJson.data) {
            const newWs = resJson.data;
            setWorkspaces((prev) => [
              ...prev,
              {
                id: newWs.id,
                title: newWs.name,
                description: newWs.description,
                slug: newWs.slug,
                accountsCount: 0,
              },
            ]);
            setIsModalOpen(false);
          } else {
            alert(resJson.message || 'Tạo workspace thất bại');
          }
        })
        .catch((err) => {
          alert(err.message || 'Đã xảy ra lỗi khi tạo workspace');
        });
    }
  };

  const handleSettingsClick = (workspace) => {
    console.log('Settings clicked for workspace:', workspace.title);
    setEditingWorkspace(workspace);
    setIsModalOpen(true);
  };

  const handleDeleteWorkspace = (workspaceId) => {
    const token = localStorage.getItem('marqops.authLab.accessToken');
    fetch(`${API_BASE_URL}/workspaces/${workspaceId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Không thể xóa workspace này');
        return res.json();
      })
      .then((resJson) => {
        if (resJson && resJson.success) {
          setWorkspaces((prev) => prev.filter((ws) => ws.id !== workspaceId));
          setEditingWorkspace(null);
          setIsModalOpen(false);
        } else {
          alert(resJson.message || 'Xóa workspace thất bại');
        }
      })
      .catch((err) => {
        alert(err.message || 'Đã xảy ra lỗi khi xóa workspace');
      });
  };

  const handleCardClick = (workspace) => {
    console.log('Workspace clicked:', workspace.title);
    alert(`Truy cập vào Workspace: ${workspace.title}`);
  };

  return (
    <div className="dashboard-container">
      {/* Dashboard Inner Body */}
      <main className="dashboard-main-content">
        <div className="dashboard-inner-container">
          {/* Greeting Header */}
          <div className="greeting-section">
            <h1 className="greeting-title">Xin chào {user?.fullName || 'User'} !</h1>
          </div>

          {/* Section 1: My Workspaces */}
          <section className="workspace-section-container">
            <div className="section-header">
              <div className="section-title-wrapper">
                <div className="icon-badge purple-badge">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 21h18M3 10h18M5 10V21M19 21V10M9 21V14h6v7M4 10l8-7 8 7" />
                  </svg>
                </div>
                <h2 className="section-title-text">Workspace của tôi</h2>
                <span className="tooltip-icon" title="Các workspace do bạn sở hữu">
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
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
                  </svg>
                </span>
              </div>
              <div className="section-meta-info">
                <span className="owner-role-badge">Vai trò: Owner</span>
                <span className="tier-label">Business Tier</span>
                <button
                  type="button"
                  className="icon-btn section-settings-btn"
                  onClick={() => alert('Cài đặt tài khoản/tổ chức')}
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
              </div>
            </div>

            {/* Grid of Workspaces */}
            <div className="workspaces-grid">
              {/* Creator Card */}
              <WorkspaceCard isCreator={true} onCardClick={handleCreateWorkspace} />

              {loading ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    gridColumn: 'span 3',
                    color: '#64748b',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Đang tải danh sách Workspace...
                </div>
              ) : (
                workspaces.map((ws) => (
                  <WorkspaceCard
                    key={ws.id}
                    title={ws.title}
                    accountsCount={ws.accountsCount}
                    onEditClick={() => handleSettingsClick(ws)}
                    onDeleteClick={() => handleDeleteWorkspace(ws.id)}
                    onCardClick={() => handleCardClick(ws)}
                  />
                ))
              )}
            </div>
          </section>

          {/* Section 2: Shared Workspaces */}
          <section className="shared-section-container">
            <div className="section-header center-header">
              <div className="section-title-wrapper justify-center">
                <h2 className="section-title-text shared-title-text">Workspace được chia sẻ</h2>
                <span
                  className="tooltip-icon"
                  title="Các workspace được chia sẻ quyền quản trị/thành viên với bạn"
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
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Flex / Grid of Shared Workspaces */}
            <div className="shared-workspaces-flex">
              {sharedWorkspaces.map((ws) => (
                <SharedWorkspaceCard
                  key={ws.id}
                  role={ws.role}
                  title={ws.title}
                  campaigns={ws.campaigns}
                  onSettingsClick={() => handleSettingsClick(ws)}
                  onCardClick={() => handleCardClick(ws)}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => {
          setEditingWorkspace(null);
          setIsModalOpen(false);
        }}
        onSubmit={handleModalSubmit}
        workspaceData={editingWorkspace}
        onDelete={handleDeleteWorkspace}
      />
    </div>
  );
}

export default DashboardPage;
