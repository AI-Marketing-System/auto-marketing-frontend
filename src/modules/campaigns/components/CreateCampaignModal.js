import React, { useState, useEffect } from 'react';
import { parseWorkspacesResponse, workspaceApi } from '../api/campaignApi';
import { API_BASE_URL } from '../../../config/env';

function CreateCampaignModal({ isOpen, onClose, onSubmit, defaultWorkspaceId = null }) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [workspaceId, setWorkspaceId] = useState('');
  const [workspaces, setWorkspaces] = useState([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setTitle('');
    setStartDate('');
    setEndDate('');
    setDescription('');
    setStatus('ACTIVE');
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return undefined;
    }

    let cancelled = false;
    setLoadingWorkspaces(true);
    workspaceApi
      .myWorkspaces(API_BASE_URL)
      .then((res) => {
        if (cancelled) return;
        const wsList = parseWorkspacesResponse(res);
        setWorkspaces(wsList);

        if (wsList.length === 0) {
          setWorkspaceId('');
          return;
        }

        const preferredId = defaultWorkspaceId != null ? String(defaultWorkspaceId) : '';
        const hasPreferred = preferredId && wsList.some((ws) => String(ws.id) === preferredId);
        setWorkspaceId(hasPreferred ? preferredId : String(wsList[0].id));
      })
      .catch(() => {
        if (!cancelled) {
          setWorkspaces([]);
          setWorkspaceId('');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingWorkspaces(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, defaultWorkspaceId]);

  if (!isOpen) return null;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !workspaceId || !startDate || !endDate || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit?.({
        workspaceId: Number(workspaceId),
        title: title.trim(),
        description: description.trim(),
        status,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  const statusOptions = [
    { value: 'ACTIVE', label: 'Đang chạy' },
    { value: 'PAUSED', label: 'Tạm dừng' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title-text">Tạo chiến dịch mới</h3>
          <button type="button" className="close-modal-btn" onClick={onClose}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form className="modal-body-form" onSubmit={handleFormSubmit}>
          <div className="modal-form-group">
            <label className="modal-form-label" htmlFor="workspace">
              Workspace
            </label>
            <div className="select-dropdown-container">
              <select
                id="workspace"
                className="modal-form-select"
                value={workspaceId}
                onChange={(event) => setWorkspaceId(event.target.value)}
                disabled={loadingWorkspaces || workspaces.length === 0}
              >
                {workspaces.length === 0 && <option value="">Không có workspace</option>}
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label" htmlFor="campaign-title">
              Tên chiến dịch
            </label>
            <input
              type="text"
              id="campaign-title"
              className="modal-form-input"
              placeholder="Ví dụ: Khai trương cửa hàng mới"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>

          <div className="date-fields-grid">
            <div className="modal-form-group">
              <label className="modal-form-label" htmlFor="start-date">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                id="start-date"
                className="modal-form-input"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
              />
            </div>
            <div className="modal-form-group">
              <label className="modal-form-label" htmlFor="end-date">
                Ngày kết thúc
              </label>
              <input
                type="date"
                id="end-date"
                className="modal-form-input"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label" htmlFor="campaign-status">
              Trạng thái ban đầu
            </label>
            <div className="select-dropdown-container">
              <select
                id="campaign-status"
                className="modal-form-select"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label" htmlFor="campaign-desc">
              Mô tả chiến dịch (Tùy chọn)
            </label>
            <textarea
              id="campaign-desc"
              className="modal-form-textarea"
              placeholder="Nhập mô tả hoặc ghi chú ngắn..."
              rows="3"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="modal-footer-actions">
            <button type="button" className="btn-cancel-modal" onClick={onClose} disabled={submitting}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn-submit-modal" disabled={submitting || workspaces.length === 0}>
              {submitting ? 'Đang tạo...' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCampaignModal;
