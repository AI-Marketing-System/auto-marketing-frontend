import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/dashboardApi';
import '../styles/AdminDashboard.css';

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatCurrency(amount) {
  if (amount == null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await dashboardApi.getDashboard();
      if (res?.data) {
        setData(res.data);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="admin-dash">
        <div className="admin-dash__loading">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
          <span>Đang tải dữ liệu tổng quan hệ thống...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dash">
        <div className="admin-dash__error">
          <p style={{ fontWeight: 700, marginBottom: 8 }}>Lỗi tải Dashboard</p>
          <p>{error}</p>
          <button type="button" className="btn-secondary" style={{ margin: '12px auto 0' }} onClick={fetchDashboard}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dash">
      {/* Header */}
      <div className="admin-dash__header">
        <div className="admin-dash__header-title">
          <h1>Tổng quan Hệ thống</h1>
          <p>
            Dữ liệu thời gian thực về người dùng, giao dịch và doanh thu
            {lastRefreshed && ` • Cập nhật lúc ${lastRefreshed.toLocaleTimeString('vi-VN')}`}
          </p>
        </div>
        <button type="button" className="btn-secondary" onClick={fetchDashboard}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          Làm mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="admin-dash__kpi-grid">
        {/* Total Users */}
        <div className="kpi-card">
          <div className="kpi-card__top">
            <div>
              <div className="kpi-card__label">Tổng người dùng</div>
              <div className="kpi-card__value">{data?.totalUsers ?? 0}</div>
            </div>
            <div className="kpi-card__icon kpi-icon--blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div className="kpi-card__sub">
            <span className="kpi-sub-item"><span className="kpi-sub-dot" style={{ background: '#22c55e' }} />{data?.activeUsers ?? 0} Active</span>
            <span className="kpi-sub-item"><span className="kpi-sub-dot" style={{ background: '#ef4444' }} />{data?.lockedUsers ?? 0} Locked</span>
          </div>
        </div>

        {/* Revenue */}
        <div className="kpi-card">
          <div className="kpi-card__top">
            <div>
              <div className="kpi-card__label">Tổng doanh thu</div>
              <div className="kpi-card__value" style={{ fontSize: 22 }}>{formatCurrency(data?.totalRevenue)}</div>
            </div>
            <div className="kpi-card__icon kpi-icon--green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <div className="kpi-card__sub">
            <span className="kpi-sub-item"><span className="kpi-sub-dot" style={{ background: '#16a34a' }} />{data?.paidTransactions ?? 0} giao dịch PAID</span>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="kpi-card">
          <div className="kpi-card__top">
            <div>
              <div className="kpi-card__label">Tổng giao dịch</div>
              <div className="kpi-card__value">{data?.totalTransactions ?? 0}</div>
            </div>
            <div className="kpi-card__icon kpi-icon--violet">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
          </div>
          <div className="kpi-card__sub">
            <span className="kpi-sub-item"><span className="kpi-sub-dot" style={{ background: '#f59e0b' }} />{data?.pendingTransactions ?? 0} Pending</span>
            <span className="kpi-sub-item"><span className="kpi-sub-dot" style={{ background: '#ef4444' }} />{data?.failedTransactions ?? 0} Failed</span>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="kpi-card">
          <div className="kpi-card__top">
            <div>
              <div className="kpi-card__label">Subscription đang hoạt động</div>
              <div className="kpi-card__value">{data?.activeSubscriptions ?? 0}</div>
            </div>
            <div className="kpi-card__icon kpi-icon--teal">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
          </div>
          <div className="kpi-card__sub">
            <span className="kpi-sub-item" style={{ color: '#0d9488' }}>Đang còn hiệu lực</span>
          </div>
        </div>
      </div>

      {/* Widgets */}
      <div className="admin-dash__widgets">
        {/* Recent Users */}
        <div className="widget-card">
          <div className="widget-card__header">
            <h2>👤 Người dùng mới nhất</h2>
            <Link to="/admin/users">Xem tất cả →</Link>
          </div>
          {(!data?.recentUsers || data.recentUsers.length === 0) ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>Không có dữ liệu</div>
          ) : (
            <ul className="widget-user-list">
              {data.recentUsers.map((user) => (
                <li key={user.id} className="widget-user-item">
                  <div className="widget-avatar">{getInitials(user.fullName)}</div>
                  <div className="widget-user-info">
                    <div className="widget-user-name">{user.fullName}</div>
                    <div className="widget-user-email">{user.email}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span className={`badge-status-sm badge-status-sm--${(user.status || 'active').toLowerCase()}`}>
                      {user.status}
                    </span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{formatDate(user.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="widget-card">
          <div className="widget-card__header">
            <h2>💳 Giao dịch gần đây</h2>
            <Link to="/admin/transactions">Xem tất cả →</Link>
          </div>
          {(!data?.recentTransactions || data.recentTransactions.length === 0) ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>Không có dữ liệu</div>
          ) : (
            <ul className="widget-txn-list">
              {data.recentTransactions.map((txn) => {
                const statusCls = (txn.status || 'pending').toLowerCase();
                return (
                  <li key={txn.id} className="widget-txn-item">
                    <div className="widget-txn-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                    </div>
                    <div className="widget-txn-info">
                      <div className="widget-txn-user">{txn.userFullName || txn.userEmail || '-'}</div>
                      <div className="widget-txn-method">{txn.paymentMethod} • <span className={`txn-badge txn-badge--${statusCls}`}>{txn.status}</span></div>
                    </div>
                    <div className="widget-txn-right">
                      <div className="widget-txn-amount">{formatCurrency(txn.amount)}</div>
                      <div className="widget-txn-date">{formatDate(txn.createdAt)}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
