import React from 'react';

function PlanToolbar({ search, onSearchChange, statusFilter, onStatusFilterChange, sortBy, onSortByChange }) {
  return (
    <section className="plan-toolbar">
      <label className="plan-search">
        <span className="sr-only">Tìm plan</span>
        <input
          className="plan-input"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm theo tên, mô tả, giá..."
        />
      </label>

      <select
        className="plan-select"
        value={statusFilter}
        onChange={(event) => onStatusFilterChange(event.target.value)}
      >
        <option value="all">Tất cả trạng thái</option>
        <option value="active">Đang hoạt động</option>
        <option value="inactive">Tạm ngưng</option>
      </select>

      <select className="plan-select" value={sortBy} onChange={(event) => onSortByChange(event.target.value)}>
        <option value="createdAt-desc">Mới nhất</option>
        <option value="price-asc">Giá tăng dần</option>
        <option value="price-desc">Giá giảm dần</option>
        <option value="name-asc">Tên A-Z</option>
      </select>
    </section>
  );
}

export default PlanToolbar;
