import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usersApi } from '../api/usersApi';
import UserStats from '../components/UserStats';
import UserTable from '../components/UserTable';
import UserFormModal from '../components/UserFormModal';
import '../styles/UserManagement.css';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = useCallback(async (page = 0, searchKeyword = keyword, status = statusFilter) => {
    setLoading(true);
    try {
      const res = await usersApi.getUsers({
        keyword: searchKeyword,
        status,
        page,
        size: pageInfo.size,
      });

      if (res && res.data) {
        const pageData = res.data;
        setUsers(pageData.content || []);
        setPageInfo({
          page: pageData.number || 0,
          size: pageData.size || 10,
          totalPages: pageData.totalPages || 0,
          totalElements: pageData.totalElements || 0,
        });
      }
    } catch (err) {
      showAlert('error', err.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [keyword, statusFilter, pageInfo.size]);

  useEffect(() => {
    fetchUsers(0);
  }, [fetchUsers]);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const active = users.filter((u) => u.status === 'ACTIVE').length;
    const locked = users.filter((u) => u.status === 'LOCKED').length;
    const admins = users.filter((u) => {
      const roles = u.roles ? Array.from(u.roles) : [];
      return roles.some((r) => String(r).includes('ADMIN'));
    }).length;

    return {
      total: pageInfo.totalElements,
      active,
      locked,
      admins,
    };
  }, [users, pageInfo.totalElements]);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setModalMode('edit');
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    setSaving(true);
    try {
      if (modalMode === 'create') {
        await usersApi.createUser(payload);
        showAlert('success', 'Tạo người dùng mới thành công!');
      } else {
        await usersApi.updateUser(editingUser.id, payload);
        showAlert('success', 'Cập nhật người dùng thành công!');
      }
      setIsModalOpen(false);
      fetchUsers(pageInfo.page);
    } catch (err) {
      showAlert('error', err.message || 'Có lỗi xảy ra khi lưu thông tin người dùng');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
    const actionText = newStatus === 'LOCKED' ? 'khóa' : 'kích hoạt';

    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản "${user.fullName}"?`)) {
      return;
    }

    try {
      await usersApi.updateUserStatus(user.id, newStatus);
      showAlert('success', `Đã ${actionText} tài khoản thành công!`);
      fetchUsers(pageInfo.page);
    } catch (err) {
      showAlert('error', err.message || `Lỗi khi ${actionText} tài khoản`);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Bạn có chắc chắn muốn XÓA tài khoản "${user.fullName}" (${user.email})?`)) {
      return;
    }

    try {
      await usersApi.deleteUser(user.id);
      showAlert('success', 'Xóa tài khoản thành công!');
      fetchUsers(pageInfo.page);
    } catch (err) {
      showAlert('error', err.message || 'Lỗi khi xóa tài khoản');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(0, keyword, statusFilter);
  };

  return (
    <div className="user-mgmt-container">
      {/* Header */}
      <div className="user-mgmt-header">
        <div className="user-mgmt-header__title">
          <h1>Quản lý Người dùng</h1>
          <p>Quản lý danh sách tài khoản, phân quyền và trạng thái trong hệ thống</p>
        </div>
        <div className="user-mgmt-header__actions">
          <button type="button" className="btn-secondary" onClick={() => fetchUsers(pageInfo.page)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
            </svg>
            Làm mới
          </button>
          <button type="button" className="btn-primary" onClick={handleOpenCreateModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Tạo người dùng
          </button>
        </div>
      </div>

      {/* Notification Toast Alert */}
      {alert && (
        <div className={`user-alert user-alert--${alert.type}`}>
          <span>{alert.message}</span>
          <button type="button" className="btn-close" onClick={() => setAlert(null)}>
            &times;
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <UserStats
        total={stats.total}
        active={stats.active}
        locked={stats.locked}
        admins={stats.admins}
      />

      {/* Toolbar Filters */}
      <div className="user-toolbar">
        <form className="user-toolbar__left" onSubmit={handleSearchSubmit}>
          <div className="user-search-input">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <select
            className="user-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              fetchUsers(0, keyword, e.target.value);
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="ACTIVE">Chỉ ACTIVE</option>
            <option value="LOCKED">Chỉ LOCKED</option>
          </select>
        </form>
      </div>

      {/* User Table */}
      <UserTable
        users={users}
        loading={loading}
        onEditUser={handleOpenEditModal}
        onToggleStatus={handleToggleStatus}
        onDeleteUser={handleDeleteUser}
      />

      {/* Pagination */}
      {pageInfo.totalPages > 1 && (
        <div className="user-pagination">
          <div className="user-pagination__info">
            Trang {pageInfo.page + 1} / {pageInfo.totalPages} (Tổng số {pageInfo.totalElements} người dùng)
          </div>
          <div className="user-pagination__controls">
            <button
              type="button"
              className="btn-page"
              disabled={pageInfo.page === 0}
              onClick={() => fetchUsers(pageInfo.page - 1)}
            >
              Trang trước
            </button>
            {Array.from({ length: pageInfo.totalPages }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`btn-page ${i === pageInfo.page ? 'btn-page--active' : ''}`}
                onClick={() => fetchUsers(i)}
              >
                {i + 1}
              </button>
            ))}
            <button
              type="button"
              className="btn-page"
              disabled={pageInfo.page >= pageInfo.totalPages - 1}
              onClick={() => fetchUsers(pageInfo.page + 1)}
            >
              Trang sau
            </button>
          </div>
        </div>
      )}

      {/* User Create/Edit Form Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        user={editingUser}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        isSaving={saving}
      />
    </div>
  );
}
