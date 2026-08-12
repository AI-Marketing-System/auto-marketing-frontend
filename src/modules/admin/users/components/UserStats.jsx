import React from 'react';

export default function UserStats({ total = 0, active = 0, locked = 0, admins = 0 }) {
  return (
    <div className="user-stats-grid">
      <div className="user-stat-card">
        <div className="user-stat-card__icon user-stat-card__icon--blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div className="user-stat-card__content">
          <h3>{total}</h3>
          <p>Tổng số người dùng</p>
        </div>
      </div>

      <div className="user-stat-card">
        <div className="user-stat-card__icon user-stat-card__icon--green">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div className="user-stat-card__content">
          <h3>{active}</h3>
          <p>Đang hoạt động (ACTIVE)</p>
        </div>
      </div>

      <div className="user-stat-card">
        <div className="user-stat-card__icon user-stat-card__icon--amber">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <div className="user-stat-card__content">
          <h3>{locked}</h3>
          <p>Đã bị khóa (LOCKED)</p>
        </div>
      </div>

      <div className="user-stat-card">
        <div className="user-stat-card__icon user-stat-card__icon--purple">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
          </svg>
        </div>
        <div className="user-stat-card__content">
          <h3>{admins}</h3>
          <p>Quản trị viên (ADMIN)</p>
        </div>
      </div>
    </div>
  );
}
