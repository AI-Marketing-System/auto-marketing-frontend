import { useState, useEffect, useCallback } from 'react';
import { listSocialAccounts, disconnectSocialAccount } from '../api/socialAccountApi';
import ConnectFacebookButton from '../components/ConnectFacebookButton';
import SocialAccountCard from '../components/SocialAccountCard';
import FanpageListModal from '../components/FanpageListModal';
import '../styles/SocialAccountsPage.css';

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isFanpageModalOpen, setIsFanpageModalOpen] = useState(false);

  const fetchAccounts = useCallback(async (preserveError = false) => {
    setLoading(true);
    if (!preserveError) setError(null);
    try {
      const data = await listSocialAccounts();
      setAccounts(data || []);
    } catch (err) {
      if (!preserveError) setError(err.message || 'Không thể tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  }, []);

  // Xử lý query params từ callback redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const message = params.get('message');

    if (status && message) {
      const decoded = decodeURIComponent(message);
      if (status === 'success') {
        setSuccessMessage(decoded);
        fetchAccounts();
      } else if (status === 'error') {
        setError(decoded);
        fetchAccounts(true); // preserveError=true để không xoá error message từ callback
      }
      // Xoá query params khỏi URL để không hiển thị lại khi refresh
      window.history.replaceState({}, '', '/social-accounts');
    } else {
      fetchAccounts();
    }
  }, [fetchAccounts]);

  // Tự động ẩn thông báo sau 5 giây
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleManageFanpages = (account) => {
    setSelectedAccount(account);
    setIsFanpageModalOpen(true);
  };

  const handleCloseFanpageModal = () => {
    setIsFanpageModalOpen(false);
    setSelectedAccount(null);
  };

  const handleDisconnect = async (accountId) => {
    try {
      await disconnectSocialAccount(accountId);
      setAccounts((prev) => prev.filter((a) => a.id !== accountId));
      setSuccessMessage('Đã ngắt kết nối tài khoản thành công!');
    } catch (err) {
      setError(err.message || 'Ngắt kết nối thất bại');
    }
  };

  return (
    <div className="sa-page">
      {/* Header */}
      <div className="sa-page__header">
        <div className="sa-page__header-left">
          <h1 className="sa-page__title">Tài khoản mạng xã hội</h1>
          <p className="sa-page__subtitle">
            Quản lý kết nối Facebook và các Fanpage đang được quản lý
          </p>
        </div>
        <div className="sa-page__header-right">
          <ConnectFacebookButton />
        </div>
      </div>

      {/* Success notification */}
      {successMessage && (
        <div className="sa-page__success">
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
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="sa-page__error">
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
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="sa-page__loading">
          <span className="connect-btn__spinner" />
          <span>Đang tải danh sách tài khoản...</span>
        </div>
      ) : accounts.length === 0 ? (
        /* Empty state */
        <div className="sa-page__empty">
          <div className="sa-page__empty-icon">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </div>
          <h2 className="sa-page__empty-title">Chưa kết nối tài khoản nào</h2>
          <p className="sa-page__empty-text">
            Kết nối tài khoản Facebook để bắt đầu quản lý Fanpage và tạo chiến dịch marketing.
          </p>
        </div>
      ) : (
        /* Accounts grid */
        <div className="sa-page__grid">
          {accounts.map((account) => (
            <SocialAccountCard
              key={account.id}
              account={account}
              onManageFanpages={handleManageFanpages}
              onDisconnect={handleDisconnect}
            />
          ))}
        </div>
      )}

      {/* Fanpage Modal */}
      <FanpageListModal
        isOpen={isFanpageModalOpen}
        onClose={handleCloseFanpageModal}
        account={selectedAccount}
      />
    </div>
  );
}
