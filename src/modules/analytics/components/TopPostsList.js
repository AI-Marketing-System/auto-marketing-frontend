import React, { useState } from 'react';
import KpiComparisonModal from './KpiComparisonModal';

const DEFAULT_AVATAR = '/logo192.png';

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const firstValue = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

/* Strip markdown artifacts (leading #, ** bold markers) so titles render clean. */
const sanitizeTitle = (value) =>
  String(value)
    .replace(/\*\*/g, '')
    .replace(/^[#\s]+/, '')
    .trim();

const formatCompactNumber = (value) =>
  new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(toNumber(value));

const formatScore = (value) =>
  new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: Number.isInteger(toNumber(value)) ? 0 : 1,
  }).format(toNumber(value));

const formatPublishedAt = (value) => {
  if (!value) return 'Chưa xác định thời gian';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chưa xác định thời gian';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const normalizeTopPosts = (posts) => {
  if (!Array.isArray(posts)) return [];

  return posts
    .map((post, index) => {
      const source = post?.post || post || {};
      const metrics = source.metrics || source.statistics || {};
      const likes = toNumber(firstValue(source.likes, metrics.likes));
      const comments = toNumber(firstValue(source.comments, metrics.comments));
      const shares = toNumber(firstValue(source.shares, metrics.shares));
      const engagement = toNumber(
        firstValue(source.totalEngagement, source.engagement, source.engagements, metrics.engagement, metrics.engagements, likes + comments + shares)
      );
      const publishedAt = firstValue(
        source.publishedAt,
        source.publishTime,
        source.scheduledAt,
        source.createdAt,
        source.date
      );
      const fanpage = source.fanpage || source.page || {};

      return {
        id: firstValue(source.postTargetId, source.id, source.postId, source.scheduleId, `top-post-${index}`),
        title: sanitizeTitle(
          firstValue(
            source.contentPreview,
            source.title,
            source.postTitle,
            source.content,
            source.postContent,
            source.message,
            'Bài viết không có tiêu đề'
          )
        ),
        fanpageName: String(
          firstValue(source.fanpageName, source.fanpageNames, source.pageName, fanpage.name, fanpage.fanpageName, 'Fanpage')
        ),
        fanpageAvatar: firstValue(
          source.fanpageAvatarUrl,
          source.avatarUrl,
          source.pictureUrl,
          fanpage.avatarUrl,
          fanpage.fanpageAvatarUrl,
          DEFAULT_AVATAR
        ),
        publishedAt,
        views: firstValue(source.views, source.impressions, source.reach, metrics.views, metrics.impressions, 0),
        likes,
        comments,
        shares,
        engagement,
        score: firstValue(
          source.score,
          source.performanceScore,
          source.engagementScore,
          source.totalScore,
          metrics.score,
          engagement
        ),
      };
    });
};

const EyeIcon = () => (
  <svg className="analytics-top-post-row__metric-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EngagementIcon = () => (
  <svg className="analytics-top-post-row__metric-icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
    <path d="M10.29,4.52L11,3.1L11.71,4.52C11.83,4.76 12.11,4.86 12.35,4.74C12.59,4.62 12.69,4.34 12.57,4.1L11.45,1.86C11.27,1.5 10.73,1.5 10.55,1.86L9.43,4.1C9.31,4.34 9.41,4.62 9.65,4.74C9.89,4.86 10.17,4.76 10.29,4.52M5.16,6.34L3.63,5.69C3.37,5.58 3.08,5.71 2.97,5.97C2.86,6.23 2.99,6.52 3.25,6.63L4.78,7.28C4.85,7.31 4.92,7.32 5,7.32C5.19,7.32 5.37,7.21 5.46,7.03C5.57,6.77 5.44,6.47 5.16,6.34M18.84,6.34C18.56,6.47 18.43,6.77 18.54,7.03C18.63,7.21 18.81,7.32 19,7.32C19.08,7.32 19.15,7.31 19.22,7.28L20.75,6.63C21.01,6.52 21.14,6.23 21.03,5.97C20.92,5.71 20.63,5.58 20.37,5.69L18.84,6.34M12.92,8.81C12.8,8.81 12.68,8.85 12.59,8.94L11,10.53V7.5C11,7.22 10.78,7 10.5,7C10.22,7 10,7.22 10,7.5V13.88L8.71,13.23C8.65,13.2 8.58,13.19 8.5,13.19C8.36,13.19 8.23,13.25 8.14,13.34L7,14.48L10.34,17.82C10.72,18.2 11.23,18.4 11.77,18.4H15C16.1,18.4 17,17.5 17,16.4V11.5C17,11.22 16.78,11 16.5,11C16.45,11 16.39,11 16.34,11.02C16.14,10.15 15.35,9.5 14.41,9.5C14.33,9.5 14.25,9.5 14.17,9.52C13.91,8.96 13.43,8.81 12.92,8.81Z" />
  </svg>
);

