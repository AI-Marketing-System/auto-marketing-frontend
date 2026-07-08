import React from "react";

function CampaignCard({ initials, initialsBg = "#7c3aed", initialsColor = "#ffffff", status, title, dateRange, topicsCount, postsCount, onClick }) {
    // Determine status badge classes
    let statusClass = "status-pill";
    if (status === "Đang chạy") statusClass += " status-running";
    else if (status === "Tạm dừng") statusClass += " status-paused";
    else if (status === "Hoàn thành") statusClass += " status-completed";

    return (
        <div className="campaign-card" onClick={onClick}>
            {/* Card Header */}
            <div className="campaign-card-header">
                <div className="campaign-initials" style={{ backgroundColor: initialsBg, color: initialsColor }}>
                    {initials}
                </div>
                <span className={statusClass}>{status}</span>
            </div>

            {/* Card Body */}
            <div className="campaign-card-body">
                <h3 className="campaign-title">{title}</h3>
                <span className="campaign-daterange">{dateRange}</span>
            </div>

            {/* Divider */}
            <hr className="campaign-card-divider" />

            {/* Card Footer */}
            <div className="campaign-card-footer">
                <span className="campaign-meta-item">{topicsCount} topic</span>
                <span className="campaign-meta-item">{postsCount} bài viết</span>
            </div>
        </div>
    );
}

export default CampaignCard;
