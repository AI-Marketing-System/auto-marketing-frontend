import React, { useRef, useEffect, useState } from 'react';
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
export default function CalendarGrid({ weekDays, posts, currentTimePercent, onCellClick, onCardClick }) {
  const gridRef = useRef(null);
  const today = new Date();
  const [lineTop, setLineTop] = useState(0);

  // Tự động cuộn đến giờ hiện tại khi weekDays thay đổi (đổi tuần / mount)
  useEffect(() => {
    if (gridRef.current) {
      const scrollTarget = currentTimePercent * gridRef.current.scrollHeight - 200;
      gridRef.current.scrollTop = Math.max(0, scrollTarget);
    }
  }, [weekDays]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tính toán vị trí đường thời gian dựa trên vị trí thực tế của các hàng trong DOM
  useEffect(() => {
    const updateLinePosition = () => {
      if (!gridRef.current) return;
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();

      const rows = gridRef.current.querySelectorAll('.sc-hour-row');
      const activeRow = rows[hour];
      if (activeRow) {
        const rowTop = activeRow.offsetTop;
        const rowHeight = activeRow.offsetHeight;
        const computedTop = rowTop + (minute / 60) * rowHeight;
        setLineTop(computedTop);
      }
    };

    updateLinePosition();
    // Đợi layout DOM ổn định sau render để lấy offset chính xác
    const timeoutId = setTimeout(updateLinePosition, 50);
    return () => clearTimeout(timeoutId);
  }, [posts, weekDays, currentTimePercent]);

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
          style={{ top: `${lineTop}px` }}
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
                  onClick={() => onCellClick?.(day, hour)}
                  style={{ cursor: 'pointer' }}
                >
                  {cellPosts.map((post) => (
                    <PostCard key={post.id} post={post} onCardClick={onCardClick} />
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