const LikeIcon = () => (
  <svg className="analytics-top-post-row__metric-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

const CommentIcon = () => (
  <svg className="analytics-top-post-row__metric-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ShareIcon = () => (
  <svg className="analytics-top-post-row__metric-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const TopPostsList = ({ posts = [], loading = false, page = 0, totalPages = 0, onPageChange, sortBy = 'engagement' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPostInfo, setSelectedPostInfo] = useState(null);

  const handlePostClick = (post) => {
    setSelectedPostInfo(post);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="analytics-top-posts__loading" role="status" aria-live="polite">
        <span className="analytics-loading__spinner" aria-hidden="true" />
        Đang tải danh sách bài viết nổi bật...
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="analytics-top-posts__empty" role="status">
        <strong>Chưa có dữ liệu điểm bài viết</strong>
        <span>Hãy chọn ít nhất một kênh đã có nội dung được phân tích.</span>
      </div>
    );
  }

  return (
    <>
      <ol className="analytics-top-posts__list">
        {posts.map((post, index) => (
          <li 
            className="analytics-top-post-row" 
            key={post.id} 
            style={{ '--row-index': index, cursor: 'pointer', transition: 'background 0.2s' }}
            onClick={() => handlePostClick(post)}
            title="Click để so sánh KPI"
          >
            <span
              className={`analytics-top-post-row__rank${
                page === 0
                  ? index === 0
                    ? ' analytics-top-post-row__rank--first'
                    : index === 1
                    ? ' analytics-top-post-row__rank--second'
                    : index === 2
                    ? ' analytics-top-post-row__rank--third'
                    : ''
                  : ''
              }`}
              aria-label={`Hạng ${page * 5 + index + 1}`}
            >
              {String(page * 5 + index + 1).padStart(2, '0')}
            </span>

            <div className="analytics-top-post-row__content">
              <strong className="analytics-top-post-row__title" title={post.title}>
                {post.title}
              </strong>
              <div className="analytics-top-post-row__meta">
                <img src={post.fanpageAvatar} alt="" />
                <span>{post.fanpageName}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={post.publishedAt || undefined}>{formatPublishedAt(post.publishedAt)}</time>
              </div>
            </div>

            <div className="analytics-top-post-row__metrics">
              <div className="analytics-top-post-row__metric" title={`${toNumber(post.views).toLocaleString('vi-VN')} lượt xem`}>
                <span className="analytics-top-post-row__metric-value">
                  <EyeIcon />
                  <strong>{formatCompactNumber(post.views)}</strong>
                </span>
                <span className="analytics-top-post-row__metric-label">Lượt xem</span>
              </div>

              {sortBy === 'likes' && (
                <div className="analytics-top-post-row__metric" title={`${toNumber(post.likes).toLocaleString('vi-VN')} lượt thích`}>
                  <span className="analytics-top-post-row__metric-value">
                    <LikeIcon />
                    <strong>{formatCompactNumber(post.likes)}</strong>
                  </span>
                  <span className="analytics-top-post-row__metric-label">Lượt thích</span>
                </div>
              )}

              {sortBy === 'comments' && (
                <div className="analytics-top-post-row__metric" title={`${toNumber(post.comments).toLocaleString('vi-VN')} bình luận`}>
                  <span className="analytics-top-post-row__metric-value">
                    <CommentIcon />
                    <strong>{formatCompactNumber(post.comments)}</strong>
                  </span>
                  <span className="analytics-top-post-row__metric-label">Bình luận</span>
                </div>
              )}

              {sortBy === 'shares' && (
                <div className="analytics-top-post-row__metric" title={`${toNumber(post.shares).toLocaleString('vi-VN')} chia sẻ`}>
                  <span className="analytics-top-post-row__metric-value">
                    <ShareIcon />
                    <strong>{formatCompactNumber(post.shares)}</strong>
                  </span>
                  <span className="analytics-top-post-row__metric-label">Chia sẻ</span>
                </div>
              )}

              <div className="analytics-top-post-row__metric" title={`${toNumber(post.engagement).toLocaleString('vi-VN')} tương tác`}>
                <span className="analytics-top-post-row__metric-value">
                  <EngagementIcon />
                  <strong>{formatCompactNumber(post.engagement)}</strong>
                </span>
                <span className="analytics-top-post-row__metric-label">Tương tác</span>
              </div>
            </div>
          </li>
        ))}
      </ol>

      {isModalOpen && selectedPostInfo && (
        <KpiComparisonModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          postTargetId={selectedPostInfo.id}
          postInfo={{
            title: selectedPostInfo.title,
            fanpageName: selectedPostInfo.fanpageName,
            fanpageAvatar: selectedPostInfo.fanpageAvatar
          }}
        />
      )}

      {totalPages > 1 && (
        <div className="analytics-pagination">
          <button 
            type="button"
            className="analytics-pagination__button"
            disabled={page === 0 || loading}
            onClick={() => onPageChange && onPageChange(page - 1)}
          >
            <ChevronLeftIcon />
            <span>Trang trước</span>
          </button>
          
          <span className="analytics-pagination__info">
            Trang {page + 1} / {totalPages}
          </span>
          
          <button 
            type="button" 
            className="analytics-pagination__button"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => onPageChange && onPageChange(page + 1)}
          >
            <span>Trang sau</span>
            <ChevronRightIcon />
          </button>
        </div>
      )}
    </>
  );
};

export default TopPostsList;
