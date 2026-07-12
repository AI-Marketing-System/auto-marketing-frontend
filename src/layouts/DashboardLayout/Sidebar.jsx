import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
  const [expandedWs, setExpandedWs] = useState({});
  const location = useLocation();

  useEffect(() => {
    if (variant === 'admin') return;
    let cancelled = false;
    workspaceApi
      .myWorkspaces(API_BASE_URL)
      .then((res) => {
        console.log('Workspaces API Response:', res);
        const wsList = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        if (!cancelled && wsList.length > 0) {
          setWorkspaces(wsList);

          // Optionally auto-expand the workspace if we are currently viewing it
          const wsIdMatch = location.pathname.match(/\/workspaces\/([^/]+)/);
          if (wsIdMatch && wsIdMatch[1]) {
            setExpandedWs((prev) => ({ ...prev, [wsIdMatch[1]]: true }));
          }
        } else if (!cancelled) {
          setWorkspaces([]);
          console.error('Workspaces list is empty or format unexpected:', res);
        }
      })
      .catch((err) => {
        console.error('Workspaces API Error:', err);
      });
    return () => {
      cancelled = true;
    };
  }, [variant, location.pathname]);

  const toggleWorkspace = (id, e) => {
    e.preventDefault();
    setExpandedWs((prev) => ({ ...prev, [id]: !prev[id] }));
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
              workspaces.map((ws) => (
                <div key={ws.id} className="sidebar__ws-item">
                  <div
                    className={`sidebar__ws-header ${location.pathname.includes(`/workspaces/${ws.id}`) ? 'sidebar__ws-header--active' : ''}`}
                  >
                    <NavLink
                      to={`/workspaces/${ws.id}/campaigns`}
                      className={({ isActive }) =>
                        `sidebar__ws-link${isActive ? ' sidebar__ws-link--active' : ''}`
                      }
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
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      </svg>
                      <span>{ws.name}</span>
                    </NavLink>
                  </div>
                </div>
              ))
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
