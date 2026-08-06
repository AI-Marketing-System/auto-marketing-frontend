import React from 'react';
import '../styles/SubscriptionModule.css';

/**
 * QuotaBar: Reusable progress bar component displaying usage vs limit.
 * Colors change dynamically based on usage ratio (Normal -> Warning -> Danger).
 */
export function QuotaBar({
  current = 0,
  max = null,
  label = '',
  unit = '',
  warningThreshold = 0.8,
  dangerThreshold = 0.95,
  compact = false
}) {
  const isUnlimited = max === null || max === undefined || max < 0;
  const ratio = isUnlimited ? 0 : Math.min(1, Math.max(0, current / (max || 1)));
  const percentage = Math.round(ratio * 100);

  let barFillClass = 'quota-bar-fill-normal';
  if (ratio >= dangerThreshold) {
    barFillClass = 'quota-bar-fill-danger';
  } else if (ratio >= warningThreshold) {
    barFillClass = 'quota-bar-fill-warning';
  }

  const formatNumber = (val) => {
    if (val === null || val === undefined) return '0';
    return Number(val).toLocaleString('vi-VN');
  };

  if (compact) {
    return (
      <div className="quota-bar-compact" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div className="quota-bar-header">
          <span className="quota-bar-label">{label}</span>
          <span className="quota-bar-numbers">
            {formatNumber(current)} {unit} / {isUnlimited ? 'Vô hạn' : `${formatNumber(max)} ${unit}`}
          </span>
        </div>
        {!isUnlimited && (
          <div className="quota-bar-track" style={{ height: '6px' }}>
            <div
              className={`quota-bar-fill ${barFillClass}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="quota-bar-box">
      <div className="quota-bar-header">
        <span className="quota-bar-label">{label}</span>
        <span className="quota-bar-numbers">
          {formatNumber(current)} {unit} / {isUnlimited ? '∞' : `${formatNumber(max)} ${unit}`}
        </span>
      </div>

      {!isUnlimited ? (
        <div className="quota-bar-track">
          <div
            className={`quota-bar-fill ${barFillClass}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      ) : (
        <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>Không giới hạn</div>
      )}

      {!isUnlimited && (
        <div className="quota-bar-subtext">
          <span>Đã sử dụng {percentage}%</span>
          {ratio >= dangerThreshold && <span className="quota-bar-danger-text">Sắp hết hạn mức</span>}
        </div>
      )}
    </div>
  );
}

export default QuotaBar;
