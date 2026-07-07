import React from 'react';
import Brand from '../../../../public-site/components/Brand';

function PlanHeader({ onRefresh, onCreatePlan, onBackToDashboard }) {
    return (
        <header className="plan-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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