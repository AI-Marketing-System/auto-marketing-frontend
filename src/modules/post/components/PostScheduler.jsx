import React from 'react';

/**
 * PostScheduler – Phần phải của modal: Chủ đề, Evergreen, ngày & giờ đăng
 *
 * @param {{
 *   topic: string,
 *   onTopicChange: (v: string) => void,
 *   evergreen: boolean,
 *   onEvergreenChange: (v: boolean) => void,
 *   selectedDate: Date | null,
 *   onDateChange: (d: Date) => void,
 *   time: string,
 *   onTimeChange: (v: string) => void,
 *   CalendarComponent: React.ElementType,
 * }} props
 */
export default function PostScheduler({
  topic = '',
  onTopicChange,
  evergreen = false,
  onEvergreenChange,
  selectedDate,
  onDateChange,
  time = '09:00',
  onTimeChange,
  CalendarComponent,
}) {
  return (
    <div className="cp-right">
      {/* ── Quản lý bài viết title ── */}
      <div className="cp-section-title" style={{ marginBottom: 2 }}>Quản lý bài viết</div>

      {/* ── Topic ── */}
      <div className="cp-section" style={{ gap: 5, marginTop: 0 }}>
        <div className="cp-section-title" style={{ marginBottom: 0 }}>Chủ đề bài viết</div>
        <input
          id="cp-topic-input"
          className="cp-topic-input"
          placeholder="+ Thêm chủ đề"
          value={topic}
          onChange={(e) => onTopicChange?.(e.target.value)}
        />
      </div>

      <hr className="cp-divider" />

      {/* ── Evergreen Content ── */}
      <div className="cp-section">
        <div className="cp-evergreen">
          <div className="cp-evergreen__row">
            <div className="cp-evergreen__label">
              Evergreen Content
              <span title="Bài đăng nhiều lần – khi chủ đề trên không còn tồn tại bài mới mẻ, MarqQuo Slot sẽ tự động sắp xếp lại bài viết mới nhau">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </span>
            </div>
            <label className="cp-toggle" id="cp-evergreen-toggle">
              <input
                type="checkbox"
                checked={evergreen}
                onChange={(e) => onEvergreenChange?.(e.target.checked)}
              />
              <span className="cp-toggle__track" />
            </label>
          </div>
          <div className="cp-evergreen__hint">
            Bài đăng nhiều lần — khi chủ đề trên không còn tồn tại bài viết mới
            mẻ, MarqQuo Slot sẽ tự động sắp xếp lại bài viết mới nhau.
          </div>
        </div>
      </div>

      <hr className="cp-divider" />

      {/* ── Schedule mode ── */}
      <div className="cp-section">
        <div className="cp-method-section-row">
          <div className="cp-section-title" style={{ marginBottom: 0 }}>Cách đăng bài</div>
          <button className="cp-method-edit-btn" id="cp-method-edit">Đổi</button>
        </div>

        <div
          className="cp-method-option cp-method-option--active"
          id="cp-method-now"
        >
          <div className="cp-method-radio" />
          <div className="cp-method-text">
            <strong>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4, verticalAlign: 'middle' }}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Đăng vào ngày giờ
            </strong>
            <span>Chọn ngày giờ cụ thể để đăng bài viết</span>
          </div>
        </div>
      </div>

      <hr className="cp-divider" />

      {/* ── Date ── */}
      <div className="cp-section">
        <div className="cp-section-title">Ngày đăng</div>
        {CalendarComponent && (
          <CalendarComponent selected={selectedDate} onChange={onDateChange} />
        )}
      </div>

      <hr className="cp-divider" />

      {/* ── Time ── */}
      <div className="cp-section">
        <div className="cp-section-title">Giờ đăng</div>
        <div className="cp-time-picker">
          <input
            id="cp-time-input"
            className="cp-time-input-native"
            type="time"
            value={time}
            onChange={(e) => onTimeChange?.(e.target.value)}
          />
          <div className="cp-time-hint">(GMT+07:00) Hanoi</div>
        </div>
      </div>

      {/* ── Preview lịch đăng ── */}
      {selectedDate && time && (
        <div style={{
          padding: '10px 12px',
          background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)',
          borderRadius: 8, border: '1px solid #c7d2fe',
          fontSize: 12, color: '#4338ca', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {(() => {
            try {
              const [h, m] = time.split(':').map(Number);
              const dt = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), h, m);
              return `Sẽ đăng lúc: ${dt.toLocaleString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
            } catch { return `Sẽ đăng lúc: ${time}`; }
          })()}
        </div>
      )}
    </div>
  );
}
