import React from 'react';

/**
 * PlatformSelector – Thanh chọn Fanpage để đăng bài
 * Hiển thị dạng avatar tròn có badge "f" + nút "+" thêm
 *
 * Props:
 *   fanpages: Array<{fanpageId, fanpageName, fanpageAvatarUrl}>
 *   selectedFanpageIds: number[]
 *   onToggle: (fanpageId: number) => void
 *   fanpagesLoading: boolean
 */

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function PlatformSelector({
  fanpages = [],
  selectedFanpageIds = [],
  onToggle,
  fanpagesLoading = false,
}) {
  if (fanpagesLoading) {
    return (
      <div className="cp-platform-bar">
        {[1, 2].map((i) => (
          <div key={i} style={{
            width: 44, height: 44, borderRadius: '50%',
            background: '#f1f5f9', animation: 'cp-pulse 1.4s ease infinite',
          }} />
        ))}
      </div>
    );
  }

  if (fanpages.length === 0) {
    return (
      <div className="cp-platform-bar">
        <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
          Chưa có fanpage nào — liên kết trong Tài khoản xã hội
        </span>
      </div>
    );
  }

  return (
    <div className="cp-platform-bar" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
      {fanpages.map((fp) => {
        const isSelected = selectedFanpageIds.includes(fp.fanpageId);
        const name = fp.fanpageName || `Fanpage #${fp.fanpageId}`;

        return (
          <button
            key={fp.fanpageId}
            type="button"
            title={`${name}${isSelected ? ' (đã chọn)' : ' (nhấp để chọn)'}`}
            onClick={() => onToggle?.(fp.fanpageId)}
            style={{
              position: 'relative',
              width: 44, height: 44,
              borderRadius: '50%',
              border: `2.5px solid ${isSelected ? '#4f46e5' : '#e2e8f0'}`,
              padding: 0, cursor: 'pointer',
              background: '#e2e8f0',
              overflow: 'visible',
              transition: 'border-color 0.18s, box-shadow 0.18s',
              boxShadow: isSelected ? '0 0 0 3px rgba(79,70,229,0.18)' : 'none',
              flexShrink: 0,
            }}
          >
            {/* Avatar */}
            <div style={{
              width: '100%', height: '100%',
              borderRadius: '50%', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#c7d2fe', fontSize: 13, fontWeight: 700, color: '#3730a3',
            }}>
              {fp.fanpageAvatarUrl ? (
                <img
                  src={fp.fanpageAvatarUrl}
                  alt={name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : getInitials(name)}
            </div>

            {/* Badge Facebook */}
            <span style={{
              position: 'absolute', bottom: -2, right: -2,
              width: 16, height: 16,
              background: '#1877f2', borderRadius: '50%',
              border: '2px solid #fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 900, color: '#fff', lineHeight: 1,
              pointerEvents: 'none',
            }}>
              f
            </span>

            {/* Dấu tick khi chọn */}
            {isSelected && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                width: 16, height: 16,
                background: '#4f46e5', borderRadius: '50%',
                border: '2px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            )}
          </button>
        );
      })}

      {/* Nút "+" thêm fanpage */}
      <button
        type="button"
        title="Quản lý fanpage trong mục Tài khoản xã hội"
        style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '2px dashed #cbd5e1',
          background: '#f8fafc', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#94a3b8', fontSize: 20, fontWeight: 300,
          transition: 'all 0.15s', flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#7c3aed';
          e.currentTarget.style.color = '#7c3aed';
          e.currentTarget.style.background = '#f5f3ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#cbd5e1';
          e.currentTarget.style.color = '#94a3b8';
          e.currentTarget.style.background = '#f8fafc';
        }}
      >
        +
      </button>
    </div>
  );
}
