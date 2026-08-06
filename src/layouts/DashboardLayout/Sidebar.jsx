import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { workspaceApi } from '../../modules/campaigns/api/campaignApi';
import { requestJson } from '../../services/Api';
import { API_BASE_URL } from '../../config/env';
import { useAuth } from '../../context/AuthContext';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import './DashboardLayout.css';

const DASHBOARD_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
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
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    to: '/social-accounts',
    label: 'Social Accounts',
    icon: (
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
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    to: '/analytics',
    label: 'Phân tích',
    icon: (
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
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    to: '/invitations',
    label: 'Lời mời',
    icon: (
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
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
];

const ADMIN_ITEMS = [
  {
    to: '/admin/dashboard',
    label: 'Tổng quan',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    to: '/admin/plans',
    label: 'Gói dịch vụ',
    icon: (
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
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    to: '/admin/users',
    label: 'Quản lý User',
    icon: (
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
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    to: '/admin/transactions',
    label: 'Giao dịch',
    icon: (
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
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
];

export default function Sidebar({ variant = 'dashboard' }) {
  const items = variant === 'admin' ? ADMIN_ITEMS : DASHBOARD_ITEMS;
  const [workspaces, setWorkspaces] = useState([]);
  const [memberWorkspaces, setMemberWorkspaces] = useState([]);
  const [pendingInvitationsCount, setPendingInvitationsCount] = useState(0);
  const [roleUpdatedToast, setRoleUpdatedToast] = useState(false);
  const [memberRemovedToast, setMemberRemovedToast] = useState(false);

  const fetchAllWorkspaces = useCallback(() => {
    if (variant === 'admin') return;
    workspaceApi
      .myWorkspaces(API_BASE_URL)
      .then((res) => {
        const wsList = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        if (wsList.length > 0) {
          setWorkspaces(wsList);
        } else {
          setWorkspaces([]);
        }
      })
      .catch((err) => console.error('Workspaces API Error:', err));

    workspaceApi
      .memberWorkspaces(API_BASE_URL)
      .then((res) => {
        const wsList = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setMemberWorkspaces(wsList);
      })
      .catch((err) => console.error('Member Workspaces API Error:', err));
  }, [variant]);
  const expandedWsRef = useRef({});
  const location = useLocation();
  const { user } = useAuth();

  /**
   * Id workspace đang mở, lấy bằng cách tách ĐÚNG một segment của URL.
   *
   * KHÔNG dùng `pathname.includes('/workspaces/' + ws.id)`: đó là so khớp chuỗi con, nên khi đang ở
   * /workspaces/10/campaigns thì workspace id 1 cũng khớp (vì "/workspaces/10..." có chứa
   * "/workspaces/1"). Hậu quả là hai card cùng sáng và hiện hai link "AI Planner".
   */
  const activeWorkspaceId = location.pathname.match(/\/workspaces\/([^/]+)/)?.[1] ?? null;
  const isActiveWorkspace = (ws) => activeWorkspaceId === String(ws.id);

  useEffect(() => {
    let cancelled = false;
    fetchAllWorkspaces();

    const handleRoleUpdated = () => {
      fetchAllWorkspaces();
      setRoleUpdatedToast(true);
      setTimeout(() => setRoleUpdatedToast(false), 5000);
    };

    const handleMemberRemoved = () => {
      fetchAllWorkspaces();
      setMemberRemovedToast(true);
      setTimeout(() => setMemberRemovedToast(false), 5000);
      
      // If the user is currently in a workspace, they might have been removed from it.
      // A more robust check would verify if activeWorkspaceId is still in the fetched workspaces list,
      // but reloading the workspace list will at least update the sidebar.
    };

    window.addEventListener('workspace:role_updated', handleRoleUpdated);
    window.addEventListener('workspace:member_removed', handleMemberRemoved);

    const fetchInvitationsCount = () => {
      requestJson('/workspaces/invitations', {}, API_BASE_URL)
        .then((res) => {
          if (!cancelled && res && res.data) {
            setPendingInvitationsCount(res.data.length);
          }
        })
        .catch((err) => {
          console.error('Invitations API Error:', err);
        });
    };
    
    fetchInvitationsCount();
    
    let stompClient = null;
    if (user?.id) {
      const rootUrl = API_BASE_URL.replace('/api/v1', '');
      const socket = new SockJS(`${rootUrl}/ws-marketing`);
      stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        debug: (str) => {
          console.log('[STOMP DEBUG]:', str);
        },
        onConnect: () => {
          console.log('[STOMP] Connected to WebSocket');
          stompClient.subscribe(`/topic/user/${user.id}/invitations`, (message) => {
            console.log('[STOMP] Received message:', message.body);
            if (message.body && message.body.includes('NEW_INVITATION')) {
              setTimeout(() => {
                fetchInvitationsCount();
                window.dispatchEvent(new CustomEvent('invitations:updated'));
              }, 1000); // 1s delay to allow backend transaction to commit
            } else if (message.body && message.body.includes('ROLE_UPDATED')) {
              window.dispatchEvent(new CustomEvent('workspace:role_updated'));
            } else if (message.body && message.body.includes('MEMBER_REMOVED')) {
              window.dispatchEvent(new CustomEvent('workspace:member_removed'));
            }
          });
        },
        onStompError: (frame) => {
          console.error('[STOMP] Broker reported error: ' + frame.headers['message']);
          console.error('[STOMP] Additional details: ' + frame.body);
        },
        onWebSocketError: (event) => {
          console.error('[STOMP] WebSocket error:', event);
        }

      });
      stompClient.activate();
    }


    return () => {
      cancelled = true;
      if (stompClient) {
        stompClient.deactivate();
      }
      window.removeEventListener('workspace:role_updated', handleRoleUpdated);
      window.removeEventListener('workspace:member_removed', handleMemberRemoved);
    };
  }, [variant, location.pathname, user?.id]);

  const renderWorkspaceCard = (ws) => (
    <NavLink
      key={ws.id}
      to={`/workspaces/${ws.id}/campaigns`}
      className={({ isActive }) =>
        `sidebar__ws-card ${isActive || isActiveWorkspace(ws) ? 'sidebar__ws-card--active' : ''}`
      }
      style={{ textDecoration: 'none' }}
    >
      {ws.avatarUrl ? (
        <div className="sidebar__ws-avatar" style={{ padding: 0 }}>
          <img src={ws.avatarUrl} alt={ws.name} style={{ width: '100%', height: '100%', borderRadius: '4px', objectFit: 'cover' }} />
        </div>
      ) : (
        <div className="sidebar__ws-avatar">
          <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="4" />
            <path d="M12 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
          </svg>
        </div>
      )}
      <div className="sidebar__ws-info">
        <div className="sidebar__ws-name">{ws.name}</div>
        {ws.role === 'OWNER' && <div className="sidebar__ws-role">Chủ sở hữu</div>}
      </div>
    </NavLink>
  );

  const renderMemberWorkspaceCard = (ws) => (
    <NavLink
      key={ws.id}
      to={`/workspaces/${ws.id}/campaigns`}
      className={({ isActive }) =>
        `sidebar__ws-card ${isActive || isActiveWorkspace(ws) ? 'sidebar__ws-card--active' : ''}`
      }
      style={{ textDecoration: 'none' }}
    >
      {ws.avatarUrl ? (
        <div className="sidebar__ws-avatar" style={{ padding: 0 }}>
          <img src={ws.avatarUrl} alt={ws.name} style={{ width: '100%', height: '100%', borderRadius: '4px', objectFit: 'cover' }} />
        </div>
      ) : (
        <div className="sidebar__ws-avatar" style={{ backgroundColor: 'transparent' }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#64748b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
      )}
      <div className="sidebar__ws-info">
        <div className="sidebar__ws-name">{ws.name}</div>
        <div
          className="sidebar__ws-role"
          style={{
            flexWrap: 'nowrap',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 1 }}>
            Bởi: {ws.ownerName || 'Unknown'}
          </span>
          <span style={{ flexShrink: 0, fontSize: '10px' }}>•</span>
          <span
            style={{
              backgroundColor: ws.role === 'OWNER' ? '#dbeafe' : '#e2e8f0',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10.5px',
              color: ws.role === 'OWNER' ? '#1d4ed8' : '#475569',
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {ws.role === 'OWNER' ? 'Admin' : 'Thành viên'}
          </span>
        </div>
      </div>
    </NavLink>
  );

  const renderPlannerSublink = (ws) => {
    // Chỉ hiện cho workspace ĐANG mở, và chỉ với workspace mình sở hữu: AI Planner ở backend dùng
    // WorkspaceAccessGuard vốn chỉ cho phép chủ workspace, nên hiện link ở mục "được mời" sẽ dẫn
    // thẳng tới lỗi 403.
    if (!isActiveWorkspace(ws)) return null;
    return (
      <NavLink
        key={`planner-${ws.id}`}
        to={`/workspaces/${ws.id}/planner/stage`}
        className={({ isActive }) =>
          `sidebar__ws-sublink${isActive ? ' sidebar__ws-sublink--active' : ''}`
        }
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
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <span>AI Planner</span>
      </NavLink>
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo">MarqOps</span>
      </div>

      <nav className="sidebar__nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
          >
            <div style={{ position: 'relative', display: 'flex' }}>
              {item.icon}
              {item.label === 'Lời mời' && pendingInvitationsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  display: 'inline-block'
                }} />
              )}
            </div>
            <span>{item.label}</span>
          </NavLink>
        ))}

        {variant !== 'admin' && (
          <div className="sidebar__section">
            <div className="sidebar__section-title">WORKSPACES CỦA TÔI</div>

            {workspaces.length === 0 ? (
              <div style={{ padding: '8px 12px', fontSize: '13px', color: '#94a3b8' }}>
                Không có dữ liệu...
              </div>
            ) : (
              <div className="sidebar__ws-list">
                {/* Card và link con của cùng một workspace phải nằm chung một khối. Trước đây dùng
                    hai .map() tách rời nên toàn bộ card render trước rồi mới tới toàn bộ link con,
                    khiến "AI Planner" luôn rơi xuống đáy danh sách thay vì nằm dưới workspace. */}
                {workspaces.map((ws) => (
                  <div key={ws.id} className="sidebar__ws-item">
                    {renderWorkspaceCard(ws)}
                    {renderPlannerSublink(ws)}
                  </div>
                ))}
              </div>
            )}

            {memberWorkspaces.length > 0 && (
              <>
                <div className="sidebar__section-title" style={{ marginTop: '24px' }}>
                  DỰ ÁN ĐƯỢC MỜI (MEMBER)
                </div>
                <div className="sidebar__ws-list">
                  {memberWorkspaces.map(renderMemberWorkspaceCard)}
                </div>
              </>
            )}
          </div>
        )}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__help">
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
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
          </svg>
          <span>Trợ giúp</span>
        </div>
      </div>
      {/* Non-intrusive Toast Notification for Role Update */}
      {roleUpdatedToast && (
        <div className="role-updated-toast">
          <div className="role-toast-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <div className="role-toast-content">
            <strong>Cập nhật quyền hạn</strong>
            <p>Vai trò của bạn trong một workspace vừa thay đổi.</p>
          </div>
          <button className="role-toast-close" onClick={() => setRoleUpdatedToast(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      )}
      {memberRemovedToast && (
        <div className="role-updated-toast">
          <div className="role-toast-icon" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
          </div>
          <div className="role-toast-content">
            <strong>Đã rời Workspace</strong>
            <p>Bạn vừa bị xóa khỏi một workspace.</p>
          </div>
          <button className="role-toast-close" onClick={() => setMemberRemovedToast(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      )}
    </aside>
  );
}
