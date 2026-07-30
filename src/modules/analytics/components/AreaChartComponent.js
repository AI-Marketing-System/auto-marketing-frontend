import React, { useState } from 'react';
import {
  AreaChart,
  Area,
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

const ChartEmptyState = () => (
  <div className="chart-empty-state">
    <span className="chart-empty-state__line" aria-hidden="true" />
    <strong>Chưa có dữ liệu trong khoảng này</strong>
    <span>Thử chọn thêm một kênh hoặc khoảng thời gian khác.</span>
  </div>
);

export const ViewsAreaChart = ({ customData, timeGranularity = 'day' }) => {
  const displayData = customData || chartDataFallback;
  const timeUnitLabel = getTimeUnitLabel(timeGranularity);

  return (
    <article className="chart-card chart-card--views">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Lượt xem nội dung</h3>
        </div>
        <p className="chart-subtitle">
          Số lần nội dung xuất hiện trên màn hình trong kỳ đã chọn, theo {timeUnitLabel}.
        </p>
      </div>

      <div className="chart-visual">
        {displayData.length === 0 ? (
          <ChartEmptyState />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData} margin={{ top: 12, right: 12, left: -16, bottom: 4 }}>
              <defs>
                <linearGradient id="analytics-views-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--analytics-primary)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--analytics-primary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
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
                formatter={(value) => [formatValue(value), 'Lượt xem']}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="var(--analytics-primary-deep)"
                fill="url(#analytics-views-gradient)"
                strokeWidth={2.5}
                activeDot={{ r: 5, fill: 'var(--analytics-primary-deep)', stroke: 'var(--analytics-surface)', strokeWidth: 3 }}
                isAnimationActive
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </article>
  );
};

export const ReachAreaChart = ({ customData, timeGranularity = 'day' }) => {
  const [activeTab, setActiveTab] = useState('reach');
  const displayData = customData || chartDataFallback;
  const dataKey = activeTab === 'reach' ? 'reach' : 'value';
  const timeUnitLabel = getTimeUnitLabel(timeGranularity);

  return (
    <article className="chart-card chart-card--wide">
      <div className="chart-card__topline">
        <div>
          <h3 className="chart-title">Lượt tiếp cận và phản ứng</h3>
        </div>
        <div className="chart-tabs" role="tablist" aria-label="Chỉ số tiếp cận">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'reach'}
            className={`chart-tab${activeTab === 'reach' ? ' chart-tab--active' : ''}`}
            onClick={() => setActiveTab('reach')}
          >
            Tiếp cận
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'reaction'}
            className={`chart-tab${activeTab === 'reaction' ? ' chart-tab--active' : ''}`}
            onClick={() => setActiveTab('reaction')}
          >
            Phản ứng
          </button>
        </div>
      </div>
      <p className="chart-subtitle">
        Theo dõi quy mô khán giả và mức độ họ phản hồi với nội dung theo {timeUnitLabel}.
      </p>

      <div className="chart-visual chart-visual--wide">
        {displayData.length === 0 ? (
          <ChartEmptyState />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData} margin={{ top: 12, right: 12, left: -16, bottom: 4 }}>
              <defs>
                <linearGradient id="analytics-reach-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--analytics-secondary)" stopOpacity={0.26} />
                  <stop offset="100%" stopColor="var(--analytics-secondary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
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
                formatter={(value) => [formatValue(value), activeTab === 'reach' ? 'Tiếp cận' : 'Phản ứng']}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke="var(--analytics-secondary)"
                fill="url(#analytics-reach-gradient)"
                strokeWidth={2.5}
                activeDot={{ r: 5, fill: 'var(--analytics-secondary)', stroke: 'var(--analytics-surface)', strokeWidth: 3 }}
                isAnimationActive
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </article>
  );
};
