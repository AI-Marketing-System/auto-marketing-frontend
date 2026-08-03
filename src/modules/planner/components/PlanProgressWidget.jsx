import React from 'react';
import { FileTextIcon, SparkleIcon } from './PlannerIcons';

/**
 * PlanProgressWidget - Component hiển thị Tiến trình Kế hoạch & Danh sách Bài viết Skeleton cần làm.
 */
export default function PlanProgressWidget({ posts = [], onOpenCreator }) {
  if (!posts || posts.length === 0) return null;

  const total = posts.length;
  const scheduledCount = posts.filter((p) => p.status === 'SCHEDULED' || p.status === 'PUBLISHED').length;
  const draftCount = posts.filter((p) => p.status === 'DRAFT' && p.content && p.content.length > 100).length;
  const pendingSkeletons = posts.filter((p) => p.status === 'DRAFT' && (!p.content || p.content.length <= 100));

  const progressPercent = Math.round((scheduledCount / total) * 100);

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: 24,
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
            📊 Tiến Trình Kế Hoạch Marketing
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            Theo dõi tỷ lệ hoàn tất các bài viết Skeleton được khởi tạo từ AI Planner
          </p>
        </div>
        <span
          style={{
            background: progressPercent === 100 ? '#dcfce7' : '#eff6ff',
            color: progressPercent === 100 ? '#15803d' : '#1d4ed8',
            fontSize: 14,
            fontWeight: 700,
            padding: '6px 14px',
            borderRadius: 20,
          }}
        >
          {progressPercent}% Hoàn thành ({scheduledCount}/{total} bài)
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ background: '#e2e8f0', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 20 }}>
        <div
          style={{
            background: 'linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)',
            height: '100%',
            width: `${progressPercent}%`,
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      {/* Badges Overview */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1, background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>🟢 Đã lên lịch đăng</span>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{scheduledCount} bài</div>
        </div>
        <div style={{ flex: 1, background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>🔵 Đang soạn nội dung</span>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{draftCount} bài</div>
        </div>
        <div style={{ flex: 1, background: '#fffbeb', padding: 12, borderRadius: 8, border: '1px solid #fde68a' }}>
          <span style={{ fontSize: 12, color: '#b45309' }}>🟡 Chờ tạo bài từ Brief</span>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#92400e', marginTop: 2 }}>{pendingSkeletons.length} bài</div>
        </div>
      </div>

      {/* Skeleton To-Do List */}
      {pendingSkeletons.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#334155' }}>
            📝 Danh sách Bài viết Skeleton cần soạn nội dung:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingSkeletons.map((post) => (
              <div
                key={post.id}
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileTextIcon size={14} style={{ color: '#6366f1' }} />
                    {post.title || 'Bài viết mới'}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    Brief: {post.content ? (post.content.length > 60 ? post.content.substring(0, 60) + '...' : post.content) : 'Chưa có brief'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenCreator && onOpenCreator(post)}
                  style={{
                    background: '#6366f1',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 14px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <SparkleIcon size={14} /> ✨ Soạn bài ngay
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
