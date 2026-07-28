import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { topicApi } from '../api/postApi';
import { campaignApi, parsePaginatedResponse } from '../../campaigns/api/campaignApi';
import { mapCampaignFromApi } from '../../campaigns/utils/campaignUtils';
import { API_BASE_URL } from '../../../config/env';
import '../styles/PostModule.css';

export default function CampaignTopicsPage() {
  const { workspaceId, campaignId } = useParams();
  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [titleInput, setTitleInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load Campaign details
  const loadCampaignDetails = useCallback(async () => {
    if (!campaignId) return;
    setCampaignLoading(true);
    try {
      const response = await campaignApi.list(API_BASE_URL, {
        workspaceId: workspaceId ? Number(workspaceId) : undefined,
        page: 0,
        size: 100,
      });
      const { content } = parsePaginatedResponse(response, 0, 100);
      const mapped = content.map(mapCampaignFromApi);
      const found = mapped.find(c => String(c.id) === String(campaignId));
      if (found) {
        setCampaign(found);
      }
    } catch (err) {
      console.error('Failed to load campaign details:', err);
    } finally {
      setCampaignLoading(false);
    }
  }, [campaignId, workspaceId]);

  // Load Topics
  const loadTopics = useCallback(async () => {
    if (!campaignId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await topicApi.listByCampaignId(Number(campaignId), API_BASE_URL);
      if (response && response.success) {
        setTopics(response.data || []);
      } else {
        setTopics([]);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách topic');
      setTopics([]);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    loadCampaignDetails();
    loadTopics();
  }, [loadCampaignDetails, loadTopics]);

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingTopic(null);
    setTitleInput('');
    setDescInput('');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (topic, e) => {
    e.stopPropagation(); // Avoid card click navigation
    setEditingTopic(topic);
    setTitleInput(topic.title || '');
    setDescInput(topic.description || '');
    setIsModalOpen(true);
  };

  // Submit modal (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titleInput.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        campaignId: Number(campaignId),
        title: titleInput.trim(),
        description: descInput.trim(),
      };

      if (editingTopic) {
        // Update
        const res = await topicApi.update(editingTopic.id, payload, API_BASE_URL);
        if (res.success) {
          await loadTopics();
          setIsModalOpen(false);
        }
      } else {
        // Create
        const res = await topicApi.create(payload, API_BASE_URL);
        if (res.success) {
          await loadTopics();
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      window.alert(err.message || 'Thao tác thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Topic
  const handleDelete = async (topicIdValue, e) => {
    e.stopPropagation(); // Avoid card click navigation
    if (window.confirm('Bạn có chắc chắn muốn xoá topic này và toàn bộ bài viết bên trong?')) {
      try {
        await topicApi.delete(topicIdValue, API_BASE_URL);
        await loadTopics();
      } catch (err) {
        window.alert(err.message || 'Không thể xoá topic');
      }
    }
  };

  // Handle Card Click (Navigate to Topic Posts)
  const handleCardClick = (topicIdValue) => {
    navigate(`/workspaces/${workspaceId}/topics/${topicIdValue}/posts`);
  };

  return (
    <div className="campaign-page-container">
      <main className="campaign-main-content">
        {/* Back Link */}
        <div style={{ marginBottom: '16px' }}>
          <Link to={`/workspaces/${workspaceId}/campaigns`} className="topic-enter-btn" style={{ display: 'inline-flex', width: 'auto' }}>
            ← Quay lại chiến dịch
          </Link>
        </div>

        {/* Hero Section */}
        <section className="campaign-hero-panel">
          <div className="campaign-hero-copy">
            <span className="workspace-label">
              Chiến dịch {campaign?.statusLabel ? `• ${campaign.statusLabel}` : ''}
            </span>
            <h1 className="workspace-title-main" style={{ margin: '8px 0' }}>
              {campaignLoading ? 'Đang tải thông tin chiến dịch...' : campaign?.title || 'Thông tin chiến dịch'}
            </h1>
            <p className="campaign-hero-subtitle">
              {campaign?.description || 'Chi tiết các nhóm nội dung (Topics) của chiến dịch này.'}
            </p>
          </div>
          <div className="title-right">
            <button type="button" className="btn-create-campaign" onClick={handleOpenCreate}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Tạo Topic mới
            </button>
          </div>
        </section>

        {/* Topics Listing */}
        {loading ? (
          <div className="empty-campaigns-state loading-state">
            <div className="loading-spinner" />
            <p className="empty-text">Đang tải danh sách topic...</p>
          </div>
        ) : error ? (
          <div className="empty-campaigns-state">
            <p className="empty-text">Lỗi: {error}</p>
            <button type="button" className="btn-create-campaign" onClick={loadTopics}>
              Thử lại
            </button>
          </div>
        ) : topics.length > 0 ? (
          <div className="topics-grid">
            {topics.map((topic) => (
              <div key={topic.id} className="topic-card" onClick={() => handleCardClick(topic.id)}>
                <div className="topic-card-header">
                  <div className="topic-icon-wrapper">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </div>
                  <div className="topic-card-actions">
                    <button type="button" className="topic-action-btn" onClick={(e) => handleOpenEdit(topic, e)} title="Sửa Topic">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button type="button" className="topic-action-btn delete" onClick={(e) => handleDelete(topic.id, e)} title="Xoá Topic">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="topic-card-body">
                  <h3 className="topic-title-text">{topic.title}</h3>
                  <p className="topic-desc-text">{topic.description || 'Không có mô tả cho topic này.'}</p>
                </div>

                <div className="topic-card-footer">
                  <span className="topic-meta-date">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Tạo ngày: {new Date(topic.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  <button type="button" className="topic-enter-btn">
                    Chi tiết bài viết →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-campaigns-state">
            <div className="empty-state-icon">📂</div>
            <p className="empty-text">Chiến dịch này chưa có topic nào.</p>
            <button type="button" className="btn-create-campaign" onClick={handleOpenCreate}>
              Tạo Topic đầu tiên
            </button>
          </div>
        )}
      </main>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h2 className="modal-title-text">{editingTopic ? 'Cập nhật Topic' : 'Tạo Topic mới'}</h2>
              <button type="button" className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group-field">
                <label className="form-label-text">Tên Topic *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Giới thiệu sản phẩm, Chăm sóc khách hàng..."
                  className="form-input-text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                />
              </div>
              <div className="form-group-field">
                <label className="form-label-text">Mô tả Topic</label>
                <textarea
                  placeholder="Mô tả tóm tắt nội dung chủ đề của nhóm bài viết..."
                  className="form-textarea-field"
                  rows={4}
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                />
              </div>
              <div className="modal-footer-actions">
                <button type="button" className="btn-form-cancel" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-form-submit" disabled={submitting}>
                  {submitting ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
