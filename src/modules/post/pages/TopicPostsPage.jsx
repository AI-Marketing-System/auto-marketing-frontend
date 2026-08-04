import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postApi } from '../api/postApi';
import { topicApi } from '../../topic/api/topicApi';
import { scheduleApi } from '../../schedule/api/scheduleApi';
import { getWorkspaceFanpages } from '../../campaigns/api/workspaceFanpageApi';
import { API_BASE_URL } from '../../../config/env';
import CreatePostModal from '../components/CreatePostModal';
import ScheduleDetailModal from '../../schedule/components/ScheduleDetailModal';
import '../styles/PostModule.css';

// ── Hằng số màu sắc theo trạng thái lịch ──
const STATUS_CONFIG = {
  WAITING:   { label: 'Đang chờ',   color: '#3b82f6', bg: '#dbeafe', dot: '#3b82f6' },
  RUNNING:   { label: 'Đang đăng',  color: '#d97706', bg: '#fef3c7', dot: '#f59e0b' },
  SUCCESS:   { label: 'Thành công', color: '#15803d', bg: '#dcfce7', dot: '#10b981' },
  FAILED:    { label: 'Thất bại',   color: '#b91c1c', bg: '#fee2e2', dot: '#ef4444' },
  CANCELLED: { label: 'Đã hủy',    color: '#475569', bg: '#f1f5f9', dot: '#94a3b8' },
  DELETED:   { label: 'Đã xóa',    color: '#475569', bg: '#f1f5f9', dot: '#94a3b8' },
};

function ScheduleStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: '#475569', bg: '#f1f5f9', dot: '#94a3b8' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
      color: cfg.color, background: cfg.bg,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

function FanpageAvatarList({ targets, fanpagesMap }) {
  if (!targets || targets.length === 0) {
    return <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>Chưa có fanpage</span>;
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
      {targets.map((t) => {
        const fp = fanpagesMap[t.fanpageId];
        const name = fp?.fanpageName || `Fanpage #${t.fanpageId}`;
        const avatar = fp?.fanpageAvatarUrl;
        const tCfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.WAITING;
        return (
          <div key={t.fanpageId || t.id} title={`${name} • ${tCfg.label}`}
            style={{ display: 'flex', alignItems: 'center', gap: '4px',
              background: '#f8fafc', border: `1px solid ${tCfg.bg}`,
              borderRadius: '20px', padding: '2px 8px 2px 4px', fontSize: 12 }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', overflow: 'hidden',
              background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700, color: '#475569', flexShrink: 0,
            }}>
              {avatar
                ? <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : name.slice(0, 2).toUpperCase()}
            </div>
            <span style={{ color: '#334155', fontWeight: 500, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: tCfg.dot, flexShrink: 0 }} />
          </div>
        );
      })}
    </div>
  );
}

