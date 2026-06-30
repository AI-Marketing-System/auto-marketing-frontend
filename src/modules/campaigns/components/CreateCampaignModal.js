import React, { useState } from "react";

function CreateCampaignModal({ isOpen, onClose, onSubmit }) {
    const [title, setTitle] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("Đang chạy");

    if (!isOpen) return null;

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !startDate || !endDate) return;

        // Format dates to show e.g. "12/06 - 30/06"
        const formatDate = (dateStr) => {
            if (!dateStr) return "";
            const parts = dateStr.split("-");
            if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}`;
            }
            return dateStr;
        };

        const formattedRange = `${formatDate(startDate)} - ${formatDate(endDate)}`;

        onSubmit && onSubmit({
            title: title.trim(),
            dateRange: formattedRange,
            description: description.trim(),
            status
        });

        // Reset states
        setTitle("");
        setStartDate("");
        setEndDate("");
        setDescription("");
        setStatus("Đang chạy");
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="modal-header">
                    <h3 className="modal-title-text">Tạo chiến dịch mới</h3>
                    <button type="button" className="close-modal-btn" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Modal Body Form */}
                <form className="modal-body-form" onSubmit={handleFormSubmit}>
                    
                    {/* Campaign Name */}
                    <div className="modal-form-group">
                        <label className="modal-form-label" htmlFor="campaign-title">Tên chiến dịch</label>
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

                    {/* Date Range Selection (Start & End Date) */}
                    <div className="date-fields-grid">
                        <div className="modal-form-group">
                            <label className="modal-form-label" htmlFor="start-date">Ngày bắt đầu</label>
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
                            <label className="modal-form-label" htmlFor="end-date">Ngày kết thúc</label>
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

                    {/* Default Status Dropdown */}
                    <div className="modal-form-group">
                        <label className="modal-form-label" htmlFor="campaign-status">Trạng thái ban đầu</label>
                        <div className="select-dropdown-container">
                            <select 
                                id="campaign-status" 
                                className="modal-form-select"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="Đang chạy">Đang chạy</option>
                                <option value="Tạm dừng">Tạm dừng</option>
                            </select>
                        </div>
                    </div>

                    {/* Campaign Description */}
                    <div className="modal-form-group">
                        <label className="modal-form-label" htmlFor="campaign-desc">Mô tả chiến dịch (Tùy chọn)</label>
                        <textarea 
                            id="campaign-desc" 
                            className="modal-form-textarea" 
                            placeholder="Nhập mô tả hoặc ghi chú ngắn..."
                            rows="3"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Modal Footer Actions */}
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
