import React, { useState, useEffect } from 'react';

import PlatformSelector from './PlatformSelector';
import PostEditor       from './PostEditor';
import AiWriter         from './AiWriter';
import PostScheduler    from './PostScheduler';
import PostCalendar     from './PostCalendar';

import { getWorkspaceFanpages } from '../../campaigns/api/workspaceFanpageApi';
import '../styles/CreatePost.css';

/**
 * CreatePostModal – Modal tổng hợp tạo/chỉnh sửa bài viết
 *
 * Luồng:
 *  • "Hoàn tất"  → lưu bài + tạo lịch đăng với fanpage & thời gian đã chọn
 *  • "Lưu nháp"  → chỉ lưu bài (status DRAFT), KHÔNG lên lịch
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onSubmit: (data: object) => void,
 *   onDraft:  (data: object) => void,
 *   workspaceId?: number,
 *   topicId?: number | string,
 *   initialData?: object,
 *   brandTone?: string,
 * }} props
 */
export default function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
  onDraft,
  workspaceId,
  topicId,
  initialData,
  brandTone,
}) {
  // ── Fanpages (thay thế platform ảo) ──────────────────────
  const [fanpages, setFanpages]                     = useState([]);
  const [fanpagesLoading, setFanpagesLoading]       = useState(false);
  const [selectedFanpageIds, setSelectedFanpageIds] = useState([]);

  const handleFanpageToggle = (fanpageId) =>
    setSelectedFanpageIds((prev) =>
      prev.includes(fanpageId)
        ? prev.filter((id) => id !== fanpageId)
        : [...prev, fanpageId]
    );

  // Load fanpages khi modal mở & có workspaceId
  useEffect(() => {
    if (!isOpen || !workspaceId) return;
    setFanpagesLoading(true);
    getWorkspaceFanpages(workspaceId)
      .then((list) => {
        setFanpages(list || []);
        // Mặc định chọn tất cả fanpage
        setSelectedFanpageIds((list || []).map((fp) => fp.fanpageId));
      })
      .catch(() => setFanpages([]))
      .finally(() => setFanpagesLoading(false));
  }, [isOpen, workspaceId]);

  // ── Content & media ──────────────────────────────────────
  const [content, setContent]           = useState('');
  const [hashtags, setHashtags]         = useState([]);
  const [mediaFiles, setMediaFiles]     = useState([]);
  const [aiMediaFiles, setAiMediaFiles] = useState([]);

  const handleMediaAdd    = (files) => setMediaFiles((p) => [...p, ...files]);
  const handleMediaRemove = (idx)   => setMediaFiles((p) => p.filter((_, i) => i !== idx));
  const handleAiMediaChange = (files) => setAiMediaFiles(files);

  const handleAiInsert = (generatedText, aiHashtags) => {
    setContent(generatedText);
    if (aiHashtags && Array.isArray(aiHashtags) && aiHashtags.length > 0) {
      setHashtags((prev) => {
        const combined = [...prev];
        aiHashtags.forEach((tag) => {
          const cleanTag = tag.replace(/^#+/, '');
          if (cleanTag && !combined.includes(cleanTag)) combined.push(cleanTag);
        });
        return combined;
      });
    }
  };

  // ── Scheduler ─────────────────────────────────────────────
  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  };
  const [topic, setTopic]               = useState('');
  const [evergreen, setEvergreen]       = useState(false);
  const [selectedDate, setSelectedDate] = useState(getDefaultDate);
  const [time, setTime]                 = useState('09:00');

  const [submitType, setSubmitType] = useState(null); // 'draft' | 'submit' | null

  // ── Sync initialData khi modal mở ────────────────────────
  useEffect(() => {
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
        setSelectedDate(getDefaultDate());
        setTime('09:00');
      }
      setMediaFiles([]);
      setAiMediaFiles([]);
      setSubmitType(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Build payload ─────────────────────────────────────────
  const buildPayload = (mode) => {
    const year  = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day   = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    return {
      id:           initialData?.id,
      content,
      hashtags,
      mediaFiles:   [...mediaFiles, ...aiMediaFiles],
      scheduleMode: mode === 'submit' ? 'schedule' : 'now',
      scheduledAt:  mode === 'submit' ? `${dateStr}T${time}:00` : null,
      fanpageIds:   mode === 'submit' ? selectedFanpageIds : [],
    };
  };

  // ── Hoàn tất → lưu + lên lịch ────────────────────────────
  const handleSubmit = async () => {
    if (submitType) return;

    if (selectedFanpageIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 Fanpage để đăng bài.');
      return;
    }
    const [h, m] = time.split(':').map(Number);
    const publishDt = new Date(
      selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), h, m
    );
    if (publishDt <= new Date()) {
      alert('Thời gian đăng bài phải là trong tương lai.');
      return;
    }

    setSubmitType('submit');
    try {
      await onSubmit?.(buildPayload('submit'));
      onClose?.();
    } catch (err) {
      console.error('Failed to submit post:', err);
    } finally {
      setSubmitType(null);
    }
  };

  // ── Lưu nháp → KHÔNG lên lịch ────────────────────────────
  const handleDraft = async () => {
    if (submitType) return;
    setSubmitType('draft');
    try {
      await onDraft?.(buildPayload('draft'));
      onClose?.();
    } catch (err) {
      console.error('Failed to draft post:', err);
    } finally {
      setSubmitType(null);
    }
  };

  return (
    <div className="cp-overlay" onClick={onClose}>
      <div
        className="cp-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={initialData ? 'Chỉnh sửa bài viết' : 'Tạo bài viết'}
      >
        {/* ── Header ── */}
        <div className="cp-modal__header">
          <h2 className="cp-modal__title">
            {initialData ? 'Chỉnh sửa & Hoàn thiện bài viết' : 'Tạo bài viết'}
          </h2>
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
            {/* Fanpage chips (thay thế PlatformSelector ảo) */}
            <PlatformSelector
              fanpages={fanpages}
              selectedFanpageIds={selectedFanpageIds}
              onToggle={handleFanpageToggle}
              fanpagesLoading={fanpagesLoading}
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

            {/* AI Writer */}
            <AiWriter
              onInsert={handleAiInsert}
              topicId={topicId}
              initialPrompt={initialData?.content || ''}
              initialTone={initialData?.tone}
              brandTone={brandTone || initialData?.brandTone}
              hashtags={hashtags}
              currentContent={content}
              onAiMediaChange={handleAiMediaChange}
            />
          </div>

          {/* Right – scheduler */}
          <PostScheduler
            topic={topic}
            onTopicChange={setTopic}
            evergreen={evergreen}
            onEvergreenChange={setEvergreen}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            time={time}
            onTimeChange={setTime}
            CalendarComponent={PostCalendar}
          />
        </div>

        {/* ── Footer ── */}
        <div className="cp-modal__footer">
          {/* Lưu nháp – không lên lịch */}
          <button
            className="cp-btn cp-btn--ghost"
            onClick={handleDraft}
            disabled={submitType !== null}
            id="cp-modal-draft"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Lưu bài viết ở trạng thái nháp, chưa lên lịch đăng"
          >
            {submitType === 'draft' ? (
              <>
                <span className="cp-spinner" style={{ borderColor: '#64748b', borderRightColor: 'transparent' }} />
                Đang lưu...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Lưu nháp
              </>
            )}
          </button>

          {/* Hoàn tất – lên lịch đăng */}
          <button
            className="cp-btn cp-btn--primary"
            onClick={handleSubmit}
            disabled={submitType !== null}
            id="cp-modal-submit"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Hoàn tất & lên lịch đăng bài vào fanpage đã chọn"
          >
            {submitType === 'submit' ? (
              <>
                <span className="cp-spinner" />
                Đang lên lịch...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Hoàn tất & Lên lịch
                {selectedFanpageIds.length > 0 && (
                  <span style={{
                    background: 'rgba(255,255,255,0.25)', borderRadius: 10,
                    fontSize: 11, fontWeight: 700, padding: '1px 6px',
                    marginLeft: 2,
                  }}>
                    {selectedFanpageIds.length} fanpage
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
