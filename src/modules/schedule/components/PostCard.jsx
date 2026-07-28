import React from 'react';

/** Lấy 1-2 chữ cái đầu từ tên fanpage */
function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

/** Mini avatar của một fanpage */
function FanpageMiniAvatar({ fp }) {
  return (
    <div className="sc-fanpage-mini" title={fp.fanpageName}>
      <div className="sc-fanpage-mini__circle">
        {fp.fanpageAvatarUrl ? (
          <img
            src={fp.fanpageAvatarUrl}
            alt={fp.fanpageName}
            className="sc-fanpage-mini__img"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <span
          className="sc-fanpage-mini__initial"
          style={{ display: fp.fanpageAvatarUrl ? 'none' : 'flex' }}
        >
          {getInitials(fp.fanpageName)}
        </span>
      </div>
      {/* Facebook badge */}
      <div className="sc-fanpage-mini__badge">f</div>
    </div>
  );
}

/**
 * Card hiển thị thông tin bài đăng trên lịch
 * Props:
 *  - post: { id, hour, minute, title, color, status, publishTime, postContent, targetFanpages }
 *  - onCardClick: (post) => void – mở ScheduleDetailModal
 */
export default function PostCard({ post, onCardClick }) {
  const timeLabel = `${String(post.hour).padStart(2, '0')}:${String(post.minute).padStart(2, '0')}`;

  const handleClick = (e) => {
    e.stopPropagation(); // Không lan sang ô lịch
    onCardClick?.(post);
  };

  const targetFanpages = post.targetFanpages || [];
  // Hiển thị tối đa 3 avatar, còn lại hiện số "+N"
  const MAX_VISIBLE = 3;
  const visibleFps = targetFanpages.slice(0, MAX_VISIBLE);
  const extraCount = targetFanpages.length - MAX_VISIBLE;

  return (
    <div
      className="sc-post-card"
      style={{ borderLeftColor: post.color }}
      onClick={handleClick}
      title="Nhấn để xem chi tiết và quản lý lịch đăng"
    >
      {/* Giờ đăng */}
      <div className="sc-post-card__time">{timeLabel}</div>

      {/* Ảnh thumbnail + tiêu đề */}
      <div className="sc-post-card__body">
        <div className="sc-post-card__img-placeholder">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <span className="sc-post-card__title">{post.title}</span>
      </div>

      {/* Fanpage avatars */}
      <div className="sc-post-card__fanpages">
        {targetFanpages.length === 0 ? (
          <span className="sc-post-card__no-fanpage">Chưa có fanpage</span>
        ) : (
          <>
            {visibleFps.map((fp) => (
              <FanpageMiniAvatar key={fp.fanpageId} fp={fp} />
            ))}
            {extraCount > 0 && (
              <div className="sc-fanpage-mini__extra" title={`+${extraCount} fanpage khác`}>
                +{extraCount}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
