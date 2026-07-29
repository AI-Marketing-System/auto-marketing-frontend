import React, { useState, useEffect } from 'react';

export default function UserFormModal({
  isOpen,
  mode = 'create', // 'create' | 'edit'
  user = null,
  onClose,
  onSubmit,
  isSaving = false,
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [isAdminRole, setIsAdminRole] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (user && mode === 'edit') {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPassword('');
      setAvatarUrl(user.avatarUrl || '');
      setStatus(user.status || 'ACTIVE');
      const rolesArray = user.roles ? Array.from(user.roles) : [];
      setIsAdminRole(rolesArray.some((r) => String(r).includes('ADMIN')));
    } else {
      setFullName('');
      setEmail('');
      setPassword('');
      setAvatarUrl('');
      setStatus('ACTIVE');
      setIsAdminRole(false);
    }
    setFormError('');
  }, [user, mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFormError('Họ và tên không được để trống.');
      return;
    }

    if (mode === 'create') {
      if (!email.trim()) {
        setFormError('Email không được để trống.');
        return;
      }
      if (!password || password.length < 6) {
        setFormError('Mật khẩu tối thiểu 6 ký tự.');
        return;
      }
    }

    const roles = ['ROLE_USER'];
    if (isAdminRole) {
      roles.push('ROLE_ADMIN');
    }

    const payload = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      avatarUrl: avatarUrl.trim() || null,
      status,
      roles,
    };

    if (mode === 'create') {
      payload.password = password;
    }

    onSubmit(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === 'create' ? 'Tạo người dùng mới' : 'Chỉnh sửa người dùng'}</h2>
          <button type="button" className="btn-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {formError && (
              <div className="user-alert user-alert--error" style={{ marginBottom: 0 }}>
                <span>{formError}</span>
              </div>
            )}

            <div className="form-group">
              <label>Họ và tên *</label>
              <input
                type="text"
                placeholder="Nhập họ và tên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={mode === 'edit'}
                required
              />
            </div>

            {mode === 'create' && (
              <div className="form-group">
                <label>Mật khẩu *</label>
                <input
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>URL Ảnh đại diện</label>
              <input
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Trạng thái tài khoản</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="ACTIVE">ACTIVE (Hoạt động)</option>
                <option value="LOCKED">LOCKED (Bị khóa)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Phân quyền (Roles)</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked disabled readOnly />
                  <span>ROLE_USER (Mặc định)</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isAdminRole}
                    onChange={(e) => setIsAdminRole(e.target.checked)}
                  />
                  <span>ROLE_ADMIN</span>
                </label>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSaving}>
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? 'Đang lưu...' : mode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
