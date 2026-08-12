import React from 'react';
import { AlertTriangleIcon, CheckCircleIcon, InfoIcon, XIcon } from './PlannerIcons';

const TONE_ICONS = {
  error: AlertTriangleIcon,
  warning: AlertTriangleIcon,
  info: InfoIcon,
  success: CheckCircleIcon,
};

/**
 * Hộp thông báo dùng chung. Project chưa có toast/snackbar nào, và thông báo inline vẫn là cách
 * đang dùng ở mọi trang khác — thêm toast ở đây sẽ là hệ thống đầu tiên và lệch khỏi phần còn lại.
 *
 * @param {{ tone?: 'error'|'warning'|'info'|'success', title?: string, message?: React.ReactNode,
 *           items?: string[], onRetry?: () => void, retryLabel?: string, onDismiss?: () => void }} props
 */
function PlannerAlert({ tone = 'info', title, message, items, onRetry, retryLabel = 'Thử lại', onDismiss }) {
  const Icon = TONE_ICONS[tone] || InfoIcon;

  return (
    <div className={`wp-alert wp-alert--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <span className="wp-alert__icon">
        <Icon size={18} />
      </span>
      <div className="wp-alert__content">
        {title && <p className="wp-alert__title">{title}</p>}
        {message && <p className="wp-alert__message">{message}</p>}
        {Array.isArray(items) && items.length > 0 && (
          <ul className="wp-alert__list">
            {items.map((item, index) => (
              <li key={`${index}-${item}`}>{item}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="wp-alert__actions">
        {onRetry && (
          <button type="button" className="wp-alert__action" onClick={onRetry}>
            {retryLabel}
          </button>
        )}
        {onDismiss && (
          <button type="button" className="wp-alert__dismiss" onClick={onDismiss} title="Đóng">
            <XIcon size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default PlannerAlert;
