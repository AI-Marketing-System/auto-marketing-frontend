import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postApi, topicApi } from '../api/postApi';
import { API_BASE_URL } from '../../../config/env';
import CreatePostModal from '../components/CreatePostModal';
import '../styles/PostModule.css';

export default function TopicPostsPage() {
  const { workspaceId, topicId } = useParams();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [topicDetails, setTopicDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [topicLoading, setTopicLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tab State: 'drafts' (our main work) | 'scheduled' (placeholder)
  const [activeTab, setActiveTab] = useState('drafts');

  // Modal State for Create Post
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Load Topic Details (so we know the Campaign ID and can show breadcrumbs/header)
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

  // Handle post creation submission
  const handleCreatePost = async (modalData) => {
    if (!modalData.content.trim()) return;

    try {
      // Extract hashtags from content if any
      const hashtagRegex = /#(\w+)/g;
      const hashtagsList = [];
      let match;
      while ((match = hashtagRegex.exec(modalData.content)) !== null) {
        hashtagsList.push(match[1]);
      }

      const payload = {
        workspaceId: Number(workspaceId),
        campaignId: topicDetails ? Number(topicDetails.campaignId) : null,
        topicId: Number(topicId),
        title: modalData.content.slice(0, 50).trim() || 'Bài đăng mới',
        content: modalData.content,
        hashtags: hashtagsList,
        generatedByAi: modalData.content.includes('✨') || modalData.content.includes('[AI'),
        aiModel: 'gemini-3.5-flash',
      };

      const res = await postApi.create(payload, API_BASE_URL);
      if (res.success) {
        await loadPosts();
      }
    } catch (err) {
      window.alert(err.message || 'Không thể lưu bài viết. Vui lòng thử lại.');
    }
  };

  // Handle post deletion
  const handleDeletePost = async (postId, e) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xoá bài viết nháp này?')) {
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
        {/* Breadcrumb / Back Link */}
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
              onClick={() => setIsCreateModalOpen(true)}
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

        {/* Custom Tabs to divide Draft posts vs Published/Scheduled posts */}
        <div
          className="campaign-view-toggle"
          style={{ display: 'inline-flex', marginBottom: '24px' }}
        >
          <button
            type="button"
            className={`view-toggle-btn ${activeTab === 'drafts' ? 'active' : ''}`}
            onClick={() => setActiveTab('drafts')}
            style={{ padding: '8px 24px' }}
          >
            Bài viết nháp ({posts.length})
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${activeTab === 'scheduled' ? 'active' : ''}`}
            onClick={() => setActiveTab('scheduled')}
            style={{ padding: '8px 24px' }}
          >
            Lịch đăng & Bài viết đã đăng (0)
          </button>
        </div>

        {/* Tab 1: Drafts List */}
        {activeTab === 'drafts' && (
          <div>
            <h3 className="post-section-title">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Danh sách bài viết nháp
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
            ) : posts.length > 0 ? (
              <div className="posts-container-grid">
                {posts.map((post) => (
                  <div key={post.id} className="post-item-card">
                    <div className="post-item-header">
                      <div className="post-item-meta">
                        <span className={`post-badge ${post.generatedByAi ? 'ai' : 'draft'}`}>
                          {post.generatedByAi ? '✨ Tạo bằng AI' : 'Nháp'}
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

                    <div className="post-item-body">{post.content}</div>

                    {/* Extensible Media Placeholder Section */}
                    <div className="post-media-placeholder">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span>
                        Media (Hình ảnh/Video): chưa được đính kèm (Tính năng đang phát triển)
                      </span>
                    </div>

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
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Viết bài nháp đầu tiên
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Placeholder for Scheduled & Published posts */}
        {activeTab === 'scheduled' && (
          <div className="future-work-placeholder">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6366f1"
              strokeWidth="1.5"
              style={{ marginBottom: '12px' }}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h4
              style={{ fontSize: '16px', fontWeight: '700', color: '#334155', margin: '0 0 6px 0' }}
            >
              Không gian Lên lịch & Đăng bài tự động
            </h4>
            <p
              style={{
                fontSize: '13px',
                color: '#64748b',
                maxWidth: '480px',
                margin: '0 auto 16px auto',
                lineHeight: '1.6',
              }}
            >
              Đây là không gian dành cho phần tính năng đăng bài và xếp lịch lên các kênh mạng xã
              hội (Facebook, YouTube, Tiktok, v.v.). Các nhà phát triển sau sẽ bổ sung logic kết nối
              fanpage và tự động đăng tại đây.
            </p>
          </div>
        )}
      </main>

      {/* Write New Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
        onDraft={handleCreatePost}
      />
    </div>
  );
}
