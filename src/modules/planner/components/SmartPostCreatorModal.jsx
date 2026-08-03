import React, { useState } from 'react';
import { generateFullPostContent } from '../api/stagedPlannerApi';
import { SparkleIcon } from './PlannerIcons';

/**
 * SmartPostCreatorModal - Modal soạn bài viết thông minh từ Skeleton
 * Tự động điền dữ liệu (Auto-fill) và cung cấp nút 1-Click "🤖 AI Viết Caption từ Brief"
 */
export default function SmartPostCreatorModal({ workspaceId, postSkeleton, onClose, onSaveAndSchedule }) {
  // Move all useState hooks to the top of component unconditionally to obey React Rules of Hooks
  const [title, setTitle] = useState(postSkeleton?.title || '');
  const [contentBrief] = useState(postSkeleton?.contentBrief || postSkeleton?.content || '');
  const [content, setContent] = useState(postSkeleton?.contentBrief || postSkeleton?.content || '');
  const [hashtags, setHashtags] = useState(postSkeleton?.hashtags || postSkeleton?.hashtagsSuggestion || '');
  const [brandTone, setBrandTone] = useState(postSkeleton?.tone || 'Thân thiện, chuyên nghiệp, uy tín');
  const [platform, setPlatform] = useState(postSkeleton?.platformSuggestion || 'Facebook');
  const [publishTime, setPublishTime] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  );
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  if (!postSkeleton) return null;

  const handleGenerateAI = async () => {
    if (!workspaceId) return;
    setGenerating(true);
    setError(null);
    try {
      const generatedText = await generateFullPostContent(workspaceId, {
        title,
        contentBrief,
        brandTone,
        platform,
        freeTextInstructions: [],
      });
      if (generatedText) {
        setContent(generatedText);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi gọi AI sinh nội dung bài viết');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = () => {
    if (onSaveAndSchedule) {
      onSaveAndSchedule({
        id: postSkeleton.id,
        title,
        content,
        hashtags,
        tone: brandTone,
        platform,
        publishTime,
      });
    }
    if (onClose) onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          width: '100%',
          maxWidth: 720,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          padding: 28,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
              ✨ Soạn Bài Đăng Từ Khung Bài viết Skeleton
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
              Tự động điền định hướng từ AI Planner — Nhấn nút để AI viết bài caption đầy đủ ngay tức thì.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: 12, borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* Content Brief Highlight Box */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            border: '1px solid #bae6fd',
            borderRadius: 10,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0369a1', display: 'flex', alignItems: 'center', gap: 6 }}>
              💡 Content Brief Định Hướng (AI Suggestion)
            </span>
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={generating}
              style={{
                background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)',
              }}
            >
              <SparkleIcon size={14} /> {generating ? 'AI đang viết caption...' : '🤖 AI Viết Caption từ Brief'}
            </button>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#0c4a6e', lineHeight: 1.5 }}>
            {contentBrief || 'Chưa có tóm tắt định hướng'}
          </p>
        </div>

        {/* Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              Tiêu đề bài viết
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              Nội dung bài viết (Caption)
            </label>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung bài viết hoặc bấm 'AI Viết Caption từ Brief' ở trên..."
              style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, lineHeight: 1.6 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Hashtags
              </label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Giọng điệu thương hiệu (Tone)
              </label>
              <input
                type="text"
                value={brandTone}
                onChange={(e) => setBrandTone(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Nền tảng đăng
              </label>
              <input
                type="text"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Thời gian đặt lịch đăng
              </label>
              <input
                type="datetime-local"
                value={publishTime}
                onChange={(e) => setPublishTime(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{ background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            📅 Lưu Bài Viết & Đặt Lịch Đăng
          </button>
        </div>
      </div>
    </div>
  );
}
