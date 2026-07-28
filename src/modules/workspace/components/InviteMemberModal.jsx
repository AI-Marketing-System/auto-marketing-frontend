import React, { useState } from 'react';
import { requestJson } from '../../../services/Api';
import './InviteMemberModal.css';

export default function InviteMemberModal({ isOpen, onClose, workspaceId }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await requestJson(`/workspaces/${workspaceId}/members/invite`, {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), role })
      });
      
      if (response && response.success === false) {
        throw new Error(response.message || 'Không thể gửi lời mời');
      }
      
      setSuccess('Đã gửi lời mời thành công!');
      setTimeout(() => {
        onClose();
        setEmail('');
        setSuccess('');
      }, 1500);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invite-modal-backdrop" role="presentation">
      <div className="invite-modal" role="dialog" aria-modal="true">
        <div className="invite-modal-header">
          <h3 className="invite-modal-title">Mời thành viên</h3>
          <button className="invite-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="invite-modal-body">
          <p className="invite-modal-desc">
            Nhập địa chỉ email của người bạn muốn mời vào Workspace này.
          </p>
          
          <div className="invite-modal-input-group">
            <label htmlFor="invite-email">Địa chỉ Email</label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ví dụ: abc@gmail.com"
              disabled={loading}
              autoFocus
            />
          </div>
          
          <div className="invite-modal-input-group">
            <label htmlFor="invite-role">Vai trò</label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
            >
              <option value="MEMBER">Thành viên</option>
              <option value="OWNER">Admin</option>
            </select>
          </div>
          
          {error && <div className="invite-modal-error">{error}</div>}
          {success && <div className="invite-modal-success">{success}</div>}
          
          <div className="invite-modal-actions">
            <button type="button" className="invite-btn-cancel" onClick={onClose} disabled={loading}>
              Hủy
            </button>
            <button type="submit" className="invite-btn-submit" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi lời mời'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
