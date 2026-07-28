import React, { useState } from 'react';

import PlatformSelector from './PlatformSelector';
import PostEditor       from './PostEditor';
import AiWriter         from './AiWriter';
import PostScheduler    from './PostScheduler';
import PostCalendar     from './PostCalendar';

import '../styles/CreatePost.css';

/**
 * CreatePostModal – Modal tổng hợp tạo bài viết
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onSubmit: (data: object) => void,
 *   onDraft: (data: object) => void,
 * }} props
 */
export default function CreatePostModal({ isOpen, onClose, onSubmit, onDraft, topicId }) {
  // ── Platform ──────────────────────────────────────────
  const [selectedPlatforms, setSelectedPlatforms] = useState(['Facebook']);

  const togglePlatform = (name) =>
    setSelectedPlatforms((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );

  // ── Content ───────────────────────────────────────────
  const [content, setContent]       = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);

  const handleMediaAdd    = (files) => setMediaFiles((p) => [...p, ...files]);
  const handleMediaRemove = (idx)   => setMediaFiles((p) => p.filter((_, i) => i !== idx));
  const handleAiInsert    = (text)  => setContent((c) => (c ? c + '\n\n' + text : text));

  // ── Scheduler ─────────────────────────────────────────
  const [topic, setTopic]               = useState('');
  const [evergreen, setEvergreen]       = useState(false);
  const [scheduleMode, setScheduleMode] = useState('now');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [time, setTime]                 = useState('09:00');

  if (!isOpen) return null;

  // ── Submit ────────────────────────────────────────────
  const buildPayload = () => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    return {
      platforms: selectedPlatforms,
      content,
      media: mediaFiles.map((f) => f.name),
      topic,
      evergreen,
      scheduleMode,
      scheduledAt: scheduleMode === 'schedule'
        ? `${dateStr} ${time}`
        : null,
    };
  };

  const handleSubmit = () => {
    onSubmit?.(buildPayload());
    onClose?.();
  };

  const handleDraft = () => {
    onDraft?.(buildPayload());
    onClose?.();
  };

  return (
    <div className="cp-overlay" onClick={onClose}>
      <div
        className="cp-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Tạo bài viết"
      >
        {/* ── Header ── */}
        <div className="cp-modal__header">
          <h2 className="cp-modal__title">Tạo bài viết</h2>
          <button
            className="cp-modal__close"
            onClick={onClose}
            id="cp-modal-close"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div className="cp-modal__body">
          {/* Left – editor */}
          <div className="cp-left">
            {/* Platform chips */}
            <PlatformSelector
              selected={selectedPlatforms}
              onToggle={togglePlatform}
            />

            {/* Content editor */}
            <PostEditor
              content={content}
              onContentChange={setContent}
              mediaFiles={mediaFiles}
              onMediaAdd={handleMediaAdd}
              onMediaRemove={handleMediaRemove}
            />

            {/* AI Writer */}
            <AiWriter onInsert={handleAiInsert} topicId={topicId} />
          </div>

          {/* Right – scheduler */}
          <PostScheduler
            topic={topic}
            onTopicChange={setTopic}
            evergreen={evergreen}
            onEvergreenChange={setEvergreen}
            scheduleMode={scheduleMode}
            onScheduleModeChange={setScheduleMode}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            time={time}
            onTimeChange={setTime}
            CalendarComponent={PostCalendar}
          />
        </div>

        {/* ── Footer ── */}
        <div className="cp-modal__footer">
          <button
            className="cp-btn cp-btn--ghost"
            onClick={handleDraft}
            id="cp-modal-draft"
          >
            Lưu nháp
          </button>
          <button
            className="cp-btn cp-btn--primary"
            onClick={handleSubmit}
            id="cp-modal-submit"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
}
