import React from 'react';
import { formatCurrency, formatDate, getInitials } from '../utils/planHelpers';

function PlanPlansTable({ plans, selectedPlanId, onSelectPlan, onEditPlan, onDeletePlan, isBusy }) {
  return (
    <div className="plan-table-card">
      <div className="plan-table-card__header">
        <div>
          <h2 className="plan-section-title">Danh sách plan</h2>
          <p className="plan-section-subtitle">{plans.length} kết quả</p>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="plan-empty-state">Không có plan nào phù hợp.</div>
      ) : (
        <div className="plan-table-scroll">
          <table className="plan-table">
            <thead>
              <tr>
                <th>Tên plan</th>
                <th>Giá</th>
                <th>Chu kỳ</th>
                <th>Giới hạn</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr
                  key={plan.id}
                  className={selectedPlanId === plan.id ? 'is-selected' : ''}
                  onClick={() => onSelectPlan(plan.id)}
                >
                  <td>
                    <div className="plan-name-cell">
                      <div className="plan-avatar">{getInitials(plan.name)}</div>
                      <div>
                        <div className="plan-name">{plan.name}</div>
                        <div className="plan-description">{plan.description || 'Không có mô tả'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{formatCurrency(plan.price)}</td>
                  <td>{plan.billingCycleDays} ngày</td>
                  <td>
                    <div className="plan-limit-list">
                      <span>{plan.maxWorkspaces} WS</span>
                      <span>{plan.maxSocialAccounts} MXH</span>
                      <span>{plan.aiTokenLimit} AI</span>
                    </div>
                  </td>
                  <td>
                    <span className={`plan-status ${plan.isActive ? 'is-active' : 'is-inactive'}`}>
                      {plan.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                    </span>
                  </td>
                  <td>{formatDate(plan.createdAt)}</td>
                  <td>
                    <div className="plan-row-actions">
                      <button
                        type="button"
                        className="plan-action-link"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEditPlan(plan);
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="plan-action-link danger"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeletePlan(plan);
                        }}
                        disabled={isBusy}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PlanPlansTable;
