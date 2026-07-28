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
                                // Component đã có class is-selected, bạn chỉ cần CSS cho nó
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
                                    {/* Tối ưu UX: Chuyển giới hạn thành hàng ngang để tiết kiệm chiều dọc */}
                                    <div className="plan-limit-list" style={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                                        <span title="Workspace tối đa">{plan.maxWorkspaces} WS</span> &bull;{' '}
                                        <span title="Social accounts tối đa">{plan.maxSocialAccounts} MXH</span> &bull;{' '}
                                        <span title="AI Token">
                        {plan.aiTokenLimit >= 1000 ? `${plan.aiTokenLimit / 1000}k` : plan.aiTokenLimit} AI
                      </span>
                                    </div>
                                </td>
                                <td>
                    <span className={`plan-status ${plan.isActive ? 'is-active' : 'is-inactive'}`}>
                      {plan.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                    </span>
                                </td>
                                {/* Tối ưu UX: Xử lý trường hợp null data */}
                                <td>{plan.createdAt ? formatDate(plan.createdAt) : <span style={{ opacity: 0.5 }}>Chưa cập nhật</span>}</td>
                                <td>
                                    <div className="plan-row-actions" style={{ display: 'flex', gap: '12px' }}>
                                        {/* Tối ưu UX: Dùng Icon thay cho text */}
                                        <button
                                            type="button"
                                            className="plan-action-icon"
                                            title="Chỉnh sửa"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onEditPlan(plan);
                                            }}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            className="plan-action-icon danger"
                                            title="Xóa"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onDeletePlan(plan);
                                            }}
                                            disabled={isBusy}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                                <line x1="14" y1="11" x2="14" y2="17"></line>
                                            </svg>
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