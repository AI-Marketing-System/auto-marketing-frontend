import React from 'react';

const formatMetric = (value) =>
  new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);

const MetricIcon = ({ name }) => {
  const commonProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  };

  if (name === 'reach') {
    return (
      <svg {...commonProps}>
        <path d="m3 11 18-6-4.6 13.8-3.1-5.2L8 17l-1.2-4.3L3 11Z" />
        <path d="m13.3 13.6 4.8 2.1" />
      </svg>
    );
  }

  if (name === 'followers') {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="8" r="3.4" />
        <path d="M5.5 20c.7-3.1 3-5 6.5-5s5.8 1.9 6.5 5" />
        <path d="M18 8h3M19.5 6.5v3" />
      </svg>
    );
  }

  if (name === 'engagement') {
    return (
      <svg {...commonProps}>
        <path d="M7.5 20H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h2.5v9Z" />
        <path d="M7.5 18.5 11 21l.4-5.1h5.1c1.1 0 2-.9 2-2v-1.4a2 2 0 0 0-2-2h-2.9l.5-3.1A2 2 0 0 0 12.1 5L7.5 11" />
        <path d="M18 5v2M21 7h-2M19.7 4.3l-1.4 1.4" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
};

const MetricCard = ({ label, value, helper, trend, tone = 'views', icon, sparkline = [] }) => {
  const values = sparkline.length > 0 ? sparkline.slice(-7) : [0, 0, 0, 0, 0, 0, 0];
  const maxValue = Math.max(...values, 1);

  return (
    <article className={`metric-card metric-card--${tone}`}>
      <div className="metric-card__ornament" aria-hidden="true" />
      <div className="metric-card__icon">
        <MetricIcon name={icon || tone} />
      </div>
      <div className="metric-card__heading">
        <span className="metric-card__label">{label}</span>
        <span className="metric-card__dot" aria-hidden="true" />
      </div>
      <strong className="metric-card__value">{formatMetric(value)}</strong>
      <div className="metric-card__footer">
        <span>{helper}</span>
        <span className="metric-card__trend">{trend}</span>
      </div>
      <div className="metric-card__sparkline" aria-hidden="true">
        {values.map((point, index) => (
          <span
            className="metric-card__sparkline-bar"
            key={`${label}-${index}`}
            style={{ height: `${Math.max(12, Math.round((Number(point) / maxValue) * 100))}%` }}
          />
        ))}
      </div>
    </article>
  );
};

export default MetricCard;
