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
export default function CreatePostModal({ isOpen, onClose, onSubmit, onDraft, topicId, initialData, brandTone }) {
  // ── Platform ──────────────────────────────────────────
  const [selectedPlatforms, setSelectedPlatforms] = useState(['Facebook']);

  const togglePlatform = (name) =>
    setSelectedPlatforms((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );

  // ── Content & Hashtags ───────────────────────────────
  const [content, setContent]       = useState('');
  const [hashtags, setHashtags]     = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);

  const handleMediaAdd    = (files) => setMediaFiles((p) => [...p, ...files]);
  const handleMediaRemove = (idx)   => setMediaFiles((p) => p.filter((_, i) => i !== idx));

  const handleAiInsert = (generatedText, aiHashtags) => {
    setContent(generatedText);
    if (aiHashtags && Array.isArray(aiHashtags) && aiHashtags.length > 0) {
      setHashtags((prev) => {
        const combined = [...prev];
        aiHashtags.forEach((tag) => {
          const cleanTag = tag.replace(/^#+/, '');
          if (cleanTag && !combined.includes(cleanTag)) {
            combined.push(cleanTag);
          }
        });
        return combined;
      });
    }
  };

  // ── Scheduler ─────────────────────────────────────────
  const [topic, setTopic]               = useState('');
  const [evergreen, setEvergreen]       = useState(false);
  const [scheduleMode, setScheduleMode] = useState('now');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [time, setTime]                 = useState('09:00');

  const [submitting, setSubmitting] = useState(false);

  // Sync initialData when modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setContent(initialData.content || initialData.contentBrief || '');
        let initTags = [];
        if (initialData.hashtags && Array.isArray(initialData.hashtags)) {
          initTags = initialData.hashtags.map((t) => t.replace(/^#+/, ''));
        } else if (typeof initialData.hashtags === 'string' && initialData.hashtags.trim()) {
          initTags = initialData.hashtags.split(',').map((t) => t.trim().replace(/^#+/, ''));
        }
        setHashtags(initTags);
      } else {
        setContent('');
        setHashtags([]);
      }
      setMediaFiles([]);
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Submit ────────────────────────────────────────────
  const buildPayload = () => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    return {
      id: initialData?.id,
      platforms: selectedPlatforms,
      content,
      hashtags,
      mediaFiles,
      topic,
      evergreen,
      scheduleMode,
      scheduledAt: scheduleMode === 'schedule'
        ? `${dateStr} ${time}`
        : null,
    };
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit?.(buildPayload());
      onClose?.();
    } catch (err) {
      console.error('Failed to submit post:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDraft = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onDraft?.(buildPayload());
      onClose?.();
    } catch (err) {
      console.error('Failed to draft post:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cp-overlay" onClick={onClose}>
      <div
        className="cp-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={initialData ? "Chỉnh sửa bài viết" : "Tạo bài viết"}
      >
        {/* ── Header ── */}
        <div className="cp-modal__header">
          <h2 className="cp-modal__title">{initialData ? "Chỉnh sửa & Hoàn thiện bài viết" : "Tạo bài viết"}</h2>
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
              hashtags={hashtags}
              onHashtagsChange={setHashtags}
              mediaFiles={mediaFiles}
              onMediaAdd={handleMediaAdd}
              onMediaRemove={handleMediaRemove}
            />

            {/* AI Writer prefilled with brief, tone & brand tone */}
            <AiWriter
              onInsert={handleAiInsert}
              topicId={topicId}
              initialPrompt={initialData?.content || ''}
              initialTone={initialData?.tone}
              brandTone={brandTone || initialData?.brandTone}
              selectedPlatforms={selectedPlatforms}
              hashtags={hashtags}
            />
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
            disabled={submitting}
            id="cp-modal-draft"
          >
            {submitting ? 'Đang xử lý...' : 'Lưu nháp'}
          </button>
          <button
            className="cp-btn cp-btn--primary"
            onClick={handleSubmit}
            disabled={submitting}
            id="cp-modal-submit"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {submitting ? (
              <>
                <span className="cp-spinner" />
                Đang lưu & upload media...
              </>
            ) : (
              'Hoàn tất'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
