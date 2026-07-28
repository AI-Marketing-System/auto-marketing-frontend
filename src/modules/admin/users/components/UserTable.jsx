import React from 'react';

export default function UserTable({
  users = [],
  loading = false,
  onEditUser,
  onToggleStatus,
  onDeleteUser,
}) {
  if (loading) {
    return (
      <div className="user-table-card">
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          Đang tải danh sách người dùng...
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="user-table-card">
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          Không tìm thấy người dùng nào.
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="user-table-card">
      <table className="user-table">
        <thead>
          <tr>
            <th>Người dùng</th>
            <th>Trạng thái</th>
            <th>Vai trò</th>
            <th>Ngày tạo</th>
            <th style={{ textAlign: 'right' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isLocked = user.status === 'LOCKED';
            const rolesList = user.roles ? Array.from(user.roles) : [];

            return (
              <tr key={user.id}>
                <td>
                  <div className="user-profile-cell">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className="user-avatar"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className="user-avatar"
                      style={{ display: user.avatarUrl ? 'none' : 'flex' }}
                    >
                      {getInitials(user.fullName)}
                    </div>
                    <div className="user-profile-info">
                      <span className="user-name">{user.fullName}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className={`badge-status ${
                      isLocked ? 'badge-status--locked' : 'badge-status--active'
                    }`}
                  >
                    <span className="badge-status__dot"></span>
                    {isLocked ? 'LOCKED' : 'ACTIVE'}
                  </span>
                </td>
                <td>
                  {rolesList.length === 0 ? (
                    <span className="badge-role badge-role--user">ROLE_USER</span>
                  ) : (
                    rolesList.map((role) => {
                      const roleName = typeof role === 'string' ? role : role.name;
                      const isAdmin = roleName.includes('ADMIN');
                      return (
                        <span
                          key={roleName}
                          className={`badge-role ${
                            isAdmin ? 'badge-role--admin' : 'badge-role--user'
                          }`}
                        >
                          {roleName}
                        </span>
                      );
                    })
                  )}
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td style={{ textAlign: 'right' }}>
                  <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                    {/* Toggle Status (Lock/Unlock) */}
                    <button
                      type="button"
                      className="btn-icon btn-icon--toggle-lock"
                      title={isLocked ? 'Kích hoạt tài khoản' : 'Khóa tài khoản'}
                      onClick={() => onToggleStatus(user)}
                    >
                      {isLocked ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      )}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      className="btn-icon"
                      title="Sửa thông tin"
                      onClick={() => onEditUser(user)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      className="btn-icon btn-icon--danger"
                      title="Xóa người dùng"
                      onClick={() => onDeleteUser(user)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
