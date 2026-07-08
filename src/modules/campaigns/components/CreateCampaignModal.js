import React, { useState, useEffect } from 'react';
import { workspaceApi } from '../api/campaignApi';
import { API_BASE_URL } from '../../../config/env';

function CreateCampaignModal({ isOpen, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [workspaceId, setWorkspaceId] = useState('');
  const [workspaces, setWorkspaces] = useState([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoadingWorkspaces(true);
    workspaceApi
      .myWorkspaces(API_BASE_URL)
      .then((res) => {
        if (!cancelled && res && res.data && Array.isArray(res.data)) {
          setWorkspaces(res.data);
          if (res.data.length > 0) setWorkspaceId(String(res.data[0].id));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingWorkspaces(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !workspaceId || !startDate || !endDate) return;

    onSubmit &&
      onSubmit({
        workspaceId: Number(workspaceId),
        title: title.trim(),
        description: description.trim(),
        status,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });

    setTitle('');
    setStartDate('');
    setEndDate('');
    setDescription('');
    setStatus('ACTIVE');
  };

  const statusOptions = [
    { value: 'ACTIVE', label: 'Đang chạy' },
    { value: 'PAUSED', label: 'Tạm dừng' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
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
                onChange={(e) => setWorkspaceId(e.target.value)}
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
              onChange={(e) => setTitle(e.target.value)}
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
                onChange={(e) => setStartDate(e.target.value)}
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
                onChange={(e) => setEndDate(e.target.value)}
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
                onChange={(e) => setStatus(e.target.value)}
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
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-footer-actions">
            <button type="button" className="btn-cancel-modal" onClick={onClose}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn-submit-modal">
              Tạo mới
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCampaignModal;
