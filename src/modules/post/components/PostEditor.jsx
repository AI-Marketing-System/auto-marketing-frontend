import React, { useRef } from 'react';

/**
 * PostEditor – Vùng soạn thảo nội dung bài viết
 *
 * @param {{
 *   content: string,
 *   onContentChange: (val: string) => void,
 *   mediaFiles: File[],
 *   onMediaAdd: (files: File[]) => void,
 *   onMediaRemove: (index: number) => void,
 * }} props
 */
export default function PostEditor({
  content = '',
  onContentChange,
  hashtags = [],
  onHashtagsChange,
  mediaFiles = [],
  onMediaAdd,
  onMediaRemove,
}) {
  const fileInputRef = useRef(null);
  const [tagInput, setTagInput] = React.useState('');

  const handleAddHashtag = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      let raw = tagInput.trim().replace(/^#+/, '');
      if (raw && !hashtags.includes(raw)) {
        onHashtagsChange?.([...hashtags, raw]);
      }
      setTagInput('');
    }
  };

  const handleRemoveHashtag = (index) => {
    onHashtagsChange?.(hashtags.filter((_, i) => i !== index));
  };

  // ── Format helpers ──────────────────────────────────────
  const wrapSelection = (before, after = before) => {
    const el = document.getElementById('cp-post-textarea');
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const sel = content.slice(start, end);
    const next = content.slice(0, start) + before + sel + after + content.slice(end);
    onContentChange?.(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleBold = () => wrapSelection('**');
  const handleItalic = () => wrapSelection('_');
  const handleStrike = () => wrapSelection('~~');
  const handleEmoji = () => onContentChange?.((content || '') + ' 😊');

  // ── File pick ───────────────────────────────────────────
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) onMediaAdd?.(files);
    e.target.value = '';
  };

  // ── Drag & drop ─────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onMediaAdd?.(files);
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <div
      className="cp-editor-wrapper"
      style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
    >
      {/* Text editor */}
      <div className="cp-editor">
        <textarea
          id="cp-post-textarea"
          className="cp-editor__area"
          placeholder="Viết nội dung cho bài đăng này ..."
          value={content}
          onChange={(e) => onContentChange?.(e.target.value)}
        />
        <div className="cp-editor__toolbar">
          <button className="cp-toolbar-btn" onClick={handleBold} title="Bold" id="cp-tb-bold">
            {' '}
            <strong>B</strong>
          </button>
          <button
            className="cp-toolbar-btn cp-toolbar-btn--italic"
            onClick={handleItalic}
            title="Italic"
            id="cp-tb-italic"
          >
            {' '}
            I
          </button>
          <button
            className="cp-toolbar-btn cp-toolbar-btn--strike"
            onClick={handleStrike}
            title="Strikethrough"
            id="cp-tb-strike"
          >
            S
          </button>
          <div className="cp-toolbar-divider" />
          <button className="cp-toolbar-btn" onClick={handleEmoji} title="Emoji" id="cp-tb-emoji">
            {' '}
            😊
          </button>
        </div>
      </div>

      {/* Hashtag Manager */}
      <div className="cp-hashtags-container">
        <div className="cp-hashtags-header">
          <span>🏷️ Hashtags bài viết</span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            (Nhấn Enter hoặc gõ phẩy để thêm)
          </span>
        </div>
        <div className="cp-hashtags-list">
          {hashtags.map((tag, idx) => (
            <span key={idx} className="cp-hashtag-pill">
              #{tag.replace(/^#+/, '')}
              <button
                type="button"
                className="cp-hashtag-remove"
                onClick={() => handleRemoveHashtag(idx)}
                title="Xoá hashtag"
              >
                ✕
              </button>
            </span>
          ))}
          <input
            type="text"
            className="cp-hashtag-input"
            placeholder="+ Thêm hashtag"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddHashtag}
            onBlur={() => {
              let raw = tagInput.trim().replace(/^#+/, '');
              if (raw && !hashtags.includes(raw)) {
                onHashtagsChange?.([...hashtags, raw]);
                setTagInput('');
              }
            }}
          />
        </div>
      </div>

      {/* Media / link buttons */}
      <div className="cp-media-bar">
        <button
          className="cp-media-btn"
          id="cp-media-image-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          Hình ảnh / Video
        </button>
        <button
          className="cp-media-btn"
          id="cp-media-link-btn"
          onClick={() => {
            const url = prompt('Nhập URL liên kết:');
            if (url) onContentChange?.((content || '') + ` [link](${url})`);
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          </svg>
          Liên kết
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {/* Drop zone */}
      <div
        className="cp-dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        id="cp-dropzone"
      >
        <div className="cp-dropzone__emoji">🖼️</div>
        Kéo thả hoặc nhấp vào đây để tải lên
      </div>

      {/* Preview thumbnails */}
      {mediaFiles.length > 0 && (
        <div className="cp-media-preview">
          {mediaFiles.map((file, idx) => {
            const isFileObj = file instanceof File;
            const isVideo = isFileObj
              ? (file.type && file.type.startsWith('video/'))
              : (file.type === 'VIDEO' || (file.url && file.url.match(/\.(mp4|webm|ogg|mov)$/i)));
            const src = isFileObj ? URL.createObjectURL(file) : file.url;
            const name = isFileObj ? file.name : 'media';

            return (
              <div key={idx} className="cp-media-thumb">
                {isVideo ? (
                  <video src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                ) : (
                  <img src={src} alt={name} />
                )}
                {isVideo && (
                  <span style={{
                    position: 'absolute',
                    bottom: '2px',
                    left: '2px',
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    fontSize: '9px',
                    padding: '1px 4px',
                    borderRadius: '3px'
                  }}>🎥 Video</span>
                )}
                <button
                  className="cp-media-thumb__remove"
                  onClick={() => onMediaRemove?.(idx)}
                  title="Xoá"
                  id={`cp-remove-media-${idx}`}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
