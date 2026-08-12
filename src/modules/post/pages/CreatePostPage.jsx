import React, { useState } from 'react';
import CreatePostModal from '../components/CreatePostModal';

/**
 * CreatePostPage – Page demo / standalone cho modal "Tạo bài viết".
 *
 * Route đề xuất: /posts/create
 *
 * Nếu modal được tích hợp vào SchedulePage thì page này chỉ đóng vai
 * trò demo / development entrypoint. Trong production, import trực tiếp
 * <CreatePostModal> vào nơi cần dùng.
 */
export default function CreatePostPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [drafts, setDrafts] = useState([]);

  const handleSubmit = (data) => {
    console.log('[CreatePost] Hoàn tất:', data);
    setSubmissions((p) => [data, ...p]);
    // TODO: gọi API tạo bài đăng: postService.createPost(data)
  };

  const handleDraft = (data) => {
    console.log('[CreatePost] Lưu nháp:', data);
    setDrafts((p) => [data, ...p]);
    // TODO: gọi API lưu nháp
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fb', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* ─── Demo header ─── */}
      <div style={{
        padding: '16px 32px',
        background: '#fff',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
          Create Post (Modal)
        </div>
        <button
          id="cp-demo-open-btn"
          onClick={() => setModalOpen(true)}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            background: 'linear-gradient(135deg, #7c3aed, #9f67fa)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 3px 10px rgba(124,58,237,0.35)',
          }}
        >
          + Viết bài mới
        </button>
      </div>

      {/* ─── Demo content ─── */}
      <div style={{ padding: '32px', maxWidth: 860, margin: '0 auto' }}>
        <div style={{
          background: '#fff',
          borderRadius: 14,
          padding: '28px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
          textAlign: 'center',
          color: '#94a3b8',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="1.5" style={{ marginBottom: 12 }}>
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
            Chưa có bài viết nào
          </div>
          <div style={{ fontSize: 13 }}>
            Nhấn <strong style={{ color: '#7c3aed' }}>+ Viết bài mới</strong> để tạo bài đăng đầu tiên của bạn.
          </div>
        </div>

        {/* Submissions log */}
        {submissions.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>
              Bài đã tạo
            </div>
            {submissions.map((s, i) => (
              <div key={i} style={{
                background: '#fff',
                borderRadius: 10,
                padding: '14px 18px',
                marginBottom: 8,
                boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                fontSize: 13,
                color: '#334155',
                borderLeft: '3px solid #7c3aed',
              }}>
                <strong>{s.platforms?.join(', ')}</strong>
                {s.topic && <span style={{ color: '#94a3b8', marginLeft: 8 }}>#{s.topic}</span>}
                <div style={{ marginTop: 4, color: '#64748b' }}>
                  {s.content?.slice(0, 80) || <em>Không có nội dung</em>}
                </div>
                {s.scheduledAt && (
                  <div style={{ marginTop: 4, fontSize: 11, color: '#7c3aed' }}>
                    🕐 {s.scheduledAt}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Drafts log */}
        {drafts.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>
              Bản nháp
            </div>
            {drafts.map((d, i) => (
              <div key={i} style={{
                background: '#fafbff',
                borderRadius: 10,
                padding: '14px 18px',
                marginBottom: 8,
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                fontSize: 13,
                color: '#64748b',
                borderLeft: '3px solid #e2e8f0',
                fontStyle: 'italic',
              }}>
                {d.content?.slice(0, 80) || 'Nháp trống'}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Modal ─── */}
      <CreatePostModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        onDraft={handleDraft}
      />
    </div>
  );
}
