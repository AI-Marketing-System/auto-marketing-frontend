import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AnalyticsDashboardV2.css';

const AnalyticsHeaderV2 = () => {
  return (
    <header className="analytics-header">
      <div className="header-left">
        <Link to="/" className="brand-logo">
          <img src="/logo192.png" alt="MarqOps Logo" style={{width: '32px', height: '32px', objectFit: 'contain'}} />
          MarqOps
        </Link>
      </div>
      <nav className="header-nav">
        <Link to="/campaigns" className="nav-link">Chiến dịch</Link>
        <Link to="/analytics-v2" className="nav-link active">Lịch đăng</Link>
      </nav>
      <div className="header-right">
        <a href="#" className="help-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Trợ giúp
        </a>
        <div className="user-avatar">NK</div>
      </div>
    </header>
  );
};

export default AnalyticsHeaderV2;
