import React from 'react';
import { Link } from 'react-router-dom';
import { SparkleIcon, ArrowLeftIcon } from './PlannerIcons';

function StagePageHeader({ workspaceId }) {
  return (
    <header className="sp-header">
      <div className="sp-header-left">
        <div className="sp-header-icon">
          <SparkleIcon size={22} />
        </div>
        <div>
          <h1 className="sp-header-title">AI Workspace Marketing Planner</h1>
          <p className="sp-header-subtitle">Quy trình sinh kế hoạch Marketing từng bước tự động</p>
        </div>
      </div>
      {/* <div className="sp-header-actions">
        <Link className="sp-btn sp-btn--ghost sp-btn--sm" to={`/workspaces/${workspaceId}/planner`}>
          <ArrowLeftIcon size={14} /> Phân tích nhanh
        </Link>
      </div> */}
    </header>
  );
}

export default StagePageHeader;
