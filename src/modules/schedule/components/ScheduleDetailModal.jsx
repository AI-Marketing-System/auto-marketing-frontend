import React, { useState, useEffect, useCallback } from 'react';
import { scheduleApi } from '../api/scheduleApi';
import { getWorkspaceFanpages } from '../../campaigns/api/workspaceFanpageApi';
import { API_BASE_URL } from '../../../config/env';
import '../styles/ScheduleDetailModal.css';

/** Badge màu theo trạng thái target */
function StatusBadge({ status }) {
  const map = {
    WAITING:   { label: 'Đang chờ',  cls: 'waiting' },
    RUNNING:   { label: 'Đang đăng', cls: 'running' },
    SUCCESS:   { label: 'Thành công', cls: 'success' },
    FAILED:    { label: 'Thất bại',   cls: 'failed' },
    CANCELLED: { label: 'Đã hủy',    cls: 'cancelled' },
  };
  const cfg = map[status] || { label: status, cls: 'unknown' };
  return <span className={`sdm-badge sdm-badge--${cfg.cls}`}>{cfg.label}</span>;
}

/** Lấy 1-2 chữ cái đầu từ tên fanpage */
function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

/** Avatar fanpage: hiển thị ảnh thật hoặc initials + Facebook badge */
function FanpageAvatar({ name, avatarUrl }) {
  return (
    <div className="sdm-fp-avatar-wrap">
      <div className="sdm-fp-avatar">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="sdm-fp-avatar__img"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <span
          className="sdm-fp-avatar__initial"
          style={{ display: avatarUrl ? 'none' : 'flex' }}
        >
          {getInitials(name)}
        </span>
      </div>
      <div className="sdm-fp-avatar__badge">f</div>
    </div>
  );
}

/**
 * ScheduleDetailModal – hiển thị chi tiết lịch đăng, cho phép:
 *  - US-35: chỉnh sửa thời gian đăng (chỉ khi WAITING)
 *  - US-38: xem trạng thái đăng bài trên từng fanpage
 *  - US-37: thêm fanpage vào lịch (chỉ khi WAITING)
 *  - US-36: hủy lịch (chỉ khi WAITING)
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - schedule: { id, postTitle, postContent, publishTime, status }
 *  - workspaceId: number
 *  - onSuccess: () => void  – gọi lại để refresh lịch
 */
