import React from 'react';

function PlanHero({ stats }) {
  return (
    <section className="plan-hero">
      <div>
        <p className="plan-hero__eyebrow">Admin / Subscription Plans</p>
        <h1 className="plan-hero__title">Quản lý gói dịch vụ</h1>
        <p className="plan-hero__subtitle">
          Xem, lọc, tạo mới, chỉnh sửa và tạm ngưng các plan subscription ngay trong một màn hình.
        </p>
      </div>

      <div className="plan-stats">
        <article className="plan-stat-card">
          <span className="plan-stat-card__label">Tổng plan</span>
          <strong className="plan-stat-card__value">{stats.total}</strong>
        </article>
        <article className="plan-stat-card">
          <span className="plan-stat-card__label">Đang hoạt động</span>
          <strong className="plan-stat-card__value">{stats.activeCount}</strong>
        </article>
        <article className="plan-stat-card">
          <span className="plan-stat-card__label">Tạm ngưng</span>
          <strong className="plan-stat-card__value">{stats.inactiveCount}</strong>
        </article>
        <article className="plan-stat-card">
          <span className="plan-stat-card__label">Workspace max</span>
          <strong className="plan-stat-card__value">{stats.maxWorkspaces}</strong>
        </article>
      </div>
    </section>
  );
}

export default PlanHero;
