import React from 'react';

/**
 * Thanh trên cùng của trang Schedule:
 * - Workspace selector + member avatars (bên trái)
 * - Nút Quản lý, Viết bài mới, Công cụ (bên phải)
 *
 * @param {{
 *   workspaceName: string,
 *   onNewPost: () => void,
 *   onPublish: () => void,
 * }} props
 */
export default function ScheduleTopBar({ workspaceName = 'Client - Coffee House Brand', onNewPost, onPublish }) {
  return (
    <div className="sc-topbar">
      {/* ── Bên trái ── */}
      <div className="sc-topbar__left">
        <div className="sc-workspace-selector">
          <span className="sc-workspace-selector__icon">☕</span>
          <span className="sc-workspace-selector__name">{workspaceName}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        <div className="sc-member-avatars">
          <div className="sc-avatar sc-avatar--1">NK</div>
          <div className="sc-avatar sc-avatar--2">TQ</div>
          <button className="sc-avatar sc-avatar--add" title="Thêm thành viên">+</button>
        </div>
      </div>

      {/* ── Bên phải ── */}
      <div className="sc-topbar__actions">
        {/* Nút Quản lý */}
        <div className="sc-manage-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
          Quản lý
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {/* Nút Viết bài mới */}
        <button className="sc-btn sc-btn--new" onClick={onNewPost} id="btn-new-post">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Viết bài mới
        </button>

        {/* Nút Công cụ */}
        <button className="sc-btn sc-btn--publish" onClick={onPublish} id="btn-publish-tool">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="22 2 11 13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          Công cụ
        </button>
      </div>
    </div>
  );
}
