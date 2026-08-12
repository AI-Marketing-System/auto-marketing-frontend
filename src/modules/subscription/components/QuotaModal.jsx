import React from 'react';
import QuotaBar from './QuotaBar';
import { useQuota } from '../hooks/useQuota';
import '../styles/SubscriptionModule.css';

export function QuotaModal({ isOpen, onClose, onOpenUpgrade }) {
  const { quota, loading, refresh } = useQuota();

  // Tự động tải lại hạn mức mới nhất từ Backend mỗi khi mở Modal
  React.useEffect(() => {
    if (isOpen) {
      refresh();
    }
  }, [isOpen, refresh]);

  if (!isOpen) return null;


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="quota-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="quota-modal-header">
          <div>
            <h2 className="quota-modal-title">Chi tiết hạn mức sử dụng</h2>
            {quota && (
              <p className="quota-modal-subtitle">
                Gói hiện tại: <span className="quota-plan-badge">{quota.planName}</span>
                {quota.isTrial && <span className="quota-trial-tag">Dùng thử</span>}
              </p>
            )}
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="quota-modal-body">
          {loading && !quota ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
              <div className="modal-loading">Đang tải hạn mức...</div>
            </div>
          ) : quota ? (
            <>
              {/* Workspace quota */}
              {quota.maxWorkspaces !== undefined && (
                <QuotaBar
                  label="Workspace (Không gian làm việc)"
                  current={quota.currentWorkspacesCount ?? 0}
                  max={quota.maxWorkspaces}
                  unit="workspace"
                />
              )}

              {/* Social Accounts quota */}
              <QuotaBar
                label="Tài khoản Mạng xã hội"
                current={quota.currentSocialAccountsCount ?? 0}
                max={quota.maxSocialAccounts}
                unit="tài khoản"
              />

              {/* Fanpage / Workspace quota */}
              <QuotaBar
                label="Fanpage / Workspace"
                current={quota.currentFanpagesCount ?? 0}
                max={quota.maxFanpages}
                unit="fanpage"
              />

              {/* AI Token quota */}
              <QuotaBar
                label="AI Token (Hạn mức sinh nội dung & ảnh)"
                current={quota.aiTokensUsed ?? 0}
                max={quota.aiTokenLimit}
                unit="token"
              />
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
              <p>Không thể tải thông tin hạn mức.</p>
              <button
                onClick={refresh}
                style={{ marginTop: '8px', color: '#6366f1', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Thử lại
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="quota-modal-footer">
          <button className="btn-quota-close" onClick={onClose}>
            Đóng
          </button>
          {onOpenUpgrade && (
            <button
              className="btn-quota-upgrade"
              onClick={() => {
                onClose();
                onOpenUpgrade();
              }}
            >
              Nâng cấp gói ngay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuotaModal;