export default function ScheduleDetailModal({
  isOpen,
  onClose,
  schedule,
  workspaceId,
  onSuccess,
}) {
  const [targets, setTargets]             = useState([]);
  const [allFanpages, setAllFanpages]     = useState([]);
  const [loadingTargets, setLoadingTargets] = useState(false);
  const [addFanpageId, setAddFanpageId]   = useState('');
  const [addingFanpage, setAddingFanpage] = useState(false);
  const [cancelling, setCancelling]       = useState(false);
  const [error, setError]                 = useState('');
  const [successMsg, setSuccessMsg]       = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);

  // US-35 – Edit state
  const [editDate, setEditDate]           = useState('');  // YYYY-MM-DD
  const [editTime, setEditTime]           = useState('');  // HH:mm
  const [editMode, setEditMode]           = useState(false);
  const [updating, setUpdating]           = useState(false);
  const [localPublishTime, setLocalPublishTime] = useState(null); // thời gian hiển thị sau khi đã sửa

  /** Fetch danh sách targets khi modal mở */
  const fetchTargets = useCallback(async () => {
    if (!schedule?.id) return;
    setLoadingTargets(true);
    setError('');
    try {
      const res = await scheduleApi.getPostTargets(API_BASE_URL, schedule.id);
      const list = Array.isArray(res) ? res : res?.data || [];
      setTargets(list);
    } catch {
      setError('Không thể tải trạng thái đăng bài.');
    } finally {
      setLoadingTargets(false);
    }
  }, [schedule?.id]);

  /** Fetch tất cả fanpage của workspace để dropdown "thêm fanpage" */
  const fetchAllFanpages = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const list = await getWorkspaceFanpages(workspaceId);
      setAllFanpages(list);
      // KHÔNG set addFanpageId ở đây vì chưa có targets, sẽ sync qua useEffect bên dưới
    } catch {
      /* silent – không cần thông báo lỗi nếu fanpages fail */
    }
  }, [workspaceId]);

  /**
   * Tự động đồng bộ addFanpageId về fanpage đầu tiên CÒN CÓ THỂ THÊM
   * (chưa có trong targets) mỗi khi targets hoặc allFanpages thay đổi.
   * Đây là fix cho bug: addFanpageId bị set theo allFanpages[0] thay vì availableToAdd[0]
   */
  useEffect(() => {
    const existingIds = new Set(targets.map((t) => String(t.fanpageId)));
    const available = allFanpages.filter((fp) => !existingIds.has(String(fp.fanpageId)));
    if (available.length > 0) {
      setAddFanpageId(String(available[0].fanpageId));
    } else {
      setAddFanpageId('');
    }
  }, [targets, allFanpages]);

  useEffect(() => {
    if (!isOpen || !schedule) return;
    setError('');
    setSuccessMsg('');
    setConfirmCancel(false);
    setEditMode(false);
    setLocalPublishTime(schedule.publishTime); // reset về giá trị gốc khi mở modal
    // Initialize edit fields from current schedule publishTime
    if (schedule.publishTime) {
      const iso = schedule.publishTime;
      const d = new Date(typeof iso === 'string' && !iso.endsWith('Z') ? iso + 'Z' : iso);
      // Local date/time getters (máy trình duyệt, không UTC)
      const yyyy = d.getFullYear();
      const mm   = String(d.getMonth() + 1).padStart(2, '0');
      const dd   = String(d.getDate()).padStart(2, '0');
      const hh   = String(d.getHours()).padStart(2, '0');
      const min  = String(d.getMinutes()).padStart(2, '0');
      setEditDate(`${yyyy}-${mm}-${dd}`);
      setEditTime(`${hh}:${min}`);
    }
    fetchTargets();
    fetchAllFanpages();
  }, [isOpen, schedule, fetchTargets, fetchAllFanpages]);

  /** US-35: Cập nhật thời gian đăng */
  const handleUpdateSchedule = async () => {
    if (!editDate || !editTime) {
      setError('Vui lòng chọn ngày và giờ đăng.');
      return;
    }
    const newPublishTime = `${editDate}T${editTime}:00`;
    if (new Date(newPublishTime) <= new Date()) {
      setError('Thời gian đăng phải là trong tương lai.');
      return;
    }
    setUpdating(true);
    setError('');
    setSuccessMsg('');
    try {
      await scheduleApi.updateSchedule(API_BASE_URL, schedule.id, { publishTime: newPublishTime });
      // Cập nhật ngay giá trị hiển thị trong modal (không cần đóng/mở lại)
      setLocalPublishTime(newPublishTime);
      setSuccessMsg('Đã cập nhật lịch đăng thành công!');
      setEditMode(false);
      onSuccess?.();
    } catch (err) {
      const msg = err?.message || 'Không thể cập nhật. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setUpdating(false);
    }
  };

  /** US-37: Thêm fanpage vào lịch */
  const handleAddFanpage = async () => {
    if (!addFanpageId) return;
    const existingIds = targets.map((t) => String(t.fanpageId));
    if (existingIds.includes(String(addFanpageId))) {
      setError('Fanpage này đã được thêm vào lịch rồi.');
      return;
    }
    setAddingFanpage(true);
    setError('');
    setSuccessMsg('');
    try {
      await scheduleApi.addPostTarget(API_BASE_URL, {
        scheduledPostId: schedule.id,
        fanpageId: Number(addFanpageId),
      });
      setSuccessMsg('Đã thêm fanpage vào lịch thành công!');
      await fetchTargets();
      onSuccess?.();
    } catch (err) {
      const msg = err?.message || 'Không thể thêm fanpage. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setAddingFanpage(false);
    }
  };

  /** US-36: Hủy lịch */
  const handleCancelSchedule = async () => {
    if (!confirmCancel) {
      setConfirmCancel(true);
      return;
    }
    setCancelling(true);
    setError('');
    setSuccessMsg('');
    try {
      await scheduleApi.cancelSchedule(API_BASE_URL, schedule.id);
      setSuccessMsg('Đã hủy lịch đăng thành công.');
      onSuccess?.();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      const msg = err?.message || 'Không thể hủy lịch. Vui lòng thử lại.';
      setError(msg);
      setConfirmCancel(false);
    } finally {
      setCancelling(false);
    }
  };

  if (!isOpen || !schedule) return null;

  const isWaiting = schedule.status === 'WAITING';

  /** Format publishTime từ ISO → giờ ngày VN */
  function formatPublishTime(iso) {
    if (!iso) return '—';
    const d = new Date(typeof iso === 'string' && !iso.endsWith('Z') ? iso + 'Z' : iso);
    return d.toLocaleString('vi-VN', {
      weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  /** Map fanpageId → tên fanpage */
  const fanpageMap = {};
  allFanpages.forEach((fp) => { fanpageMap[fp.fanpageId] = fp; }); // lưu cả object để lấy avatarUrl

  /** Fanpages chưa có trong targets (để dropdown thêm) */
  const existingFanpageIds = new Set(targets.map((t) => String(t.fanpageId)));
  const availableToAdd = allFanpages.filter((fp) => !existingFanpageIds.has(String(fp.fanpageId)));

  return (
    <div className="sdm-overlay" onClick={onClose}>
      <div className="sdm-modal" onClick={(e) => e.stopPropagation()}>
        {/* ── Header ── */}
        <div className="sdm-header">
          <div className="sdm-header__left">
            <div className="sdm-header__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <h2 className="sdm-header__title">Chi tiết lịch đăng</h2>
              <p className="sdm-header__subtitle">ID #{schedule.id}</p>
            </div>
          </div>
          <button className="sdm-close-btn" onClick={onClose} aria-label="Đóng">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="sdm-body">
          {/* ── Thông tin bài viết ── */}
          <section className="sdm-section">
            <h3 className="sdm-section__title">Bài viết</h3>
            <div className="sdm-post-info">
              <div className="sdm-post-info__row">
                <span className="sdm-post-info__label">Tiêu đề</span>
                <span className="sdm-post-info__value">{schedule.postTitle || '(Không có tiêu đề)'}</span>
              </div>
              <div className="sdm-post-info__row">
                <span className="sdm-post-info__label">Thời gian</span>
                <span className="sdm-post-info__value">{formatPublishTime(localPublishTime || schedule.publishTime)}</span>
              </div>
              <div className="sdm-post-info__row">
                <span className="sdm-post-info__label">Trạng thái</span>
                <StatusBadge status={schedule.status} />
              </div>
              {schedule.postContent && (
                <div className="sdm-post-content">
                  <p>{schedule.postContent.length > 200
                    ? schedule.postContent.substring(0, 200) + '…'
                    : schedule.postContent}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ── US-35: Chỉnh sửa thời gian đăng (chỉ WAITING) ── */}
          {isWaiting && (
            <section className="sdm-section">
              <div className="sdm-section-header">
                <h3 className="sdm-section__title">Chỉnh sửa lịch</h3>
                {!editMode && (
                  <button
                    className="sdm-btn-icon sdm-btn-icon--edit"
                    onClick={() => { setEditMode(true); setError(''); setSuccessMsg(''); }}
                    title="Chỉnh sửa thời gian"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Sửa
                  </button>
                )}
              </div>

              {editMode ? (
                <div className="sdm-edit-form">
                  <div className="sdm-edit-row">
                    <div className="sdm-edit-field">
                      <label className="sdm-edit-label">Ngày đăng</label>
                      <input
                        id="sdm-edit-date"
                        type="date"
                        className="sdm-input"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        disabled={updating}
                      />
                    </div>
                    <div className="sdm-edit-field">
                      <label className="sdm-edit-label">Giờ đăng</label>
                      <input
                        id="sdm-edit-time"
                        type="time"
                        className="sdm-input"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        disabled={updating}
                      />
                    </div>
                  </div>
                  <div className="sdm-edit-actions">
                    <button
                      className="sdm-btn sdm-btn--save"
                      onClick={handleUpdateSchedule}
                      disabled={updating}
                    >
                      {updating ? (
                        <span className="sdm-spinner" />
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Lưu thay đổi
                        </>
                      )}
                    </button>
                    <button
                      className="sdm-btn sdm-btn--ghost"
                      onClick={() => { setEditMode(false); setError(''); }}
                      disabled={updating}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <p className="sdm-edit-hint">
                  ✨ Đang chờ đăng — bạn có thể thay đổi thời gian trước khi hệ thống xử lý.
                </p>
              )}
            </section>
          )}

          {/* ── US-38: Trạng thái từng fanpage ── */}
          <section className="sdm-section">
            <h3 className="sdm-section__title">
              Trạng thái đăng bài
              {loadingTargets && <span className="sdm-loading-inline">đang tải…</span>}
            </h3>
            {!loadingTargets && targets.length === 0 ? (
              <p className="sdm-empty">Chưa có fanpage nào được lên lịch.</p>
            ) : (
              <ul className="sdm-target-list">
                {targets.map((target) => {
                  const fp = fanpageMap[target.fanpageId];
                  const fpName = fp?.fanpageName || `Fanpage #${target.fanpageId}`;
                  const fpAvatar = fp?.fanpageAvatarUrl || null;
                  return (
                    <li key={target.id} className="sdm-target-item">
                      <FanpageAvatar name={fpName} avatarUrl={fpAvatar} />
                      <div className="sdm-target-info">
                        <span className="sdm-target-name">{fpName}</span>
                        {target.errorMessage && (
                          <span className="sdm-target-error">{target.errorMessage}</span>
                        )}
                        {target.retryCount > 0 && (
                          <span className="sdm-target-retry">Thử lại: {target.retryCount} lần</span>
                        )}
                      </div>
                      <StatusBadge status={target.status} />
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* ── US-37: Thêm fanpage (chỉ WAITING) ── */}
          {isWaiting && availableToAdd.length > 0 && (
            <section className="sdm-section">
              <h3 className="sdm-section__title">Thêm fanpage</h3>
              <div className="sdm-add-fanpage">
                <select
                  className="sdm-select"
                  value={addFanpageId}
                  onChange={(e) => setAddFanpageId(e.target.value)}
                  disabled={addingFanpage}
                >
                  {availableToAdd.map((fp) => (
                    <option key={fp.fanpageId} value={fp.fanpageId}>
                      {fp.fanpageName || `Fanpage #${fp.fanpageId}`}
                    </option>
                  ))}
                </select>
                <button
                  className="sdm-btn sdm-btn--add"
                  onClick={handleAddFanpage}
                  disabled={addingFanpage || !addFanpageId}
                >
                  {addingFanpage ? (
                    <span className="sdm-spinner" />
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Thêm
                    </>
                  )}
                </button>
              </div>
            </section>
          )}

          {/* ── Feedback messages ── */}
          {error && (
            <div className="sdm-alert sdm-alert--error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}
          {successMsg && (
            <div className="sdm-alert sdm-alert--success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {successMsg}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="sdm-footer">
          {/* US-36: Hủy lịch */}
          {isWaiting && (
            confirmCancel ? (
              <div className="sdm-confirm-row">
                <span className="sdm-confirm-text">Xác nhận hủy lịch này?</span>
                <button
                  className="sdm-btn sdm-btn--danger"
                  onClick={handleCancelSchedule}
                  disabled={cancelling}
                >
                  {cancelling ? <span className="sdm-spinner" /> : 'Xác nhận hủy'}
                </button>
                <button
                  className="sdm-btn sdm-btn--ghost"
                  onClick={() => setConfirmCancel(false)}
                  disabled={cancelling}
                >
                  Không
                </button>
              </div>
            ) : (
              <button
                className="sdm-btn sdm-btn--cancel"
                onClick={handleCancelSchedule}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                Hủy lịch đăng
              </button>
            )
          )}

          <button className="sdm-btn sdm-btn--close" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
