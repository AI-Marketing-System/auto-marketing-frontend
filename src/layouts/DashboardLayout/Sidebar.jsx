import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { workspaceApi } from '../../modules/campaigns/api/campaignApi';
import { API_BASE_URL } from '../../config/env';
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
    to: '/admin/plans',
    label: 'Admin Plans',
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
];

export default function Sidebar({ variant = 'dashboard' }) {
  const items = variant === 'admin' ? ADMIN_ITEMS : DASHBOARD_ITEMS;
  const [workspaces, setWorkspaces] = useState([]);
  const [memberWorkspaces, setMemberWorkspaces] = useState([]);
  const expandedWsRef = useRef({});
  const location = useLocation();

  useEffect(() => {
    if (variant === 'admin') return;
    let cancelled = false;

    // Fetch owner workspaces
    workspaceApi
      .myWorkspaces(API_BASE_URL)
      .then((res) => {
        const wsList = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        if (!cancelled && wsList.length > 0) {
          setWorkspaces(wsList);

          // Optionally auto-expand the workspace if we are currently viewing it
          const wsIdMatch = location.pathname.match(/\/workspaces\/([^/]+)/);
          if (wsIdMatch && wsIdMatch[1]) {
            expandedWsRef.current = { ...expandedWsRef.current, [wsIdMatch[1]]: true };
          }
        } else if (!cancelled) {
          setWorkspaces([]);
        }
      })
      .catch((err) => {
        console.error('Workspaces API Error:', err);
      });

    // Fetch member workspaces
    workspaceApi
      .memberWorkspaces(API_BASE_URL)
      .then((res) => {
        const wsList = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        if (!cancelled) {
          setMemberWorkspaces(wsList);
        }
      })
      .catch((err) => {
        console.error('Member Workspaces API Error:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [variant, location.pathname]);

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
            {item.icon}
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
                {workspaces.map((ws) => (
                  <NavLink
                    key={ws.id}
                    to={`/workspaces/${ws.id}/campaigns`}
                    className={({ isActive }) => `sidebar__ws-card ${isActive || location.pathname.includes(`/workspaces/${ws.id}`) ? 'sidebar__ws-card--active' : ''}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="sidebar__ws-avatar">
                      <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M12 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
                      </svg>
                    </div>
                    <div className="sidebar__ws-info">
                      <div className="sidebar__ws-name">
                        {ws.name}
                      </div>
                      {ws.role === 'OWNER' && (
                        <div className="sidebar__ws-role">
                          Chủ sở hữu
                        </div>
                      )}
                    </div>
                  </NavLink>
                ))}
              </div>
            )}

            {memberWorkspaces.length > 0 && (
              <>
                <div className="sidebar__section-title" style={{ marginTop: '24px' }}>DỰ ÁN ĐƯỢC MỜI (MEMBER)</div>
                <div className="sidebar__ws-list">
                  {memberWorkspaces.map((ws) => (
                    <NavLink
                      key={ws.id}
                      to={`/workspaces/${ws.id}/campaigns`}
                      className={({ isActive }) => `sidebar__ws-card ${isActive || location.pathname.includes(`/workspaces/${ws.id}`) ? 'sidebar__ws-card--active' : ''}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div className="sidebar__ws-avatar" style={{ backgroundColor: 'transparent' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      </div>
                      <div className="sidebar__ws-info">
                        <div className="sidebar__ws-name">{ws.name}</div>
                        <div className="sidebar__ws-role" style={{ flexWrap: 'nowrap', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 1 }}>Bởi: {ws.ownerName || 'Unknown'}</span>
                          <span style={{ flexShrink: 0, fontSize: '10px' }}>•</span>
                          <span style={{ backgroundColor: ws.role === 'ADMIN' ? '#dbeafe' : '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', color: ws.role === 'ADMIN' ? '#1d4ed8' : '#475569', fontWeight: 600, flexShrink: 0 }}>
                            {ws.role === 'ADMIN' ? 'Admin' : 'Member'}
                          </span>
                        </div>
                      </div>
                    </NavLink>
                  ))}
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
    </aside>
  );
}
