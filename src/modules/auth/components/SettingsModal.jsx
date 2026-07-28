import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../config/env';
import '../styles/SettingsModal.css';

export default function SettingsModal({
  isOpen,
  onClose,
  initialTab = 'account',
  subscription,
  onCancelSuccess,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [planFilter, setPlanFilter] = useState('ALL');
  const { user } = useAuth();

  const handleCancelSubscription = (subId) => {
    if (
      !window.confirm(
        'Bạn có chắc chắn muốn hủy gói dịch vụ hiện tại? Hành động này sẽ dừng ngay lập tức mọi quyền lợi của gói.'
      )
    ) {
      return;
    }

    const token = localStorage.getItem('marqops.authLab.accessToken');
    fetch(`${API_BASE_URL}/subscriptions/${subId}/cancel`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Không thể hủy gói dịch vụ');
        }
        return res.json();
      })
      .then((resJson) => {
        if (resJson && resJson.success) {
          alert('Hủy gói dịch vụ thành công!');
          if (onCancelSuccess) {
            onCancelSuccess();
          }
        } else {
          alert(resJson.message || 'Không thể hủy gói');
        }
      })
      .catch((err) => {
        alert(err.message || 'Đã xảy ra lỗi khi hủy gói');
      });
  };

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (isOpen && activeTab === 'billing') {
      fetchTransactions();
    }
  }, [isOpen, activeTab]);

  const fetchTransactions = () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('marqops.authLab.accessToken');

    fetch(`${API_BASE_URL}/transactions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Không thể tải lịch sử thanh toán');
        }
        return res.json();
      })
      .then((resJson) => {
        if (resJson && resJson.success && resJson.data) {
          setTransactions(resJson.data);
        } else {
          setTransactions([]);
        }
      })
      .catch((err) => {
        setError(err.message || 'Đã xảy ra lỗi');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getPlanDisplayName = (note) => {
    if (!note) return 'N/A';
    if (note.includes('Subscribe to plan:') || note.includes('Subscribe to paid plan:')) {
      return `Đăng ký gói ${note.split(':').pop().trim()}`;
    }
    if (note.includes('Renew subscription for plan:')) {
      return `Gia hạn gói ${note.split(':').pop().trim()}`;
    }
    if (note.includes('Renew (Reset Cycle) subscription for plan:')) {
      return `Gia hạn Reset gói ${note.split(':').pop().trim()}`;
    }
    if (note.includes('Renew (Stack Cycle) subscription for plan:')) {
      return `Gia hạn tiếp nối gói ${note.split(':').pop().trim()}`;
    }
    return note;
  };

  const getPlanNameFromNote = (note) => {
    if (!note) return 'Khác';
    if (note.toLowerCase().includes('free')) return 'Free';
    if (note.toLowerCase().includes('starter')) return 'Starter';
    if (note.toLowerCase().includes('pro')) return 'Pro';
    if (note.toLowerCase().includes('business')) return 'Business';
    return 'Khác';
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchStatus = statusFilter === 'ALL' || tx.status === statusFilter;
    const matchPlan = planFilter === 'ALL' || getPlanNameFromNote(tx.note) === planFilter;
    return matchStatus && matchPlan;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} - ${day}/${month}/${year}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return <span className="settings-status-badge paid">Đã thanh toán</span>;
      case 'PENDING':
        return <span className="settings-status-badge pending">Chờ thanh toán</span>;
      case 'FAILED':
        return <span className="settings-status-badge failed">Thất bại</span>;
      case 'REFUNDED':
        return <span className="settings-status-badge refunded">Đã hoàn tiền</span>;
      default:
        return <span className="settings-status-badge">{status}</span>;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'US';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Sidebar */}
        <div className="settings-modal-sidebar">
          <div className="settings-modal-sidebar-title">Cài đặt</div>
          <button
            className={`settings-modal-tab-btn ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Hồ sơ tài khoản</span>
          </button>
          <button
            className={`settings-modal-tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}
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
              <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            <span>Lịch sử thanh toán</span>
          </button>
        </div>

        {/* Content */}
        <div className="settings-modal-content">
          <button className="settings-modal-close-btn" onClick={onClose}>
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {activeTab === 'account' && (
            <div className="settings-tab-pane">
              <h2 className="settings-pane-title">Hồ sơ tài khoản</h2>
              <div className="settings-profile-card">
                <div className="settings-profile-avatar">{getInitials(user?.fullName)}</div>
                <div className="settings-profile-info">
                  <div className="profile-info-row">
                    <span className="profile-info-label">Họ và tên:</span>
                    <span className="profile-info-value">{user?.fullName || 'N/A'}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label">Địa chỉ Email:</span>
                    <span className="profile-info-value">{user?.email || 'N/A'}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label">Trạng thái:</span>
                    <span className="settings-status-badge paid">Đang hoạt động</span>
                  </div>
                </div>
              </div>

              {/* Gói dịch vụ hiện tại */}
              <div className="settings-subscription-section">
                <h3 className="settings-section-title">Gói dịch vụ đăng ký</h3>
                <div className="settings-subscription-card">
                  <div className="sub-details-row">
                    <span className="sub-details-label">Gói hiện tại:</span>
                    <span className="sub-details-value highlight">
                      {subscription?.planName || 'Free'}
                    </span>
                  </div>
                  {subscription &&
                    subscription.planName !== 'Admin' &&
                    subscription.planName !== 'Free' && (
                      <>
                        <div className="sub-details-row">
                          <span className="sub-details-label">Trạng thái:</span>
                          <span
                            className={`status-badge ${subscription.isTrial ? 'trial' : 'active'}`}
                          >
                            {subscription.isTrial ? 'Dùng thử' : 'Đang hoạt động'}
                          </span>
                        </div>
                        {subscription.endDate && (
                          <div className="sub-details-row">
                            <span className="sub-details-label">Ngày hết hạn:</span>
                            <span className="sub-details-value">
                              {formatDate(subscription.endDate)}
                            </span>
                          </div>
                        )}
                        <button
                          className="settings-cancel-sub-btn"
                          onClick={() => handleCancelSubscription(subscription.id)}
                        >
                          Hủy gói dịch vụ
                        </button>
                      </>
                    )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="settings-tab-pane">
              <h2 className="settings-pane-title">Lịch sử thanh toán</h2>
              {!loading && !error && transactions.length > 0 && (
                <div className="settings-filters-row">
                  <div className="settings-filter-group">
                    <label htmlFor="status-filter">Trạng thái:</label>
                    <select
                      id="status-filter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="settings-filter-select"
                    >
                      <option value="ALL">Tất cả trạng thái</option>
                      <option value="PAID">Đã thanh toán</option>
                      <option value="PENDING">Chờ thanh toán</option>
                      <option value="FAILED">Thất bại</option>
                      <option value="REFUNDED">Đã hoàn tiền</option>
                    </select>
                  </div>
                  <div className="settings-filter-group">
                    <label htmlFor="plan-filter">Gói dịch vụ:</label>
                    <select
                      id="plan-filter"
                      value={planFilter}
                      onChange={(e) => setPlanFilter(e.target.value)}
                      className="settings-filter-select"
                    >
                      <option value="ALL">Tất cả gói</option>
                      <option value="Free">Gói Free</option>
                      <option value="Starter">Gói Starter</option>
                      <option value="Pro">Gói Pro</option>
                      <option value="Business">Gói Business</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>
              )}
              {loading ? (
                <div className="settings-loading-container">
                  <div className="settings-spinner"></div>
                  <span>Đang tải lịch sử giao dịch...</span>
                </div>
              ) : error ? (
                <div className="settings-error-container">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              ) : transactions.length === 0 ? (
                <div className="settings-empty-container">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                  <span>Bạn chưa thực hiện giao dịch thanh toán nào.</span>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="settings-empty-container">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>Không tìm thấy giao dịch nào khớp với bộ lọc đã chọn.</span>
                </div>
              ) : (
                <div className="settings-table-wrapper">
                  <table className="settings-transactions-table">
                    <thead>
                      <tr>
                        <th>Mã GD</th>
                        <th>Gói dịch vụ</th>
                        <th>Số tiền</th>
                        <th>Phương thức</th>
                        <th>Thời gian</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((tx) => (
                        <tr key={tx.id}>
                          <td>
                            <strong>#{tx.id}</strong>
                          </td>
                          <td>
                            <span className="tx-plan-note">{getPlanDisplayName(tx.note)}</span>
                          </td>
                          <td>
                            <span className="tx-amount">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              }).format(tx.amount)}
                            </span>
                          </td>
                          <td>
                            <span className="tx-payment-method">{tx.paymentMethod}</span>
                          </td>
                          <td>
                            <span className="tx-date">{formatDate(tx.createdAt)}</span>
                          </td>
                          <td>{getStatusBadge(tx.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
