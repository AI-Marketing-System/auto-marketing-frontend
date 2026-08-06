import { useEffect } from 'react';
import QuotaBar from '../QuotaBar/QuotaBar';

function formatEndDate(value) {
  if (!value) return 'Không giới hạn';

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Chưa cập nhật'
    : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(date);
}

export default function QuotaModal({
  isOpen,
  onClose,
  onUpgrade,
  quota,
  endDate,
  loading = false,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quotaItems = [
    {
      label: 'Workspace',
      used: quota?.currentWorkspacesCount,
      limit: quota?.maxWorkspaces,
      color: '#4f46e5',
    },
    {
      label: 'Social Account',
      used: quota?.currentSocialAccountsCount,
      limit: quota?.maxSocialAccounts,
      color: '#0284c7',
    },
    {
      label: 'Fanpage',
      used: quota?.currentFanpagesCount,
      limit: quota?.maxFanpages,
      color: '#0891b2',
    },
    {
      label: 'AI Token',
      used: quota?.aiTokensUsed,
      limit: quota?.aiTokenLimit,
      color: '#7c3aed',
    },
  ];

  return (
    <div
      role="presentation"
      style={styles.backdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="quota-modal-title"
        style={styles.modal}
      >
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>Gói hiện tại</p>
            <h2 id="quota-modal-title" style={styles.title}>
              {quota?.planName || 'Chưa xác định'}
              {quota?.isTrial ? <span style={styles.trialBadge}>Dùng thử</span> : null}
            </h2>
            <p style={styles.expiry}>Ngày hết hạn: {formatEndDate(endDate)}</p>
          </div>

          <button type="button" aria-label="Đóng" onClick={onClose} style={styles.closeButton}>
            ×
          </button>
        </div>

        <div style={styles.body}>
          {loading ? (
            <p style={styles.status}>Đang tải thông tin hạn mức...</p>
          ) : (
            quotaItems.map((item) => <QuotaBar key={item.label} {...item} />)
          )}
        </div>

        <div style={styles.footer}>
          <button type="button" onClick={onClose} style={styles.secondaryButton}>
            Đóng
          </button>
          <button type="button" onClick={onUpgrade} style={styles.primaryButton}>
            Nâng cấp
          </button>
        </div>
      </section>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 1100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  modal: {
    width: 'min(100%, 520px)',
    overflow: 'hidden',
    borderRadius: '16px',
    backgroundColor: '#ffffff',
    boxShadow: '0 24px 64px rgba(15, 23, 42, 0.24)',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '24px 24px 20px',
    borderBottom: '1px solid #e5e7eb',
  },
  eyebrow: {
    margin: '0 0 4px',
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: 0,
    color: '#111827',
    fontSize: '22px',
  },
  trialBadge: {
    padding: '4px 8px',
    borderRadius: '999px',
    color: '#6d28d9',
    backgroundColor: '#ede9fe',
    fontSize: '11px',
    fontWeight: 700,
  },
  expiry: {
    margin: '8px 0 0',
    color: '#6b7280',
    fontSize: '13px',
  },
  closeButton: {
    width: '34px',
    height: '34px',
    padding: 0,
    border: 0,
    borderRadius: '8px',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    cursor: 'pointer',
    fontSize: '24px',
    lineHeight: 1,
  },
  body: {
    display: 'flex',
    minHeight: '252px',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '22px',
    padding: '24px',
  },
  status: {
    margin: 0,
    color: '#6b7280',
    textAlign: 'center',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '16px 24px 24px',
  },
  secondaryButton: {
    padding: '10px 18px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    color: '#374151',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    fontWeight: 600,
  },
  primaryButton: {
    padding: '10px 18px',
    border: 0,
    borderRadius: '8px',
    color: '#ffffff',
    backgroundColor: '#4f46e5',
    cursor: 'pointer',
    fontWeight: 700,
  },
};
