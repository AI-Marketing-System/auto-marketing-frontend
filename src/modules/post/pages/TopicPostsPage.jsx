import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postApi } from '../api/postApi';
import { topicApi } from '../../topic/api/topicApi';
import { scheduleApi } from '../../schedule/api/scheduleApi';
import { API_BASE_URL } from '../../../config/env';
import CreatePostModal from '../components/CreatePostModal';
import '../styles/PostModule.css';

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

  useEffect(() => {
    loadTopicDetails();
    loadPosts();
  }, [loadTopicDetails, loadPosts]);

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

  // Submit from CreatePostModal (Hoàn tất & Lên lịch)
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
              fanpageIds: [],
            });
          } catch (e) {
            console.warn('Schedule create:', e);
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
        if (res.success && isScheduled && res.data?.id) {
          try {
            await scheduleApi.createSchedule(API_BASE_URL, {
              postId: res.data.id,
              workspaceId: Number(workspaceId),
              publishTime: modalData.scheduledAt,
              fanpageIds: [],
            });
          } catch (e) {
            console.warn('Schedule create:', e);
          }
          setActiveTab('scheduled');
        }
      }

      await loadPosts();
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
            Lịch đăng & Bài viết đã đăng ({scheduledPosts.length})
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
                            #{tag}
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

        {/* TAB 2: Scheduled & Published Posts */}
        {activeTab === 'scheduled' && (
          <div>
            <h3 className="post-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              DANH SÁCH BÀI VIẾT ĐÃ ĐẶT LỊCH
            </h3>

            {scheduledPosts.length > 0 ? (
              <div className="posts-container-grid">
                {scheduledPosts.map((post) => (
                  <div key={post.id} className="post-item-card" style={{ borderColor: '#818cf8', background: '#f8fafc' }}>
                    <div className="post-item-header">
                      <div className="post-item-meta">
                        <span className="post-badge" style={{ background: '#dcfce7', color: '#15803d' }}>
                          🟢 Đã lên lịch đăng
                        </span>
                        <span className="post-item-date">
                          Lịch hẹn: {new Date(post.updatedAt || Date.now()).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                    <div className="post-item-body" style={{ fontWeight: 600, color: '#1e293b' }}>
                      {post.title}
                    </div>
                    <div className="post-item-body" style={{ whiteSpace: 'pre-line', fontSize: 13 }}>
                      {post.content}
                    </div>

                    {post.medias && post.medias.length > 0 && (
                      <div className="post-media-grid" style={{ marginTop: '10px' }}>
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
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-campaigns-state">
                <div className="empty-state-icon">📅</div>
                <p className="empty-text">Chưa có bài viết nào được lên lịch cho chủ đề này.</p>
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
        topicId={topicId}
        initialData={editingPost}
        brandTone={topicDetails?.brandTone || topicDetails?.workspaceBrandTone}
      />
    </div>
  );
}
