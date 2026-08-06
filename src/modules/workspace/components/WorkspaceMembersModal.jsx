import React, { useState, useEffect } from 'react';
import './WorkspaceMembersModal.css';
import { workspaceApi } from '../api/workspaceApi';
import InviteMemberModal from './InviteMemberModal';

// Hàm lấy chữ cái đầu
const getInitials = (name) => {
  if (!name) return 'U';
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

const adjustColor = (colorCode) => {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#6366f1', '#f43f5e'];
  let hash = 0;
  for (let i = 0; i < colorCode.length; i++) hash = colorCode.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const WorkspaceMembersModal = ({ isOpen, onClose, workspaceId, workspaceName, currentUserRole, currentUserId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // id of user being processed
  const [confirmConfig, setConfirmConfig] = useState(null);

  useEffect(() => {
    if (isOpen && workspaceId) {
      fetchMembers();
    }
  }, [isOpen, workspaceId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await workspaceApi.getWorkspaceMembers(workspaceId);
      setMembers(res.data || []);
    } catch (err) {
      console.error(err);
      alert('Lỗi tải danh sách thành viên');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = (userId, memberName) => {
    setConfirmConfig({
      title: 'Xóa thành viên',
      message: `Bạn có chắc chắn muốn xóa ${memberName} khỏi workspace này?`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmConfig(null);
        try {
          setActionLoading(userId);
          await workspaceApi.removeMember(workspaceId, userId);
          setMembers(members.filter(m => m.userId !== userId));
        } catch (err) {
          alert(err.message || 'Lỗi khi xóa thành viên');
        } finally {
          setActionLoading(null);
        }
      },
      onCancel: () => setConfirmConfig(null)
    });
  };

  const handleChangeRole = (userId, newRole) => {
    const displayRole = newRole === 'OWNER' ? 'Admin' : newRole;
    setConfirmConfig({
      title: 'Thay đổi quyền',
      message: `Bạn có chắc chắn muốn đổi quyền người này thành ${displayRole}?`,
      type: 'warning',
      onConfirm: async () => {
        setConfirmConfig(null);
        try {
          setActionLoading(userId);
          await workspaceApi.updateMemberRole(workspaceId, userId, newRole);
          setMembers(members.map(m => m.userId === userId ? { ...m, role: newRole } : m));
        } catch (err) {
          alert(err.message || 'Lỗi khi cập nhật quyền');
        } finally {
          setActionLoading(null);
        }
      },
      onCancel: () => setConfirmConfig(null)
    });
  };

  if (!isOpen) return null;

  // Lọc
  const filteredMembers = members.filter(m => {
    const matchSearch = (m.fullName || '').toLowerCase().includes(search.toLowerCase()) || 
                        (m.email || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'ALL' || m.role === filterRole;
    return matchSearch && matchRole;
  });

  const canManage = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

  return (
    <>
      <div className="wm-modal-overlay" onClick={onClose}>
        <div className="wm-modal-content" onClick={e => e.stopPropagation()}>
          <div className="wm-modal-header">
            <div className="wm-header-title">
              <h2>Thành viên Workspace</h2>
              <p>{workspaceName || 'Danh sách thành viên'}</p>
            </div>
            <button className="wm-btn-close" onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div className="wm-toolbar">
            <div className="wm-search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" placeholder="Tìm theo tên hoặc email..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="wm-filter-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              <option value="ALL">Tất cả vai trò</option>
              <option value="OWNER">Admin</option>
              <option value="MEMBER">Member</option>
            </select>
            {canManage && (
              <button className="wm-btn-primary" onClick={() => setIsInviteModalOpen(true)}>
                + Mời thành viên
              </button>
            )}
          </div>

          <div className="wm-table-container">
            {loading ? (
              <div className="wm-loading">Đang tải...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="wm-empty">Không tìm thấy thành viên nào.</div>
            ) : (
              <table className="wm-table">
                <thead>
                  <tr>
                    <th>Thông tin</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Ngày tham gia</th>
                    {canManage && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(member => (
                    <tr key={member.userId}>
                      <td>
                        <div className="wm-user-info">
                          <div className="wm-avatar" style={{ backgroundColor: adjustColor(member.email || String(member.userId)) }}>
                            {getInitials(member.fullName || member.email)}
                          </div>
                          <div className="wm-user-details">
                            <span className="wm-user-name">{member.fullName || 'Người dùng mới'} {member.userId === currentUserId && '(Bạn)'}</span>
                            <span className="wm-user-email">{member.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        {canManage && member.userId !== currentUserId ? (
                          <select 
                            className={`wm-role-select wm-role-${member.role.toLowerCase()}`}
                            value={member.role}
                            onChange={(e) => handleChangeRole(member.userId, e.target.value)}
                            disabled={actionLoading === member.userId}
                          >
                            <option value="OWNER">Admin</option>
                            <option value="MEMBER">Member</option>
                          </select>
                        ) : (
                          <span className={`wm-badge wm-role-${member.role.toLowerCase()}`}>
                            {member.role === 'OWNER' ? 'Admin' : member.role}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`wm-badge wm-status-${member.status.toLowerCase()}`}>
                          {member.status === 'ACCEPTED' ? 'Đã tham gia' : member.status === 'PENDING' ? 'Đang chờ' : 'Từ chối'}
                        </span>
                      </td>
                      <td className="wm-text-muted">
                        {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('vi-VN') : '-'}
                      </td>
                      {canManage && (
                        <td className="wm-actions">
                          {member.role !== 'OWNER' && member.userId !== currentUserId && (
                            <button 
                              className="wm-btn-remove" 
                              onClick={() => handleRemoveMember(member.userId, member.fullName || member.email)}
                              disabled={actionLoading === member.userId}
                              title="Xóa khỏi Workspace"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {isInviteModalOpen && (
        <InviteMemberModal 
          isOpen={isInviteModalOpen}
          onClose={() => {
            setIsInviteModalOpen(false);
            fetchMembers(); // reload after invite
          }}
          workspaceId={workspaceId}
        />
      )}

      {confirmConfig && (
        <div className="wm-confirm-overlay">
          <div className="wm-confirm-modal">
            <div className={`wm-confirm-icon ${confirmConfig.type}`}>
              {confirmConfig.type === 'danger' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              )}
            </div>
            <div className="wm-confirm-content">
              <h3>{confirmConfig.title}</h3>
              <p>{confirmConfig.message}</p>
            </div>
            <div className="wm-confirm-actions">
              <button className="wm-btn-cancel" onClick={confirmConfig.onCancel}>Hủy</button>
              <button className={`wm-btn-confirm ${confirmConfig.type}`} onClick={confirmConfig.onConfirm}>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkspaceMembersModal;
