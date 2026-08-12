import React from 'react';
import '../styles/AnalyticsDashboardV2.css';

const getMonthsLabels = () => {
  const labels = [];
  const date = new Date();
  date.setDate(1);
  for (let i = 0; i < 12; i++) {
    labels.unshift(`T${date.getMonth() + 1}`);
    date.setMonth(date.getMonth() - 1);
  }
  return labels;
};

const HeatmapChart = ({ customData = [] }) => {
  const months = getMonthsLabels();
  const hasData = customData.length > 0;

  const cells = Array.from({ length: 364 }, (_, index) => {
    const dataIndex = index - (364 - customData.length);
    if (dataIndex >= 0 && customData[dataIndex]) {
      const item = customData[dataIndex];
      const countNum = Number(item.count || item.value) || 0; // support old data format if any
      let level = 0;
      if (countNum === 1) level = 1;
      else if (countNum === 2) level = 2;
      else if (countNum === 3) level = 3;
      else if (countNum >= 4) level = 4;

      let formattedDate = '';
      if (item.date) {
        const dateObj = new Date(item.date);
        formattedDate = dateObj.toLocaleDateString('vi-VN');
      }

      return {
        level,
        title: countNum > 0 
          ? `${countNum} bài viết vào ngày ${formattedDate}` 
          : `Không có bài viết nào${formattedDate ? ' vào ngày ' + formattedDate : ''}`
      };
    }
    return { level: 0, title: 'Chưa có dữ liệu' };
  });

  return (
    <article className="chart-card chart-card--heatmap">
      <div className="chart-header chart-header--heatmap">
        <div>
          <h3 className="chart-title">Tần suất đăng bài</h3>
        </div>
        <div className="heatmap-legend" aria-label="Mức độ hoạt động">
          <span>Ít</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span key={level} className={`heatmap-cell heatmap-cell--legend heatmap-cell--level-${level}`} />
          ))}
          <span>Nhiều</span>
        </div>
      </div>
      <p className="chart-subtitle">
        Số lượng bài đăng theo ngày trong 12 tháng gần nhất. Các ô đậm hơn cho thấy ngày có nhiều bài đăng hơn.
      </p>

      <div className="heatmap-wrapper">
        <div className="heatmap-y-axis" aria-hidden="true">
          <span>CN</span>
          <span>TH 3</span>
          <span>TH 5</span>
          <span>TH 7</span>
        </div>
        <div className="heatmap-scroll-container">
          <div className="heatmap-grid-container">
            <div className="heatmap-months" aria-hidden="true">
              {months.map((month, idx) => <span key={idx}>{month}</span>)}
            </div>
            <div
              className="heatmap-grid"
              role="img"
              aria-label={hasData ? 'Biểu đồ nhiệt tần suất bài đăng' : 'Chưa có dữ liệu tần suất'}
            >
              {cells.map((cell, index) => (
                <span
                  key={index}
                  className={`heatmap-cell heatmap-cell--level-${cell.level}`}
                  title={cell.title}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {!hasData && <p className="heatmap-note">Chọn ít nhất một kênh để lấp đầy chỉ số này.</p>}
    </article>
  );
};

export default HeatmapChart;
