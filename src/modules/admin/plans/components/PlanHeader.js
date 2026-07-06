import React from 'react';
import Brand from '../../../../public-site/components/Brand';

function PlanHeader({ onRefresh, onCreatePlan, onBackToDashboard }) {
    return (
        <header className="plan-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

            {/* Nhóm Logo và Nút Back bên trái */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    onClick={onBackToDashboard}
                    className="plan-button plan-button--ghost plan-button--icon-only"
                    title="Quay lại Admin Dashboard"
                    style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5"></path>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>

                <Brand className="plan-brand" textClassName="brand-name" />
            </div>

            <div className="plan-header__actions">
                <button type="button" className="plan-button plan-button--ghost" onClick={onRefresh}>
                    Làm mới
                </button>
                <button type="button" className="plan-button plan-button--primary" onClick={onCreatePlan}>
                    Tạo plan
                </button>
            </div>
        </header>
    );
}

export default PlanHeader;