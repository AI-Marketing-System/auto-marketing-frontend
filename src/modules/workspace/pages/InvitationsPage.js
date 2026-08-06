import React, { useState, useEffect } from 'react';
import { workspaceApi } from '../api/workspaceApi';
import './InvitationsPage.css';

const InvitationsPage = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvitations();

    const handleInvitationsUpdated = () => {
      fetchInvitations();
    };

    window.addEventListener('invitations:updated', handleInvitationsUpdated);
    
    return () => {
      window.removeEventListener('invitations:updated', handleInvitationsUpdated);
    };
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await workspaceApi.getPendingInvitations();
      // ApiResponse format is { data: [...] }
      setInvitations(response.data || []);
      setError(null);
    } catch (err) {
      setError('Lỗi khi tải danh sách lời mời. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (workspaceId) => {
    try {
      await workspaceApi.acceptInvitation(workspaceId);
      // Remove the invitation from the list
      setInvitations((prev) => prev.filter((inv) => inv.workspaceId !== workspaceId));
    } catch (err) {
      alert(err.message || 'Lỗi khi chấp nhận lời mời');
    }
  };

  const handleDecline = async (workspaceId) => {
    try {
      await workspaceApi.declineInvitation(workspaceId);
      // Remove the invitation from the list
      setInvitations((prev) => prev.filter((inv) => inv.workspaceId !== workspaceId));
    } catch (err) {
      alert(err.message || 'Lỗi khi từ chối lời mời');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="invitations-container">
      <h1 className="invitations-title">Lời mời tham gia Workspace</h1>

      {error && (
        <div className="invitations-error">
          {error}
        </div>
      )}

      {invitations.length === 0 && !error ? (
        <div className="invitations-empty">
          <svg className="invitations-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
          </svg>
          <p className="invitations-empty-text">Bạn chưa có lời mời nào</p>
        </div>
      ) : (
        <div className="invitations-list">
          {invitations.map((inv) => (
            <div key={inv.workspaceId} className="invitation-card">
              <div className="invitation-info">
                <div className="invitation-avatar">
                  {inv.avatarUrl ? (
                    <img src={inv.avatarUrl} alt={inv.workspaceName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    inv.workspaceName ? inv.workspaceName.charAt(0).toUpperCase() : 'W'
                  )}
                </div>
                <div className="invitation-details">
                  <h3 className="invitation-ws-name">{inv.workspaceName}</h3>
                  <div className="invitation-meta">
                    <span className="invitation-role-badge">
                      Vai trò: {inv.role === 'OWNER' ? 'ADMIN' : inv.role}
                    </span>
                    <span>•</span>
                    <span>Đã mời vào: {new Date(inv.invitedAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>
              
              <div className="invitation-actions">
                <button onClick={() => handleDecline(inv.workspaceId)} className="btn-decline">
                  Từ chối
                </button>
                <button onClick={() => handleAccept(inv.workspaceId)} className="btn-accept">
                  Chấp nhận
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvitationsPage;
