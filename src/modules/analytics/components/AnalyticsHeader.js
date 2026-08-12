import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AnalyticsDashboardV2.css';

const AnalyticsHeader = () => {
  return (
    <header className="analytics-standalone-header">
      <Link to="/" className="analytics-standalone-header__brand">
        <img src="/logo192.png" alt="MarqOps" />
        <span>MarqOps</span>
      </Link>
      <nav className="analytics-standalone-header__nav" aria-label="Điều hướng">
        <Link to="/campaigns" className="analytics-standalone-header__link">Chiến dịch</Link>
        <Link to="/analytics-v2" className="analytics-standalone-header__link analytics-standalone-header__link--active" aria-current="page">
          Phân tích
        </Link>
      </nav>
      <a href="#help" className="analytics-standalone-header__help" onClick={(event) => event.preventDefault()}>
        Trợ giúp
      </a>
    </header>
  );
};

export default AnalyticsHeader;
