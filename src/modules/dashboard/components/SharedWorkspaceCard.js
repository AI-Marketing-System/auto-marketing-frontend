import React from "react";

function SharedWorkspaceCard({ role, title, campaigns = [], onSettingsClick, onCardClick }) {
    return (
        <div className="shared-card" onClick={onCardClick}>
            <div className="shared-card-header">
                <div className="shared-card-branding">
                    <span className="mini-logo-icon">
                        <svg width="22" height="22" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M40 50 C 40 40, 50 30, 60 30 H 140 C 150 30, 160 40, 160 50 V 170 C 160 175, 155 180, 150 180 H 50 C 45 180, 40 175, 40 170 Z" fill="#783e19" />
                            <rect x="50" y="60" width="100" height="110" rx="8" fill="#FDFBF7" />
                            <path d="M50 68 C 50 64, 54 60, 58 60 H 142 C 146 60, 150 64, 150 68 V 90 H 50 Z" fill="#4e8250" />
                            <circle cx="70" cy="45" r="8" fill="#E8DCC4" />
                            <circle cx="100" cy="45" r="8" fill="#E8DCC4" />
                            <circle cx="130" cy="45" r="8" fill="#E8DCC4" />
                            <path d="M70 25 V 50" stroke="#708090" strokeWidth="8" strokeLinecap="round" />
                            <path d="M100 25 V 50" stroke="#708090" strokeWidth="8" strokeLinecap="round" />
                            <path d="M130 25 V 50" stroke="#708090" strokeWidth="8" strokeLinecap="round" />
                            <rect x="65" y="105" width="12" height="12" rx="2" fill="#E8DCC4" />
                            <rect x="85" y="105" width="12" height="12" rx="2" fill="#E8DCC4" />
                            <rect x="105" y="105" width="12" height="12" rx="2" fill="#E8DCC4" />
                            <rect x="125" y="105" width="12" height="12" rx="2" fill="#4e8250" />
                            <rect x="65" y="125" width="12" height="12" rx="2" fill="#E8DCC4" />
                            <rect x="85" y="125" width="12" height="12" rx="2" fill="#d05a3f" />
                            <rect x="105" y="125" width="12" height="12" rx="2" fill="#E8DCC4" />
                            <rect x="125" y="125" width="12" height="12" rx="2" fill="#E8DCC4" />
                            <rect x="65" y="145" width="12" height="12" rx="2" fill="#E8DCC4" />
                            <rect x="85" y="145" width="12" height="12" rx="2" fill="#E8DCC4" />
                            <rect x="105" y="145" width="12" height="12" rx="2" fill="#3f6ad0" />
                            <rect x="125" y="145" width="12" height="12" rx="2" fill="#E8DCC4" />
                        </svg>
                    </span>
                    <div className="title-and-badge">
                        <span className={`role-badge ${role.toLowerCase()}`}>{role}</span>
                        <h4 className="shared-workspace-title">{title}</h4>
                    </div>
                </div>
                <button 
                    type="button" 
                    className="icon-btn settings-btn" 
                    onClick={(e) => {
                        e.stopPropagation();
                        onSettingsClick && onSettingsClick();
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                </button>
            </div>
            <div className="shared-card-body">
                <span className="campaign-label">Chiến dịch</span>
                {campaigns.length > 0 ? (
                    <ul className="campaign-list">
                        {campaigns.map((camp, idx) => (
                            <li key={idx} className="campaign-item">
                                <span className="bullet">•</span>
                                <span className="campaign-name">{camp}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <span className="no-campaigns">Chưa có chiến dịch</span>
                )}
            </div>
        </div>
    );
}

export default SharedWorkspaceCard;
