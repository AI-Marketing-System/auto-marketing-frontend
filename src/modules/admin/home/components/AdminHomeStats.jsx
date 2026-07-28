import React from 'react';
import '../styles/AdminHomeStats.css';

const adminHighlights = [
    { label: 'Tổng số Users', value: '248', trend: '+12% tháng này', trendUp: true },
    { label: 'Gói Plans Active', value: '12', trend: 'Ổn định', trendUp: true },
    { label: 'Giao dịch (30 ngày)', value: '86', trend: '+5% tháng này', trendUp: true },
    { label: 'Cảnh báo hệ thống', value: '2', trend: 'Cần xử lý ngay', trendUp: false },
];

function AdminHomeStats() {
    return (
        <section className="admin-home-stats">
            {adminHighlights.map((item) => (
                <div key={item.label} className="admin-home-stat-card">
                    <span className="admin-home-stat-card__label">{item.label}</span>
                    <strong className="admin-home-stat-card__value">{item.value}</strong>
                    <span className={`admin-home-stat-card__trend ${item.trendUp ? 'is-positive' : 'is-negative'}`}>
            {item.trend}
          </span>
                </div>
            ))}
        </section>
    );
}

export default AdminHomeStats;