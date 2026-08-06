function toSafeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

export default function QuotaBar({ label, used = 0, limit = 0, color = '#4f46e5' }) {
  const safeUsed = toSafeNumber(used);
  const safeLimit = toSafeNumber(limit);
  const percentage = safeLimit > 0 ? Math.min((safeUsed / safeLimit) * 100, 100) : 0;
  const isExceeded = safeLimit > 0 && safeUsed >= safeLimit;

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <span style={styles.label}>{label}</span>
        <span style={styles.value}>
          {safeUsed.toLocaleString('vi-VN')} / {safeLimit.toLocaleString('vi-VN')}
        </span>
      </div>

      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeLimit}
        aria-valuenow={Math.min(safeUsed, safeLimit)}
        style={styles.track}
      >
        <div
          style={{
            ...styles.fill,
            width: `${percentage}%`,
            backgroundColor: isExceeded ? '#dc2626' : color,
          }}
        />
      </div>
    </div>
  );
}

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  label: {
    color: '#374151',
    fontSize: '14px',
    fontWeight: 600,
  },
  value: {
    color: '#6b7280',
    fontSize: '13px',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  track: {
    width: '100%',
    height: '8px',
    overflow: 'hidden',
    borderRadius: '999px',
    backgroundColor: '#e5e7eb',
  },
  fill: {
    height: '100%',
    borderRadius: 'inherit',
    transition: 'width 200ms ease',
  },
};
