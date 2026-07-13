import React, { useState } from 'react';

/**
 * AiWriter – Bảng viết nội dung bằng AI
 *
 * @param {{
 *   onInsert: (text: string) => void,
 * }} props
 */
const TONES = ['Chuyên nghiệp', 'Vui tươi', 'Cảm xúc', 'Hài hước', 'Thuyết phục'];

export default function AiWriter({ onInsert }) {
  const [activeTab, setActiveTab]   = useState('write');   // 'write' | 'read'
  const [prompt, setPrompt]         = useState('');
  const [tone, setTone]             = useState('Vui tươi');
  const [loading, setLoading]       = useState(false);
  const [expanded, setExpanded]     = useState(true);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    // Simulated delay – replace with real API call
    await new Promise((r) => setTimeout(r, 1800));
    const result = `✨ [AI - ${tone}] ${prompt.trim()} — Nội dung được tạo bởi AI với giọng văn ${tone.toLowerCase()}.`;
    onInsert?.(result);
    setLoading(false);
  };

  return (
    <div className="cp-ai">
      {/* Header / Toggle */}
      <div
        className="cp-ai__header"
        onClick={() => setExpanded((v) => !v)}
        id="cp-ai-toggle"
        role="button"
        aria-expanded={expanded}
      >
        <div className="cp-ai__title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          AI viết nội dung
          <span className="cp-ai__badge">AI</span>
        </div>
        <span className={`cp-ai__toggle${expanded ? ' cp-ai__toggle--open' : ''}`}>▾</span>
      </div>

      {expanded && (
        <>
          {/* Tabs */}
          <div className="cp-ai__tabs">
            <button
              className={`cp-ai__tab${activeTab === 'write' ? ' cp-ai__tab--active' : ''}`}
              onClick={() => setActiveTab('write')}
              id="cp-ai-tab-write"
            >
              Yêu cầu viết
            </button>
            <button
              className={`cp-ai__tab${activeTab === 'read' ? ' cp-ai__tab--active' : ''}`}
              onClick={() => setActiveTab('read')}
              id="cp-ai-tab-read"
            >
              Đọc tải liệu
            </button>
          </div>

          {/* Body */}
          <div className="cp-ai__body">
            {activeTab === 'write' && (
              <>
                <div>
                  <div className="cp-ai__label">Nội dung yêu cầu</div>
                  <textarea
                    id="cp-ai-prompt"
                    className="cp-ai__textarea"
                    placeholder="Ví dụ: Viết bài quảng cáo sản phẩm kem dưỡng da, tone vui tươi, nhắm vào phụ nữ 25–35 tuổi..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <div className="cp-ai__label">Giọng văn</div>
                  <div className="cp-tone-row">
                    {TONES.map((t) => (
                      <button
                        key={t}
                        id={`cp-tone-${t}`}
                        className={`cp-tone-chip${tone === t ? ' cp-tone-chip--active' : ''}`}
                        onClick={() => setTone(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  id="cp-ai-generate-btn"
                  className="cp-ai__generate-btn"
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                >
                  {loading ? (
                    <>
                      <span className="cp-spinner" />
                      Đang tạo nội dung...
                    </>
                  ) : (
                    <>✦ Tạo nội dung</>
                  )}
                </button>
              </>
            )}

            {activeTab === 'read' && (
              <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '10px 0' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ marginBottom: 6 }}>
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <div>Tải lên tài liệu để AI phân tích và viết nội dung</div>
              </div>
            )}
          </div>
        </>
      )}

      {/* AI Image button */}
      <div style={{ padding: '8px 14px', borderTop: '1px solid #f1f5f9' }}>
        <div className="cp-ai-image" id="cp-ai-image-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Tạo ảnh cho bài viết
          <span className="cp-ai-image__badge">AI</span>
        </div>
      </div>
    </div>
  );
}
