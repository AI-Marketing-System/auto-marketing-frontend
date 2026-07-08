import React from 'react';

/**
 * Thanh điều hướng tuần: nút lùi/tiến tuần, nút Hôm nay, nhãn khoảng tuần
 *
 * @param {{
 *   weekDays: Date[],
 *   onPrevWeek: () => void,
 *   onNextWeek: () => void,
 *   onToday: () => void,
 * }} props
 */
export default function WeekNavigation({ weekDays, onPrevWeek, onNextWeek, onToday }) {
  const hasWeek = weekDays.length > 0;

  const rangeLabel = hasWeek
    ? `${weekDays[0].getDate()}/${String(weekDays[0].getMonth() + 1).padStart(2, '0')}` +
      ` – ` +
      `${weekDays[6].getDate()}/${String(weekDays[6].getMonth() + 1).padStart(2, '0')}/${weekDays[6].getFullYear()}`
    : '';

  return (
    <div className="sc-week-nav">
      {/* Lùi tuần */}
      <button className="sc-week-nav__btn" onClick={onPrevWeek} id="btn-prev-week" title="Tuần trước">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Hôm nay */}
      <button className="sc-week-nav__today" onClick={onToday} id="btn-today">
        Hôm nay
      </button>

      {/* Nhãn khoảng tuần */}
      <span className="sc-week-nav__label">{rangeLabel}</span>

      {/* Tiến tuần */}
      <button className="sc-week-nav__btn" onClick={onNextWeek} id="btn-next-week" title="Tuần sau">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
