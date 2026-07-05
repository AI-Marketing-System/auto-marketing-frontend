import React from 'react';
import { formatCurrency, formatDate, getInitials } from '../utils/planHelpers';

function PlanDetailPanel({ plan, onEditPlan }) {
  return (
    <aside className="plan-detail-card">
      <div className="plan-detail-card__header">
        <h2 className="plan-section-title">Chi tiết plan</h2>
        <button
          type="button"
          className="plan-button plan-button--ghost plan-button--sm"
          onClick={() => onEditPlan(plan)}
          disabled={!plan}
        >
          Chỉnh sửa
        </button>
      </div>

      {plan ? (
        <div className="plan-detail">
          <div className="plan-detail__hero">
            <div className="plan-avatar plan-avatar--lg">{getInitials(plan.name)}</div>
            <div>
              <h3 className="plan-detail__title">{plan.name}</h3>
              <p className="plan-detail__meta">{plan.description || 'Không có mô tả'}</p>
            </div>
          </div>

          <dl className="plan-detail-list">
            <div>
              <dt>Giá</dt>
              <dd>{formatCurrency(plan.price)}</dd>
            </div>
            <div>
              <dt>Chu kỳ tính phí</dt>
              <dd>{plan.billingCycleDays} ngày</dd>
            </div>
            <div>
              <dt>Workspace tối đa</dt>
              <dd>{plan.maxWorkspaces}</dd>
            </div>
            <div>
              <dt>Social accounts tối đa</dt>
              <dd>{plan.maxSocialAccounts}</dd>
            </div>
            <div>
              <dt>AI token limit</dt>
              <dd>{plan.aiTokenLimit}</dd>
            </div>
            <div>
              <dt>Trạng thái</dt>
              <dd>{plan.isActive ? 'Hoạt động' : 'Tạm ngưng'}</dd>
            </div>
            <div>
              <dt>Created at</dt>
              <dd>{formatDate(plan.createdAt)}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <div className="plan-empty-state">Chọn một plan để xem chi tiết.</div>
      )}
    </aside>
  );
}

export default PlanDetailPanel;
