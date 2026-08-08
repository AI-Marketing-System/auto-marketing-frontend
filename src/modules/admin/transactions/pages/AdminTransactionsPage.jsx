import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { transactionsApi } from '../api/transactionsApi';
import '../styles/AdminTransactions.css';

const STATUS_OPTIONS = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];
const METHOD_OPTIONS = ['QR', 'MOMO', 'VNPAY', 'STRIPE'];

function statusBadge(status) {
  const map = { PENDING: 'pending', PAID: 'paid', FAILED: 'failed', REFUNDED: 'refunded' };
  return <span className={`badge badge--${(map[status] || 'pending')}`}><span className="badge__dot" />{status}</span>;
}

function methodBadge(method) {
  if (!method) return '-';
  const cls = method.toLowerCase();
  return <span className={`badge badge--${cls}`}>{method}</span>;
}

function formatCurrency(amount, currency = 'VND') {
  if (amount == null) return '-';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
}

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('vi-VN');
}

// --- Update Status Modal ---
function UpdateStatusModal({ transaction, onClose, onUpdated }) {
  const [status, setStatus] = useState(transaction?.status || 'PENDING');
  const [note, setNote] = useState(transaction?.note || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await transactionsApi.updateTransactionStatus(transaction.id, status, note);
      onUpdated();
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật trạng thái');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Cập nhật trạng thái giao dịch #{transaction?.id}</h2>
          <button type="button" className="btn-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="txn-alert txn-alert--error">{error}</div>}
            <div className="form-group">
              <label>Thông tin giao dịch</label>
              <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 8, fontSize: 14, color: '#334155' }}>
                <div><strong>Người dùng:</strong> {transaction?.userFullName} ({transaction?.userEmail})</div>
                <div><strong>Số tiền:</strong> {formatCurrency(transaction?.amount, transaction?.currency)}</div>
                <div><strong>Phương thức:</strong> {transaction?.paymentMethod}</div>
              </div>
            </div>
            <div className="form-group">
              <label>Trạng thái mới *</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} required>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Ghi chú</label>
              <textarea
                rows={3}
                placeholder="Nhập ghi chú (tuỳ chọn)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalPages: 0, totalElements: 0 });
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [editingTxn, setEditingTxn] = useState(null);

  const fetchTransactions = useCallback(async (page = 0, kw = keyword, st = statusFilter, pm = methodFilter) => {
    setLoading(true);
    try {
      const res = await transactionsApi.getTransactions({ keyword: kw, status: st, paymentMethod: pm, page, size: pageInfo.size });
      if (res?.data) {
        setTransactions(res.data.content || []);
        setPageInfo({ page: res.data.number || 0, size: res.data.size || 10, totalPages: res.data.totalPages || 0, totalElements: res.data.totalElements || 0 });
      }
    } catch (err) {
      showAlert('error', err.message || 'Không thể tải dữ liệu giao dịch');
    } finally {
      setLoading(false);
    }
  }, [keyword, statusFilter, methodFilter, pageInfo.size]);

  useEffect(() => { fetchTransactions(0); }, [fetchTransactions]);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const stats = useMemo(() => ({
    total: pageInfo.totalElements,
    paid: transactions.filter(t => t.status === 'PAID').length,
    pending: transactions.filter(t => t.status === 'PENDING').length,
    failed: transactions.filter(t => t.status === 'FAILED').length,
    totalRevenue: transactions.filter(t => t.status === 'PAID').reduce((s, t) => s + (Number(t.amount) || 0), 0),
  }), [transactions, pageInfo.totalElements]);

  return (
    <div className="txn-page">
      {/* Header */}
      <div className="txn-header">
        <div className="txn-header__title">
          <h1>Quản lý Giao dịch</h1>
          <p>Xem, tìm kiếm và cập nhật trạng thái tất cả giao dịch trong hệ thống</p>
        </div>
        <button type="button" className="btn-secondary" onClick={() => fetchTransactions(pageInfo.page)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          Làm mới
        </button>
      </div>

      {/* Alert */}
      {alert && (
        <div className={`txn-alert txn-alert--${alert.type}`}>
          <span>{alert.message}</span>
          <button type="button" className="btn-close" onClick={() => setAlert(null)}>✕</button>
        </div>
      )}

      {/* Stats */}
      <div className="txn-stats-grid">
        <div className="txn-stat-card">
          <div className="txn-stat-card__icon txn-stat-card__icon--violet">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
          </div>
          <div className="txn-stat-card__content"><h3>{pageInfo.totalElements}</h3><p>Tổng giao dịch</p></div>
        </div>
        <div className="txn-stat-card">
          <div className="txn-stat-card__icon txn-stat-card__icon--green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <div className="txn-stat-card__content"><h3>{stats.paid}</h3><p>Đã thanh toán (PAID)</p></div>
        </div>
        <div className="txn-stat-card">
          <div className="txn-stat-card__icon txn-stat-card__icon--amber">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          </div>
          <div className="txn-stat-card__content"><h3>{stats.pending}</h3><p>Đang chờ (PENDING)</p></div>
        </div>
        <div className="txn-stat-card">
          <div className="txn-stat-card__icon txn-stat-card__icon--red">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          </div>
          <div className="txn-stat-card__content"><h3>{stats.failed}</h3><p>Thất bại (FAILED)</p></div>
        </div>
        <div className="txn-stat-card">
          <div className="txn-stat-card__icon txn-stat-card__icon--blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          </div>
          <div className="txn-stat-card__content">
            <h3>{stats.totalRevenue.toLocaleString('vi-VN')} ₫</h3>
            <p>Doanh thu (trang này)</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="txn-toolbar">
        <div className="txn-search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            type="text"
            placeholder="Tìm theo email, tên, mã giao dịch..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchTransactions(0)}
          />
        </div>
        <select className="txn-select" value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); fetchTransactions(0, keyword, e.target.value, methodFilter); }}>
          <option value="all">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="txn-select" value={methodFilter}
          onChange={(e) => { setMethodFilter(e.target.value); fetchTransactions(0, keyword, statusFilter, e.target.value); }}>
          <option value="all">Tất cả phương thức</option>
          {METHOD_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="txn-table-card">
        {loading ? (
          <div className="txn-empty">Đang tải dữ liệu giao dịch...</div>
        ) : transactions.length === 0 ? (
          <div className="txn-empty">Không tìm thấy giao dịch nào.</div>
        ) : (
          <table className="txn-table">
            <thead>
              <tr>
                <th>#ID</th>
                <th>Người dùng</th>
                <th>Gói / Plan</th>
                <th>Số tiền</th>
                <th>Phương thức</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
                <th style={{ textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600, color: '#6366f1' }}>#{t.id}</td>
                  <td>
                    <div className="txn-user-info">
                      <span className="txn-user-name">{t.userFullName || '-'}</span>
                      <span className="txn-user-email">{t.userEmail || '-'}</span>
                    </div>
                  </td>
                  <td>{t.planName || <span style={{ color: '#94a3b8' }}>N/A</span>}</td>
                  <td><span className="txn-amount">{formatCurrency(t.amount, t.currency)}</span></td>
                  <td>{methodBadge(t.paymentMethod)}</td>
                  <td>{statusBadge(t.status)}</td>
                  <td style={{ fontSize: 13, color: '#64748b' }}>{formatDate(t.createdAt)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button type="button" className="btn-edit" onClick={() => setEditingTxn(t)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Cập nhật
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pageInfo.totalPages > 1 && (
        <div className="txn-pagination">
          <div className="txn-pagination__info">
            Trang {pageInfo.page + 1} / {pageInfo.totalPages} (Tổng: {pageInfo.totalElements} giao dịch)
          </div>
          <div className="txn-pagination__controls">
            <button type="button" className="btn-page" disabled={pageInfo.page === 0}
              onClick={() => fetchTransactions(pageInfo.page - 1)}>‹</button>
            {Array.from({ length: Math.min(pageInfo.totalPages, 7) }, (_, i) => (
              <button key={i} type="button"
                className={`btn-page ${i === pageInfo.page ? 'btn-page--active' : ''}`}
                onClick={() => fetchTransactions(i)}>{i + 1}</button>
            ))}
            <button type="button" className="btn-page" disabled={pageInfo.page >= pageInfo.totalPages - 1}
              onClick={() => fetchTransactions(pageInfo.page + 1)}>›</button>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {editingTxn && (
        <UpdateStatusModal
          transaction={editingTxn}
          onClose={() => setEditingTxn(null)}
          onUpdated={() => {
            setEditingTxn(null);
            showAlert('success', 'Cập nhật trạng thái giao dịch thành công!');
            fetchTransactions(pageInfo.page);
          }}
        />
      )}
    </div>
  );
}
