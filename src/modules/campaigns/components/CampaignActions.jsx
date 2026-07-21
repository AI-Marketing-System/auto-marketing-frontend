import React from 'react';
import { CAMPAIGN_STATUS } from '../utils/campaignUtils';

const ACTION_LABELS = {
  pause: { idle: 'Tạm dừng', pending: 'Đang xử lý...' },
  resume: { idle: 'Tiếp tục', pending: 'Đang xử lý...' },
  complete: { idle: 'Hoàn thành', pending: 'Đang xử lý...' },
};

function CampaignActions({ campaign, pendingId, pendingAction, onAction, compact = false }) {
  const isPending = pendingId === campaign.id;
  const isCompleted = campaign.rawStatus === CAMPAIGN_STATUS.COMPLETED;
  const isActive = campaign.rawStatus === CAMPAIGN_STATUS.ACTIVE;
  const isPaused = campaign.rawStatus === CAMPAIGN_STATUS.PAUSED;

  const renderButton = (action, className) => {
    const labels = ACTION_LABELS[action];
    const showPending = isPending && pendingAction === action;

    return (
      <button
        type="button"
        className={`campaign-action-btn ${className}${compact ? ' compact' : ''}`}
        onClick={() => onAction(campaign, action)}
        disabled={isPending}
      >
        {showPending ? labels.pending : labels.idle}
      </button>
    );
  };

  if (isCompleted) {
    return <span className="campaign-action-muted">Đã kết thúc</span>;
  }

  return (
    <div className={`campaign-action-group${compact ? ' compact' : ''}`}>
      {isActive ? renderButton('pause', 'pause') : null}
      {isPaused ? renderButton('resume', 'resume') : null}
      {renderButton('complete', 'complete')}
    </div>
  );
}

export default CampaignActions;
