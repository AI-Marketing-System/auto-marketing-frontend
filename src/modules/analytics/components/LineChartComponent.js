import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatChartLabel, getTimeUnitLabel } from './chartFormatters';
import '../styles/AnalyticsDashboardV2.css';

const chartDataFallback = [];
const chartAxisTick = { fontSize: 11, fill: 'var(--analytics-muted)' };
const tooltipStyle = {
  backgroundColor: 'var(--analytics-tooltip-bg)',
  border: '1px solid var(--analytics-border)',
  borderRadius: '10px',
  boxShadow: 'var(--analytics-shadow-popover)',
  color: 'var(--analytics-ink)',
  fontFamily: 'var(--analytics-font-ui)',
  fontSize: 13,
};

const formatValue = (value) => Number(value || 0).toLocaleString('vi-VN');

const LineChartComponent = ({ customData, timeGranularity = 'day' }) => {
  const displayData = customData || chartDataFallback;
  const timeUnitLabel = getTimeUnitLabel(timeGranularity);

  return (
    <article className="chart-card chart-card--followers">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Lượng người theo dõi</h3>
        </div>
        <p className="chart-subtitle">
          Tín hiệu tăng trưởng cộng dồn của các trang đang được chọn theo {timeUnitLabel}.
        </p>
      </div>

      <div className="chart-visual">
        {displayData.length === 0 ? (
          <div className="chart-empty-state">
            <span className="chart-empty-state__line" aria-hidden="true" />
            <strong>Đang chờ tín hiệu tăng trưởng</strong>
            <span>Chọn kênh để bắt đầu theo dõi người theo dõi.</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData} margin={{ top: 12, right: 12, left: -16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="4 7" vertical={false} stroke="var(--analytics-border)" />
              <XAxis
                dataKey="date"
                tick={chartAxisTick}
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                interval={timeGranularity === 'hour' ? 3 : 'preserveEnd'}
                tickFormatter={(value) => formatChartLabel(value, timeGranularity)}
              />
              <YAxis
                allowDecimals={false}
                tick={chartAxisTick}
                axisLine={false}
                tickLine={false}
                width={48}
                tickFormatter={formatValue}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: 'var(--analytics-muted)', marginBottom: 4 }}
                labelFormatter={(value) => formatChartLabel(value, timeGranularity)}
                formatter={(value) => [formatValue(value), 'Người theo dõi']}
              />
              <Line
                type="monotone"
                dataKey="followers"
                stroke="var(--analytics-accent)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: 'var(--analytics-accent)', stroke: 'var(--analytics-surface)', strokeWidth: 3 }}
                isAnimationActive
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </article>
  );
};

export default LineChartComponent;
