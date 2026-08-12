import React, { useState, useEffect } from 'react';
import { getWorkspaceFanpages } from '../../campaigns/api/workspaceFanpageApi';
import { scheduleApi } from '../api/scheduleApi';
import { API_BASE_URL } from '../../../config/env';
import '../styles/SelectPostToScheduleModal.css';

export default function SelectPostToScheduleModal({
  isOpen,
  onClose,
  workspaceId,
  campaignId,
  selectedDate,
  selectedHour,
  onSuccess,
}) {
  const [availablePosts, setAvailablePosts] = useState([]);
  const [fanpages, setFanpages] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingFanpages, setLoadingFanpages] = useState(false);

  const [selectedPostId, setSelectedPostId] = useState('');
  const [selectedFanpageIds, setSelectedFanpageIds] = useState([]);
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch available posts & fanpages when modal is opened
  useEffect(() => {
    if (!isOpen || !workspaceId) return;

    async function loadData() {
      setLoadingPosts(true);
      setLoadingFanpages(true);
      setErrorMessage('');
      try {
        // Nếu có campaign filter thì lấy bài nháp theo campaign đó, ngược lại lấy toàn workspace
        let postsRes;
        if (campaignId) {
          postsRes = await scheduleApi.listAvailablePostsByCampaign(API_BASE_URL, campaignId);
        } else {
          postsRes = await scheduleApi.listAvailablePosts(API_BASE_URL, workspaceId);
        }
        const postsList = Array.isArray(postsRes) ? postsRes : postsRes?.data || [];
        setAvailablePosts(postsList);
        if (postsList.length > 0) {
          setSelectedPostId(String(postsList[0].id));
        }

        const fanpagesList = await getWorkspaceFanpages(workspaceId);
        setFanpages(fanpagesList);
        setSelectedFanpageIds(fanpagesList.map((fp) => fp.fanpageId)); // Select all by default
      } catch (err) {
        console.error('Failed to load data for scheduling:', err);
        setErrorMessage('Không thể tải danh sách bài viết hoặc fanpage. Vui lòng thử lại.');
      } finally {
        setLoadingPosts(false);
        setLoadingFanpages(false);
      }
    }

    loadData();
  }, [isOpen, workspaceId, campaignId]);

  // Set initial time when selectedHour changes
  useEffect(() => {
    if (selectedHour !== null && selectedHour !== undefined && isOpen) {
      const hourStr = String(selectedHour).padStart(2, '0');
      setSelectedTime(`${hourStr}:00`);
    }
  }, [selectedHour, isOpen]);

  if (!isOpen) return null;

  // Format time label for display
  const dayStr = selectedDate ? `${String(selectedDate.getDate()).padStart(2, '0')}/${String(selectedDate.getMonth() + 1).padStart(2, '0')}/${selectedDate.getFullYear()}` : '';

  const handleToggleFanpage = (fanpageId) => {
    setSelectedFanpageIds((prev) =>
      prev.includes(fanpageId)
        ? prev.filter((id) => id !== fanpageId)
        : [...prev, fanpageId]
    );
  };

  const handleSelectAllFanpages = () => {
    if (selectedFanpageIds.length === fanpages.length) {
      setSelectedFanpageIds([]);
    } else {
      setSelectedFanpageIds(fanpages.map((fp) => fp.fanpageId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPostId) {
      setErrorMessage('Vui lòng chọn bài viết để lên lịch.');
      return;
    }
    if (selectedFanpageIds.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một Fanpage để đăng bài.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      // Build publishTime (LocalDateTime naive format in Vietnam timezone)
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const [hourStr, minuteStr] = selectedTime.split(':');
      // Format: YYYY-MM-DDTHH:mm:ss
      const publishTime = `${year}-${month}-${day}T${hourStr}:${minuteStr}:00`;

      const payload = {
        postId: Number(selectedPostId),
        publishTime: publishTime,
        fanpageIds: selectedFanpageIds,
      };

      await scheduleApi.createSchedule(API_BASE_URL, payload);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to create schedule:', err);
      setErrorMessage(err.message || 'Không thể tạo lịch đăng. Vui lòng kiểm tra lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sps-overlay" onClick={onClose}>
      <div className="sps-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sps-modal__header">
          <h2 className="sps-modal__title">Lên lịch bài viết có sẵn</h2>
          <button className="sps-modal__close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="sps-modal__body">
          <div className="sps-datetime-picker-row">
            <div className="sps-time-info">
              <div className="sps-time-info__icon">📅</div>
              <div className="sps-time-info__text">
                Ngày đăng: <strong>{dayStr}</strong>
              </div>
            </div>
            <div className="sps-time-picker-container">
              <label className="sps-label" htmlFor="sps-time-input">Giờ đăng đăng cụ thể</label>
              <input
                id="sps-time-input"
                type="time"
                className="sps-time-input"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>
          </div>

          {errorMessage && <div className="sps-error-alert">{errorMessage}</div>}

          {/* 1. Select Post */}
          <div className="sps-form-group">
            <label className="sps-label" htmlFor="sps-post-select">Chọn bài viết có sẵn</label>
            {loadingPosts ? (
              <div className="sps-loading">Đang tải bài viết...</div>
            ) : availablePosts.length === 0 ? (
              <div className="sps-empty-state">
                Không tìm thấy bài viết nháp/chờ duyệt nào trong Workspace này.
              </div>
            ) : (
              <select
                id="sps-post-select"
                className="sps-select"
                value={selectedPostId}
                onChange={(e) => setSelectedPostId(e.target.value)}
              >
                {availablePosts.map((post) => (
                  <option key={post.id} value={post.id}>
                    [{post.status}] {post.title || post.content.slice(0, 50) + '...'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Preview selected post content */}
          {selectedPostId && availablePosts.length > 0 && (
            <div className="sps-post-preview">
              <div className="sps-preview-title">Nội dung bài viết:</div>
              <div className="sps-preview-content">
                {availablePosts.find(p => String(p.id) === selectedPostId)?.content}
              </div>
            </div>
          )}

          {/* 2. Choose Fanpages */}
          <div className="sps-form-group">
            <div className="sps-fanpages-header">
              <label className="sps-label">Đăng lên Fanpage</label>
              {fanpages.length > 0 && (
                <button
                  type="button"
                  className="sps-select-all"
                  onClick={handleSelectAllFanpages}
                >
                  {selectedFanpageIds.length === fanpages.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
              )}
            </div>

            {loadingFanpages ? (
              <div className="sps-loading">Đang tải fanpage...</div>
            ) : fanpages.length === 0 ? (
              <div className="sps-empty-state">
                Workspace chưa liên kết Fanpage nào. Vui lòng cấu hình tài khoản MXH.
              </div>
            ) : (
              <div className="sps-fanpages-list">
                {fanpages.map((fp) => {
                  const isChecked = selectedFanpageIds.includes(fp.fanpageId);
                  return (
                    <div
                      key={fp.id}
                      className={`sps-fanpage-item ${isChecked ? 'active' : ''}`}
                      onClick={() => handleToggleFanpage(fp.fanpageId)}
                    >
                      <div className="sps-fanpage-avatar">
                        {fp.fanpageAvatarUrl ? (
                          <img src={fp.fanpageAvatarUrl} alt={fp.fanpageName} />
                        ) : (
                          <div className="sps-avatar-placeholder">
                            {fp.fanpageName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="sps-platform-badge">f</span>
                      </div>
                      <div className="sps-fanpage-info">
                        <div className="sps-fanpage-name">{fp.fanpageName}</div>
                      </div>
                      <div className="sps-fanpage-checkbox">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent onClick for easier tap target
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="sps-modal__footer">
            <button
              type="button"
              className="sps-btn sps-btn--ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="sps-btn sps-btn--primary"
              disabled={submitting || availablePosts.length === 0}
            >
              {submitting ? 'Đang lưu...' : 'Lên lịch ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
