import React from 'react';
import '../styles/AnalyticsDashboardV2.css';

const HeatmapChart = () => {
  // Generate dummy data for 52 weeks * 7 days = 364 days
  const cells = Array.from({ length: 364 }).map((_, i) => {
    // Randomly assign activity levels to simulate the screenshot
    // Last two dots are highlighted as in the screenshot
    if (i === 362 || i === 363) return 3; 
    
    // Most days have no activity (0) to match the empty graph
    return 0;
  });

  const months = ['Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'];

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Tần suất đăng bài</h3>
        <p className="chart-subtitle">Số bài đăng mỗi ngày trong 12 tháng gần nhất. Thể hiện mức độ đều đặn và tính nhất quán trong lịch đăng bài của bạn.</p>
      </div>
      
      <div className="heatmap-wrapper">
        <div className="heatmap-y-axis">
          <span>CN</span>
          <span>Thứ 3</span>
          <span>Thứ 5</span>
          <span>Thứ 7</span>
        </div>
        
        <div className="heatmap-scroll-container">
          <div className="heatmap-grid-container">
            <div className="heatmap-months">
              {months.map((month, idx) => (
                <span key={idx}>{month}</span>
              ))}
            </div>
            <div className="heatmap-grid">
              {cells.map((level, idx) => (
                <div key={idx} className={`heatmap-cell level-${level}`}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapChart;
