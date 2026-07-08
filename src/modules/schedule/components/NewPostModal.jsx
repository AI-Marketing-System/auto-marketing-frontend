import React, { useState } from 'react';

/**
 * Modal tạo bài viết mới
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onSubmit: (data: object) => void,
 * }} props
 */
export default function NewPostModal({ isOpen, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('Facebook');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  function handleSubmit() {
    onSubmit?.({ title, platform, date, time, content });
    // Reset form
    setTitle('');
    setPlatform('Facebook');
    setDate('');
    setTime('');
    setContent('');
    onClose();
  }

  return (
    <div className="sc-modal-overlay" onClick={onClose}>
      <div className="sc-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sc-modal__header">
          <h3>Tạo bài viết mới</h3>
          <button className="sc-modal__close" onClick={onClose} id="modal-close-btn">✕</button>
        </div>

        {/* Body */}
        <div className="sc-modal__body">
          {/* Tiêu đề */}
          <div className="sc-form-group">
            <label htmlFor="post-title">Tiêu đề bài viết</label>
            <input
              id="post-title"
              type="text"
              className="sc-form-input"
              placeholder="Nhập tiêu đề..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Nền tảng */}
          <div className="sc-form-group">
            <label htmlFor="post-platform">Nền tảng</label>
            <select
              id="post-platform"
              className="sc-form-select"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
            </select>
          </div>

          {/* Ngày & Giờ */}
          <div className="sc-form-row">
            <div className="sc-form-group">
              <label htmlFor="post-date">Ngày đăng</label>
              <input
                id="post-date"
                type="date"
                className="sc-form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="sc-form-group">
              <label htmlFor="post-time">Giờ đăng</label>
              <input
                id="post-time"
                type="time"
                className="sc-form-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Nội dung */}
          <div className="sc-form-group">
            <label htmlFor="post-content">Nội dung</label>
            <textarea
              id="post-content"
              className="sc-form-textarea"
              placeholder="Nhập nội dung bài viết..."
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sc-modal__footer">
          <button className="sc-btn sc-btn--ghost" onClick={onClose} id="modal-cancel-btn">
            Hủy
          </button>
          <button className="sc-btn sc-btn--new" onClick={handleSubmit} id="modal-submit-btn">
            Tạo bài viết
          </button>
        </div>
      </div>
    </div>
  );
}
