import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { getStatusPillClassName, mapStatusToLabel } from '../utils/campaignUtils';
import CampaignActions from './CampaignActions';
import { useCampaignPostStats } from '../hooks/useCampaignPostStats';

function CampaignCard({ campaign, onAction, actionPendingId, actionPendingAction }) {
  const displayStatus = campaign.statusLabel || mapStatusToLabel(campaign.rawStatus);
  const statusClass = getStatusPillClassName(campaign.rawStatus);
  const { workspaceId } = useParams();

  const { stats, loading } = useCampaignPostStats(campaign.id);

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

      {stats && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid #f1f5f9', marginTop: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>Tiến độ nội dung:</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#3b82f6' }}>{stats.completionRate}%</span>
          </div>
          <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', background: '#3b82f6', width: `${stats.completionRate}%`, transition: 'width 0.3s ease' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, fontSize: 11, color: '#64748b' }}>
            <span title="Đã đăng">{stats.publishedCount} đã đăng</span>•
            <span title="Lên lịch">{stats.scheduledCount} lên lịch</span>•
            <span title="Bản nháp">{stats.draftCount} nháp</span>
          </div>
          {stats.hasOverdueDraft && (
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, color: '#ef4444', fontSize: 11, fontWeight: 500, padding: '4px 8px', background: '#fee2e2', borderRadius: 4 }}>
              ⚠️ Có bài viết bị bỏ quên (quá hạn)
            </div>
          )}
        </div>
      )}

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
