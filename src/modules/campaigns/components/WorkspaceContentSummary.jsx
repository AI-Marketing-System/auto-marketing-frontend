import React from 'react';
import { useWorkspacePostStats } from '../hooks/useWorkspacePostStats';

const WorkspaceContentSummary = ({ workspaceId }) => {
  const { stats, loading, error } = useWorkspacePostStats(workspaceId);

  if (loading) return null;
  if (error || !stats) return null;

  return (
    <div style={{
      background: '#fff',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '24px'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginTop: 0, marginBottom: '20px' }}>
        📊 Tổng quan kế hoạch nội dung Workspace
      </h3>
      
      <div style={{ display: 'flex', gap: '48px', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Tổng bài viết</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>{stats.totalPosts}</div>
        </div>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Đã đăng</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>{stats.publishedCount}</div>
        </div>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Lên lịch</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6' }}>{stats.scheduledCount}</div>
        </div>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Còn nháp</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>{stats.draftCount}</div>
        </div>
      </div>

      {stats.campaignsWithOverdue > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#fef2f2',
          padding: '12px 16px',
          borderRadius: '8px',
          color: '#b91c1c',
          fontSize: '14px',
          fontWeight: 500
        }}>
          ⚠️ Có {stats.campaignsWithOverdue} chiến dịch đang có bài viết bị bỏ quên (quá hạn lên lịch)
        </div>
      )}
    </div>
  );
};

export default WorkspaceContentSummary;
