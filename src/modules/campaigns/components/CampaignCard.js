import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { getStatusPillClassName, mapStatusToLabel } from '../utils/campaignUtils';
import CampaignActions from './CampaignActions';

function CampaignCard({ campaign, onAction, actionPendingId, actionPendingAction }) {
  const displayStatus = campaign.statusLabel || mapStatusToLabel(campaign.rawStatus);
  const statusClass = getStatusPillClassName(campaign.rawStatus);
  const { workspaceId } = useParams();

  return (
    <article className="campaign-card">
      <Link to={`/workspaces/${workspaceId || campaign.workspaceId}/campaigns/${campaign.id}/topics`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="campaign-card-top">
          <div className="campaign-card-header">
            <div
              className="campaign-initials"
              style={{ backgroundColor: campaign.initialsBg, color: campaign.initialsColor }}
            >
              {campaign.initials}
            </div>
            <span className={statusClass}>{displayStatus}</span>
          </div>

          <div className="campaign-card-body">
            <h3 className="campaign-title">{campaign.title}</h3>
            {campaign.description ? <p className="campaign-card-description">{campaign.description}</p> : null}
            <span className="campaign-daterange">{campaign.dateRange}</span>
          </div>
        </div>
      </Link>

      <div className="campaign-card-meta-row">
        <div className="campaign-creator-chip">
          <span className="campaign-creator-avatar">{campaign.creatorInitials || '?'}</span>
          <span className="campaign-creator-name">{campaign.creatorName || 'Không rõ'}</span>
        </div>
        <div className="campaign-card-footer">
          <span className="campaign-meta-item">{campaign.topicsCount} topic</span>
          <span className="campaign-meta-item">{campaign.postsCount} bài viết</span>
        </div>
      </div>

      {onAction ? (
        <div className="campaign-card-actions">
          <CampaignActions
            campaign={campaign}
            pendingId={actionPendingId}
            pendingAction={actionPendingAction}
            onAction={onAction}
            compact
          />
        </div>
      ) : null}
    </article>
  );
}

export default CampaignCard;
