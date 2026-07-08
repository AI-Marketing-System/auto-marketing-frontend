import React, { useRef, useEffect } from 'react';
import PostCard from './PostCard';
import { formatDayLabel, isSameDay, formatHour, HOURS } from '../utils/scheduleHelpers';

/**
 * Lưới lịch tuần dạng timeline theo giờ
 *
 * @param {{
 *   weekDays: Date[],
 *   posts: Array<{id, dayIdx, hour, minute, title, platform, color}>,
 *   currentTimePercent: number,   // 0–1
 * }} props
 */
export default function CalendarGrid({ weekDays, posts, currentTimePercent }) {
  const gridRef = useRef(null);
  const today = new Date();
  const currentTimeTopPercent = currentTimePercent * 100;

  // Tự động cuộn đến giờ hiện tại khi weekDays thay đổi (đổi tuần / mount)
  useEffect(() => {
    if (gridRef.current) {
      const scrollTarget = currentTimePercent * gridRef.current.scrollHeight - 200;
      gridRef.current.scrollTop = Math.max(0, scrollTarget);
    }
  }, [weekDays]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Lấy danh sách bài đăng cho một ô (dayIdx, hour) */
  function getPostsForCell(dayIdx, hour) {
    return posts.filter((p) => p.dayIdx === dayIdx && p.hour === hour);
  }

  return (
    <div className="sc-calendar-wrapper">
      {/* ── Header Row: tên ngày ── */}
      <div className="sc-calendar-header">
        <div className="sc-time-gutter" />
        {weekDays.map((day, idx) => {
          const { dayName, dateStr } = formatDayLabel(day);
          const isToday = isSameDay(day, today);
          return (
            <div
              key={idx}
              className={`sc-day-header${isToday ? ' sc-day-header--today' : ''}`}
            >
              <span className="sc-day-header__name">{dayName}</span>
              <span className="sc-day-header__date">{dateStr}</span>
            </div>
          );
        })}
      </div>

      {/* ── Scrollable Body ── */}
      <div className="sc-calendar-body" ref={gridRef}>
        {/* Đường thời gian hiện tại */}
        <div
          className="sc-current-time-line"
          style={{ top: `${currentTimeTopPercent}%` }}
        >
          <div className="sc-current-time-line__dot" />
          <div className="sc-current-time-line__label">
            {String(new Date().getHours()).padStart(2, '0')}:
            {String(new Date().getMinutes()).padStart(2, '0')}
          </div>
        </div>

        {/* Hàng theo giờ */}
        {HOURS.map((hour) => (
          <div key={hour} className="sc-hour-row">
            {/* Nhãn giờ */}
            <div className="sc-time-gutter">
              <span className="sc-time-label">{formatHour(hour)}</span>
            </div>

            {/* Các ô ngày */}
            {weekDays.map((day, dayIdx) => {
              const cellPosts = getPostsForCell(dayIdx, hour);
              const isToday = isSameDay(day, today);
              return (
                <div
                  key={dayIdx}
                  className={`sc-cell${isToday ? ' sc-cell--today' : ''}`}
                >
                  {cellPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
