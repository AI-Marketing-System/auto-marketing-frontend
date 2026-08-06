import React, { useState, useRef, useEffect } from "react";

function CreateWorkspaceModal({ isOpen, onClose, onSubmit, workspaceData }) {
    const [workspaceName, setWorkspaceName] = useState("");
    const [description, setDescription] = useState("");
    const [timezone, setTimezone] = useState("(GMT+07:00) Hanoi");
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (workspaceData) {
            setWorkspaceName(workspaceData.title || "");
            setDescription(workspaceData.description || "");
        } else {
            setWorkspaceName("");
            setDescription("");
        }
    }, [workspaceData, isOpen]);

    if (!isOpen) return null;

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!workspaceName.trim()) return;

        onSubmit && onSubmit({
            title: workspaceName.trim(),
            description: description.trim(),
            timezone,
            avatar: avatarPreview
        });
        
        // Reset states
        setWorkspaceName("");
        setDescription("");
        setTimezone("(GMT+07:00) Hanoi");
        setAvatarPreview(null);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <form className="modal-form-wrapper" onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', maxHeight: '100%', margin: 0, padding: 0 }}>
                    {/* Modal Header */}
                    <div className="modal-header">
                        <h3 className="modal-title-text">{workspaceData ? "Chỉnh sửa workspace" : "Tạo workspace mới"}</h3>
                        <button type="button" className="close-modal-btn" onClick={onClose}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="modal-body-content" style={{ overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        {/* Info box explaining Workspace */}
                        <div className="workspace-explain-box">
                            <div className="explain-illustration">
                                <svg width="84" height="64" viewBox="0 0 84 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="84" height="64" rx="8" fill="#eef2ff" />
                                    {/* Modern layout graphic illustration */}
                                    <rect x="8" y="10" width="30" height="20" rx="4" fill="#c7d2fe" />
                                    <circle cx="48" cy="20" r="6" fill="#818cf8" />
                                    <line x1="58" y1="20" x2="74" y2="20" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
                                    <rect x="8" y="36" width="68" height="18" rx="4" fill="#ffffff" stroke="#e0e7ff" strokeWidth="1.5" />
                                    <circle cx="16" cy="45" r="4" fill="#fbbf24" />
                                    <line x1="26" y1="45" x2="56" y2="45" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div className="explain-text-content">
                                <h4 className="explain-title">Workspace là gì?</h4>
                                <p className="explain-description">
                                    Workspace là không gian riêng để bạn quản lý các tài khoản social media của cùng một thương hiệu, hoặc một khách hàng. Mỗi workspace sẽ có một thư viện content riêng biệt. <a href="#learn-more" className="explain-link">Tìm hiểu thêm.</a>
                                </p>
                            </div>
                        </div>

                        {/* Avatar Upload Dropzone */}
                        <div className="avatar-upload-section">
                            <div 
                                className={`avatar-preview-circle ${avatarPreview ? "has-image" : ""}`} 
                                onClick={handleAvatarClick}
                            >
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Workspace Avatar Preview" className="avatar-image" />
                                ) : (
                                    <span className="upload-placeholder-text">Tải lên ảnh đại diện</span>
                                )}
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{ display: "none" }} 
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* Inputs Area */}
                        <div className="form-fields-wrapper">
                            {/* Workspace Name Input */}
                            <div className="modal-form-group">
                                <label className="modal-form-label" htmlFor="ws-name">Tên Workspace</label>
                                <input 
                                    type="text" 
                                    id="ws-name" 
                                    className="modal-form-input" 
                                    placeholder="Ví dụ: PostLab Fanpages"
                                    value={workspaceName}
                                    onChange={(e) => setWorkspaceName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Workspace Description Input */}
                            <div className="modal-form-group">
                                <label className="modal-form-label" htmlFor="ws-desc">Mô tả Workspace</label>
                                <textarea 
                                    id="ws-desc" 
                                    className="modal-form-input" 
                                    placeholder="Nhập mô tả ngắn về workspace của bạn (tùy chọn)"
                                    style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            {/* Timezone Select Input */}
                            <div className="modal-form-group">
                                <label className="modal-form-label" htmlFor="ws-timezone">Múi giờ</label>
                                <div className="select-dropdown-container">
                                    <select 
                                        id="ws-timezone" 
                                        className="modal-form-select"
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                    >
                                        <option value="(GMT+07:00) Hanoi">(GMT+07:00) Hanoi</option>
                                        <option value="(GMT+08:00) Singapore">(GMT+08:00) Singapore</option>
                                        <option value="(GMT+09:00) Tokyo">(GMT+09:00) Tokyo</option>
                                        <option value="(GMT+00:00) London">(GMT+00:00) London</option>
                                        <option value="(GMT-05:00) New York">(GMT-05:00) New York</option>
                                    </select>
                                </div>
                                <span className="timezone-helper-text">
                                    Bài viết trong Workspace sẽ được đăng theo múi giờ đã chọn
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer Action Button */}
                    <div className="modal-footer-actions" style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#ffffff', flexShrink: 0 }}>
                        <button type="submit" className="btn-submit-modal">
                            {workspaceData ? "Lưu thay đổi" : "Tạo mới"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateWorkspaceModal;
