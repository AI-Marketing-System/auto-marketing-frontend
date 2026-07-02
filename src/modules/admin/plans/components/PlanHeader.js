import React from 'react';
import Brand from '../../../../public-site/components/Brand';

function PlanHeader({ onRefresh, onCreatePlan }) {
  return (
    <header className="plan-header">
      <Brand className="plan-brand" textClassName="brand-name" />

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
