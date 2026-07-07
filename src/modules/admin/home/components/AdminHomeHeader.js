import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminHomeHeader.css';

function AdminHomeHeader() {
    return (
        <header className="admin-home-header">

            <div className="admin-home-brand">
                <svg
                    className="admin-brand-icon"
                    width="24" height="24" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                >
                    {/* Icon dạng Dashboard/Grid */}
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span className="admin-brand-text">MarqOps Admin</span>
            </div>

            <div className="admin-home-header__actions">
                <div className="admin-home-avatar">A</div>
            </div>
        </header>
    );
}

export default AdminHomeHeader;