export default function TopicPostsPage() {
  const { workspaceId, topicId } = useParams();

  const [posts, setPosts] = useState([]);
  const [topicDetails, setTopicDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [topicLoading, setTopicLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tab State: 'drafts' | 'scheduled'
  const [activeTab, setActiveTab] = useState('drafts');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Schedule List State (Tab Lịch đăng)
  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [fanpages, setFanpages] = useState([]);

  // Schedule Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Map fanpageId → fanpage object
  const fanpagesMap = fanpages.reduce((acc, fp) => {
    acc[fp.fanpageId] = fp;
    return acc;
  }, {});

  // Load Topic Details
  const loadTopicDetails = useCallback(async () => {
    if (!topicId) return;
    setTopicLoading(true);
    try {
      const response = await topicApi.getById(Number(topicId), API_BASE_URL);
      if (response && response.success) {
        setTopicDetails(response.data);
      }
    } catch (err) {
      console.error('Failed to load topic details:', err);
    } finally {
      setTopicLoading(false);
    }
  }, [topicId]);

  // Load Posts of the Topic
  const loadPosts = useCallback(async () => {
    if (!topicId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await postApi.listByTopicId(Number(topicId), API_BASE_URL);
      if (response && response.success) {
        setPosts(response.data || []);
      } else {
        setPosts([]);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách bài viết');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  // Load Schedules by campaignId (khi topicDetails đã có campaignId)
  const loadSchedules = useCallback(async (campaignId) => {
    if (!campaignId) return;
    setSchedulesLoading(true);
    try {
      const res = await scheduleApi.listByCampaign(API_BASE_URL, Number(campaignId));
      const data = Array.isArray(res) ? res : res?.data || [];
      // Lọc chỉ schedule thuộc topic hiện tại
      const filtered = data.filter((sch) => String(sch.topicId) === String(topicId));
      setSchedules(filtered);
    } catch (err) {
      console.error('Failed to load schedules:', err);
    } finally {
      setSchedulesLoading(false);
    }
  }, [topicId]);

  // Load fanpages of workspace
  useEffect(() => {
    if (!workspaceId) return;
    getWorkspaceFanpages(workspaceId)
      .then((list) => setFanpages(list || []))
      .catch(() => {});
  }, [workspaceId]);

  useEffect(() => {
    loadTopicDetails();
    loadPosts();
  }, [loadTopicDetails, loadPosts]);

  // Khi topicDetails load xong, tải schedules theo campaignId
  useEffect(() => {
    if (topicDetails?.campaignId) {
      loadSchedules(topicDetails.campaignId);
    }
  }, [topicDetails?.campaignId, loadSchedules]);

  // Filter posts by status
  const draftPosts = posts.filter((p) => p.status !== 'SCHEDULED' && p.status !== 'PUBLISHED');
  const scheduledPosts = posts.filter((p) => p.status === 'SCHEDULED' || p.status === 'PUBLISHED');

  // Open modal for new post
  const handleOpenCreateNew = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };

  // Open modal for editing an existing post / skeleton post
  const handleOpenEdit = (post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

    const handleSubmitPost = async (modalData) => {
    if (!modalData.content.trim()) return;

    try {
      const extractedTags = [];
      const hashtagRegex = /#(\w+)/g;
      let match;
      while ((match = hashtagRegex.exec(modalData.content)) !== null) {
        extractedTags.push(match[1]);
      }

      const modalTags = (modalData.hashtags || []).map((t) => t.replace(/^#+/, ''));
      const hashtagsList = Array.from(new Set([...modalTags, ...extractedTags])).filter(Boolean);

      const isAiGenerated = modalData.content.includes('✨') || modalData.content.includes('[AI');
      const isScheduled = modalData.scheduleMode === 'schedule' && modalData.scheduledAt;
      const isPublishNow = modalData.scheduleMode === 'now';

      const currentEditPost = editingPost;
      if (currentEditPost) {
        // Update existing post
        await postApi.update(
          currentEditPost.id,
          {
            workspaceId: Number(workspaceId),
            ...currentEditPost,
            title: modalData.content.slice(0, 50).trim() || currentEditPost.title || 'Bài đăng mới',
            content: modalData.content,
            hashtags: hashtagsList,
            status: isScheduled ? 'SCHEDULED' : currentEditPost.status,
          },
          modalData.mediaFiles,
          API_BASE_URL
        );

        if (isScheduled) {
          try {
            await scheduleApi.createSchedule(API_BASE_URL, {
              postId: currentEditPost.id,
              workspaceId: Number(workspaceId),
              publishTime: modalData.scheduledAt,
              fanpageIds: modalData.fanpageIds || [],
            });
          } catch (e) {
            console.warn('Schedule create:', e);
          }
          setActiveTab('scheduled');
        } else if (isPublishNow) {
          try {
            await scheduleApi.publishImmediately(API_BASE_URL, {
              postId: currentEditPost.id,
              fanpageIds: modalData.fanpageIds || [],
            });
            window.alert('Bài viết đang được đăng ngay lên các Fanpage đã chọn!');
          } catch (e) {
            console.error('Publish immediately fail:', e);
            window.alert('Đăng bài thất bại: ' + (e.message || 'Lỗi hệ thống'));
          }
          setActiveTab('scheduled');
        }
      } else {
        // Create new post
        const payload = {
          workspaceId: Number(workspaceId),
          campaignId: topicDetails ? Number(topicDetails.campaignId) : null,
          topicId: Number(topicId),
          title: modalData.content.slice(0, 50).trim() || 'Bài đăng mới',
          content: modalData.content,
          hashtags: hashtagsList,
          status: isScheduled ? 'SCHEDULED' : 'DRAFT',
          generatedByAi: isAiGenerated,
          aiModel: isAiGenerated ? 'gemini-3.5-flash' : null,
        };

        const res = await postApi.create(payload, modalData.mediaFiles, API_BASE_URL);
        if (res.success && res.data?.id) {
          const newPostId = res.data.id;
          if (isScheduled) {
            try {
              await scheduleApi.createSchedule(API_BASE_URL, {
                postId: newPostId,
                workspaceId: Number(workspaceId),
                publishTime: modalData.scheduledAt,
                fanpageIds: modalData.fanpageIds || [],
              });
            } catch (e) {
              console.warn('Schedule create:', e);
            }
            setActiveTab('scheduled');
          } else if (isPublishNow) {
            try {
              await scheduleApi.publishImmediately(API_BASE_URL, {
                postId: newPostId,
                fanpageIds: modalData.fanpageIds || [],
              });
              window.alert('Bài viết đang được đăng ngay lên các Fanpage đã chọn!');
            } catch (e) {
              console.error('Publish immediately fail:', e);
              window.alert('Đăng bài thất bại: ' + (e.message || 'Lỗi hệ thống'));
            }
            setActiveTab('scheduled');
          }
        }
      }

      await loadPosts();
      if (topicDetails?.campaignId) {
        loadSchedules(topicDetails.campaignId);
      }
    } catch (err) {
      window.alert(err.message || 'Không thể lưu bài viết. Vui lòng thử lại.');
      throw err;
    }
  };
  // Draft save from CreatePostModal (Lưu nháp)
  const handleDraftPost = async (modalData) => {
    if (!modalData.content.trim()) return;

    try {
      const extractedTags = [];
      const hashtagRegex = /#(\w+)/g;
      let match;
      while ((match = hashtagRegex.exec(modalData.content)) !== null) {
        extractedTags.push(match[1]);
      }

      const modalTags = (modalData.hashtags || []).map((t) => t.replace(/^#+/, ''));
      const hashtagsList = Array.from(new Set([...modalTags, ...extractedTags])).filter(Boolean);

      const currentEditPost = editingPost;
      if (currentEditPost) {
        await postApi.update(
          currentEditPost.id,
          {
            workspaceId: Number(workspaceId),
            ...currentEditPost,
            title: modalData.content.slice(0, 50).trim() || currentEditPost.title || 'Bài đăng mới',
            content: modalData.content,
            hashtags: hashtagsList,
            status: 'DRAFT',
          },
          modalData.mediaFiles,
          API_BASE_URL
        );
      } else {
        const payload = {
          workspaceId: Number(workspaceId),
          campaignId: topicDetails ? Number(topicDetails.campaignId) : null,
          topicId: Number(topicId),
          title: modalData.content.slice(0, 50).trim() || 'Bài đăng mới',
          content: modalData.content,
          hashtags: hashtagsList,
          status: 'DRAFT',
          generatedByAi: false,
        };
        await postApi.create(payload, modalData.mediaFiles, API_BASE_URL);
      }

      await loadPosts();
    } catch (err) {
      window.alert(err.message || 'Không thể lưu nháp bài viết.');
      throw err;
    }
  };

  // Handle post deletion
  const handleDeletePost = async (postId, e) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xoá bài viết này?')) {
      try {
        await postApi.delete(postId, API_BASE_URL);
        await loadPosts();
      } catch (err) {
        window.alert(err.message || 'Không thể xoá bài viết');
      }
    }
  };

  return (
    <div className="campaign-page-container">
      <main className="campaign-main-content">
        {/* Breadcrumbs */}
        <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
          {topicDetails && (
            <Link
              to={`/workspaces/${workspaceId}/campaigns/${topicDetails.campaignId}/topics`}
              className="topic-enter-btn"
              style={{ display: 'inline-flex', width: 'auto' }}
            >
              ← Quay lại danh sách Topic
            </Link>
          )}
        </div>

        {/* Hero Section */}
        <section className="campaign-hero-panel">
          <div className="campaign-hero-copy">
            <span className="workspace-label">
              Nhóm chủ đề {topicLoading ? '' : `• ${topicDetails?.title}`}
            </span>
            <h1 className="workspace-title-main" style={{ margin: '8px 0' }}>
              {topicLoading ? 'Đang tải thông tin topic...' : `Topic: ${topicDetails?.title}`}
            </h1>
            <p className="campaign-hero-subtitle">
              {topicDetails?.description ||
                'Quản lý, tạo nội dung nháp hoặc lên lịch đăng bài cho chủ đề này.'}
            </p>
          </div>
          <div className="title-right">
            <button
              type="button"
              className="btn-create-campaign"
              onClick={handleOpenCreateNew}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Viết bài mới
            </button>
          </div>
        </section>

        {/* View Toggles */}
        <div className="campaign-view-toggle" style={{ display: 'inline-flex', marginBottom: '24px' }}>
          <button
            type="button"
            className={`view-toggle-btn ${activeTab === 'drafts' ? 'active' : ''}`}
            onClick={() => setActiveTab('drafts')}
            style={{ padding: '8px 24px' }}
          >
            Bài viết nháp ({draftPosts.length})
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${activeTab === 'scheduled' ? 'active' : ''}`}
            onClick={() => setActiveTab('scheduled')}
            style={{ padding: '8px 24px' }}
          >
            Lịch đăng & Bài viết đã đăng ({schedules.length})
          </button>
        </div>

        {/* TAB 1: Draft Posts */}
        {activeTab === 'drafts' && (
          <div>
            <h3 className="post-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              DANH SÁCH BÀI VIẾT NHÁP
            </h3>

            {loading ? (
              <div className="empty-campaigns-state loading-state">
                <div className="loading-spinner" />
                <p className="empty-text">Đang tải danh sách bài viết...</p>
              </div>
            ) : error ? (
              <div className="empty-campaigns-state">
                <p className="empty-text">Lỗi: {error}</p>
                <button type="button" className="btn-create-campaign" onClick={loadPosts}>
                  Thử lại
                </button>
              </div>
            ) : draftPosts.length > 0 ? (
              <div className="posts-container-grid">
                {draftPosts.map((post) => (
                  <div
                    key={post.id}
                    className="post-item-card"
                    onClick={() => handleOpenEdit(post)}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    <div className="post-item-header">
                      <div className="post-item-meta">
                        <span className={`post-badge ${post.generatedByAi ? 'ai' : 'draft'}`}>
                          {post.generatedByAi ? '✨ Tạo bằng AI (Skeleton)' : 'Nháp'}
                        </span>
                        {post.aiModel && post.generatedByAi && (
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            Model: {post.aiModel}
                          </span>
                        )}
                        <span className="post-item-date">
                          Cập nhật: {new Date(post.createdAt || Date.now()).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <div className="post-item-actions">
                        <button
                          type="button"
                          className="post-btn-action delete-btn"
                          onClick={(e) => handleDeletePost(post.id, e)}
                          title="Xoá nháp"
                        >
                          Xoá
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="post-item-body" style={{ whiteSpace: 'pre-line' }}>
                      {post.content}
                    </div>

                    {/* Extensible Media Gallery / Placeholder */}
                    {post.medias && post.medias.length > 0 ? (
                      <div className="post-media-grid" onClick={(e) => e.stopPropagation()}>
                        {post.medias.map((m) => (
                          <div key={m.id || m.url} className="post-media-item">
                            {m.type === 'VIDEO' ? (
                              <video src={m.url} controls className="post-media-video" />
                            ) : (
                              <img src={m.url} alt="Post media" className="post-media-img" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="post-media-placeholder">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span>Media (Hình ảnh/Video): chưa được đính kèm (Nhấp để chỉnh sửa)</span>
                      </div>
                    )}

                    {/* Hashtags */}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="post-item-hashtags">
                        {post.hashtags.map((tag, idx) => (
                          <span key={idx} className="hashtag-pill">
                            #{tag.replace(/^#+/, '')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-campaigns-state">
                <div className="empty-state-icon">📝</div>
                <p className="empty-text">Topic này chưa có bài viết nháp nào.</p>
                <button
                  type="button"
                  className="btn-create-campaign"
                  onClick={handleOpenCreateNew}
                >
                  Viết bài nháp đầu tiên
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Schedule List (gọi API schedules thực sự) */}
        {activeTab === 'scheduled' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 className="post-section-title" style={{ marginBottom: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                DANH SÁCH LỊCH ĐĂNG BÀI
              </h3>
              <button
                type="button"
                onClick={() => topicDetails?.campaignId && loadSchedules(topicDetails.campaignId)}
                style={{
                  background: 'none', border: '1px solid #e2e8f0', borderRadius: 8,
                  padding: '6px 12px', fontSize: 12, color: '#64748b', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                Làm mới
              </button>
            </div>

            {schedulesLoading ? (
              <div className="empty-campaigns-state loading-state">
                <div className="loading-spinner" />
                <p className="empty-text">Đang tải danh sách lịch đăng...</p>
              </div>
            ) : schedules.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                {schedules.map((sch) => {
                  const statusCfg = STATUS_CONFIG[sch.status] || STATUS_CONFIG.WAITING;
                  let publishDate = sch.publishTime;
                  if (typeof publishDate === 'string' && !publishDate.endsWith('Z') && !publishDate.includes('+')) {
                    publishDate += 'Z';
                  }
                  const dateObj = publishDate ? new Date(publishDate) : null;
                  const dateFormatted = dateObj
                    ? dateObj.toLocaleString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : '—';
                  return (
                    <div
                      key={sch.scheduleId}
                      onClick={() => {
                        setSelectedSchedule({
                          id: sch.scheduleId,
                          postTitle: sch.postTitle,
                          postContent: sch.postContent,
                          publishTime: sch.publishTime,
                          status: sch.status,
                        });
                        setShowDetailModal(true);
                      }}
                      style={{
                        background: '#fff',
                        border: `1.5px solid ${sch.status === 'WAITING' ? '#bfdbfe' : sch.status === 'SUCCESS' ? '#bbf7d0' : sch.status === 'FAILED' ? '#fecaca' : '#e2e8f0'}`,
                        borderLeft: `4px solid ${statusCfg.dot}`,
                        borderRadius: 12,
                        padding: '16px 20px',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}
                    >
                      {/* Row 1: Tiêu đề + Badge trạng thái */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {sch.postTitle || '(Không có tiêu đề)'}
                          </p>
                        </div>
                        <ScheduleStatusBadge status={sch.status} />
                      </div>

                      {/* Row 2: Nội dung bài viết (preview ngắn) */}
                      {sch.postContent && (
                        <p style={{ margin: '0 0 10px 0', fontSize: 13, color: '#475569', lineHeight: 1.5,
                          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {sch.postContent}
                        </p>
                      )}

                      {/* Row 3: Thời gian + Fanpage */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span style={{ fontWeight: 500, color: '#334155' }}>{dateFormatted}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#94a3b8', flexShrink: 0 }}>
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                          <FanpageAvatarList targets={sch.targets || []} fanpagesMap={fanpagesMap} />
                        </div>
                      </div>

                      {/* Row 4: Click hint */}
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, fontSize: 11, color: '#94a3b8' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="16" />
                          <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                        Nhấp để xem chi tiết & quản lý
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-campaigns-state">
                <div className="empty-state-icon">📅</div>
                <p className="empty-text">Chưa có lịch đăng bài nào cho chủ đề này.</p>
                <p style={{ fontSize: 13, color: '#64748b' }}>
                  Nhấp vào bài viết nháp ở Tab <strong>Bài viết nháp</strong> để mở popup chỉnh sửa, hoàn thiện và đặt lịch hẹn!
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Official Project Post Creation & Edit Modal */}
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPost(null);
        }}
        onSubmit={handleSubmitPost}
        onDraft={handleDraftPost}
        workspaceId={workspaceId}
        topicId={topicId}
        initialData={editingPost}
        brandTone={topicDetails?.brandTone || topicDetails?.workspaceBrandTone}
      />

      {/* Schedule Detail Modal (tái sử dụng từ workspace schedule view) */}
      <ScheduleDetailModal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedSchedule(null); }}
        schedule={selectedSchedule}
        workspaceId={workspaceId}
        onSuccess={() => topicDetails?.campaignId && loadSchedules(topicDetails.campaignId)}
      />
    </div>
  );
}
