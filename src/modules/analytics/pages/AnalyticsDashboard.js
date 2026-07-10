import React from 'react';
import AnalyticsHeader from '../components/AnalyticsHeader';
import HeatmapChart from '../components/HeatmapChart';
import LineChartComponent from '../components/LineChartComponent';
import { ViewsAreaChart, ReachAreaChart } from '../components/AreaChartComponent';
import '../styles/AnalyticsDashboardV2.css';

const AnalyticsDashboardV2 = () => {
  return (
    <div className="analytics-v2-container">
      <AnalyticsHeader />
      
      <main className="analytics-main">
        <div className="client-selector-bar">
          <div className="client-dropdown">
            Client - Coffee House Brand 
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <div className="client-avatars">
            <div className="client-avatar">
              <img src="/logo192.png" alt="Client 1" />
            </div>
            <div className="client-avatar">
              <img src="/logo192.png" alt="Client 2" />
            </div>
            <button className="add-client-btn">+</button>
          </div>
        </div>

        <div className="action-buttons-container">
          <button className="btn btn-secondary">
            Quản lý
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <button className="btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            Viết bài mới
          </button>
          <button className="btn btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Công cụ
          </button>
        </div>

        <div className="filters-bar">
          <div className="timezone-info">
            Dữ liệu hiển thị tại múi giờ <br/><strong>(GMT+07:00) Hanoi</strong>
          </div>
          <div className="date-range-picker">
            <div className="date-range-label">Khoảng thời gian</div>
            <select className="date-select">
              <option>1 tháng gần nhất</option>
              <option>3 tháng gần nhất</option>
            </select>
          </div>
        </div>

        <HeatmapChart />
        <LineChartComponent />
        <ViewsAreaChart />
        <ReachAreaChart />
        
      </main>
    </div>
  );
};

export default AnalyticsDashboardV2;
