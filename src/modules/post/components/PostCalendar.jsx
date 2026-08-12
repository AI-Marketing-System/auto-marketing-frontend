import React, { useState, useMemo } from 'react';

/**
 * PostCalendar – Mini calendar để chọn ngày đăng bài
 *
 * @param {{
 *   selected: Date | null,
 *   onChange: (date: Date) => void,
 * }} props
 */

const MONTHS_VI = [
  'Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12',
];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function isSameDay(a, b) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}

export default function PostCalendar({ selected, onChange }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(selected || today);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Generate year options ±5 years
  const yearOptions = useMemo(() =>
    Array.from({ length: 11 }, (_, i) => today.getFullYear() - 5 + i),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth     = new Date(year, month + 1, 0).getDate();
  const daysInPrev      = new Date(year, month, 0).getDate();

  // Build grid cells
  const cells = [];
  // prev month filler
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, faded: true, date: new Date(year, month - 1, daysInPrev - i) });
  }
  // current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, faded: false, date: new Date(year, month, d) });
  }
  // next month filler
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, faded: true, date: new Date(year, month + 1, d) });
  }

  const goMonth = (delta) => {
    setViewDate((v) => {
      const nd = new Date(v);
      nd.setMonth(nd.getMonth() + delta);
      return nd;
    });
  };

  return (
    <div className="cp-calendar">
      {/* Header */}
      <div className="cp-calendar__header">
        <button className="cp-calendar__nav" onClick={() => goMonth(-1)} id="cp-cal-prev">‹</button>

        <div className="cp-calendar__selects">
          <select
            className="cp-calendar__select"
            value={month}
            onChange={(e) => setViewDate(new Date(year, +e.target.value, 1))}
            id="cp-cal-month-sel"
          >
            {MONTHS_VI.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select
            className="cp-calendar__select"
            value={year}
            onChange={(e) => setViewDate(new Date(+e.target.value, month, 1))}
            id="cp-cal-year-sel"
          >
            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <button className="cp-calendar__nav" onClick={() => goMonth(1)} id="cp-cal-next">›</button>
      </div>

      {/* Grid */}
      <div className="cp-calendar__grid">
        <div className="cp-calendar__weekdays">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="cp-calendar__weekday">{wd}</div>
          ))}
        </div>

        <div className="cp-calendar__days">
          {cells.map(({ day, faded, date }, idx) => {
            const isSelected = isSameDay(date, selected);
            const isToday    = isSameDay(date, today);
            const isPast     = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

            let cls = 'cp-calendar__day';
            if (faded)      cls += ' cp-calendar__day--faded';
            if (isToday)    cls += ' cp-calendar__day--today';
            if (isSelected) cls += ' cp-calendar__day--selected';
            if (isPast && !isSelected) cls += ' cp-calendar__day--disabled';

            return (
              <button
                key={idx}
                className={cls}
                onClick={() => !isPast && onChange?.(date)}
                id={`cp-cal-day-${date.toISOString().slice(0, 10)}`}
                disabled={isPast && !isSelected}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
