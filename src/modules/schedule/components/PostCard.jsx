import React from 'react';
import PlatformIcon from './PlatformIcon';

/**
 * Card hiển thị thông tin bài đăng trên lịch
 *
 * @param {{ post: {
 *   id: number,
 *   hour: number,
 *   minute: number,
 *   title: string,
 *   platform: string,
 *   color: string,
 * } }} props
 */
export default function PostCard({ post }) {
  const timeLabel = `${String(post.hour).padStart(2, '0')}:${String(post.minute).padStart(2, '0')}`;

  return (
    <div className="sc-post-card" style={{ borderLeftColor: post.color }}>
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

      {/* Nền tảng */}
      <div className="sc-post-card__platform">
        <PlatformIcon platform={post.platform} />
        <span>{post.platform === 'Facebook' ? 'Story QR' : post.platform}</span>
      </div>
    </div>
  );
}
