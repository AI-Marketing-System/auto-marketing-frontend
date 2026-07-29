import React, { useState, useEffect } from 'react';
import { topicApi } from '../api/topicApi';
import { API_BASE_URL } from '../../../config/env';

/**
 * AiTopicGeneratorModal — 2-phase modal:
 *  Phase 1: Show campaign info + optional constraint input → "Generate with AI"
 *  Phase 2: Show AI suggestions with checkboxes → "Save selected topics"
 */
export default function AiTopicGeneratorModal({ campaign, onClose, onSaved }) {
  const [phase, setPhase] = useState('input'); // 'input' | 'results' | 'saving'
  const [userConstraint, setUserConstraint] = useState('');
  const [count] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState(null);

  // Select all by default when suggestions arrive
  useEffect(() => {
    if (suggestions.length > 0) {
      setSelected(new Set(suggestions.map((_, i) => i)));
    }
  }, [suggestions]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await topicApi.generateAi(
        {
          campaignId: Number(campaign.id),
          count,
          userConstraint: userConstraint.trim() || null,
        },
        API_BASE_URL
      );
      if (res && res.success && res.data?.suggestions?.length > 0) {
        setSuggestions(res.data.suggestions);
        setPhase('results');
      } else {
        setError('AI không trả về kết quả. Vui lòng thử lại.');
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi gọi AI. Vui lòng thử lại.');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggle = (idx) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selected.size === suggestions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(suggestions.map((_, i) => i)));
    }
  };

  const handleSave = async () => {
    if (selected.size === 0) return;
    setSaving(true);
    setError(null);
    try {
      const picked = suggestions.filter((_, i) => selected.has(i));
      const res = await topicApi.saveBatch(
        { campaignId: Number(campaign.id), topics: picked },
        API_BASE_URL
      );
      if (res && res.success) {
        onSaved();
        onClose();
      } else {
        setError(res?.message || 'Lưu thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      setError(err.message || 'Lưu thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleRetry = () => {
    setPhase('input');
    setSuggestions([]);
    setSelected(new Set());
    setError(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="ai-topic-modal"
        onClick={(e) => e.stopPropagation()}
        style={modalStyle}
      >
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={aiIconStyle}>✨</div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                AI Tạo Topic
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                {phase === 'input' ? 'Tự động sinh chủ đề nội dung từ AI' : `${suggestions.length} gợi ý đã được tạo`}
              </p>
            </div>
          </div>
          <button type="button" style={closeBtnStyle} onClick={onClose}>✕</button>
        </div>

        {/* Campaign info badge */}
        <div style={campaignBadgeStyle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span style={{ fontSize: '13px', color: '#4338ca', fontWeight: 500 }}>
            Chiến dịch: <strong>{campaign?.title || 'Không rõ'}</strong>
          </span>
        </div>

        {/* ── Phase 1: Input ── */}
        {phase === 'input' && (
          <div style={{ padding: '20px 24px 24px' }}>
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
              AI sẽ phân tích thông tin chiến dịch và tự động tạo <strong>{count} chủ đề nội dung</strong> phù hợp.
              Bạn có thể thêm ràng buộc để AI điều chỉnh kết quả.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>
                Ràng buộc thêm <span style={{ color: '#94a3b8', fontWeight: 400 }}>(không bắt buộc)</span>
              </label>
              <textarea
                value={userConstraint}
                onChange={(e) => setUserConstraint(e.target.value)}
                placeholder="VD: Tập trung vào đối tượng 18–25 tuổi, phong cách trẻ trung, liên quan đến mùa hè..."
                rows={3}
                style={textareaStyle}
              />
            </div>

            {error && <div style={errorStyle}>{error}</div>}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" style={cancelBtnStyle} onClick={onClose}>
                Hủy
              </button>
              <button
                type="button"
                style={generating ? { ...aiGenerateBtnStyle, opacity: 0.7 } : aiGenerateBtnStyle}
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <span style={spinnerStyle} />
                    Đang tạo...
                  </>
                ) : (
                  <>✨ Tạo với AI</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Phase 2: Results ── */}
        {phase === 'results' && (
          <div style={{ padding: '16px 24px 24px' }}>
            {/* Select all / Deselect all */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <button type="button" style={selectAllBtnStyle} onClick={handleSelectAll}>
                {selected.size === suggestions.length ? '☐ Bỏ chọn tất cả' : '☑ Chọn tất cả'}
              </button>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Đã chọn <strong style={{ color: '#6366f1' }}>{selected.size}</strong> / {suggestions.length}
              </span>
            </div>

            {/* Suggestion cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
              {suggestions.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => handleToggle(idx)}
                  style={selected.has(idx) ? { ...suggestionCardStyle, ...suggestionCardSelectedStyle } : suggestionCardStyle}
                >
                  <div style={checkboxAreaStyle}>
                    <div style={selected.has(idx) ? { ...checkboxStyle, ...checkboxCheckedStyle } : checkboxStyle}>
                      {selected.has(idx) && (
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
                          <polyline points="2 6 5 9 10 3" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>
                      {s.title}
                    </p>
                    {s.description && (
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                        {s.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {error && <div style={{ ...errorStyle, marginTop: '12px' }}>{error}</div>}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button type="button" style={retryBtnStyle} onClick={handleRetry}>
                ↺ Tạo lại
              </button>
              <button
                type="button"
                style={selected.size === 0 || saving
                  ? { ...saveBtnStyle, opacity: 0.5, cursor: 'not-allowed' }
                  : saveBtnStyle}
                onClick={handleSave}
                disabled={selected.size === 0 || saving}
              >
                {saving ? (
                  <><span style={spinnerStyle} /> Đang lưu...</>
                ) : (
                  `Lưu ${selected.size} topic đã chọn`
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const modalStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 25px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
  width: '100%',
  maxWidth: '560px',
  overflow: 'hidden',
  animation: 'fadeInScale 0.2s ease',
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 24px 0',
};

const aiIconStyle = {
  width: '38px',
  height: '38px',
  background: 'linear-gradient(135deg, #818cf8, #6366f1)',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
  flexShrink: 0,
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  fontSize: '18px',
  color: '#94a3b8',
  cursor: 'pointer',
  padding: '4px 8px',
  borderRadius: '6px',
  lineHeight: 1,
};

const campaignBadgeStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
  borderRadius: '8px',
  padding: '8px 12px',
  margin: '14px 24px 0',
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '6px',
};

const textareaStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1.5px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '13px',
  color: '#1e293b',
  resize: 'vertical',
  outline: 'none',
  fontFamily: 'inherit',
  lineHeight: 1.5,
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const errorStyle = {
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: '10px 14px',
  fontSize: '13px',
  color: '#dc2626',
  marginBottom: '16px',
};

const cancelBtnStyle = {
  padding: '9px 18px',
  borderRadius: '8px',
  border: '1.5px solid #e2e8f0',
  background: '#fff',
  color: '#475569',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
};

const aiGenerateBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '9px 20px',
  borderRadius: '8px',
  border: 'none',
  background: 'linear-gradient(135deg, #818cf8, #6366f1)',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
};

const spinnerStyle = {
  display: 'inline-block',
  width: '12px',
  height: '12px',
  border: '2px solid rgba(255,255,255,0.4)',
  borderTop: '2px solid #fff',
  borderRadius: '50%',
  animation: 'spin 0.7s linear infinite',
};

const selectAllBtnStyle = {
  background: 'none',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  padding: '5px 12px',
  fontSize: '13px',
  color: '#475569',
  cursor: 'pointer',
};

const suggestionCardStyle = {
  display: 'flex',
  gap: '12px',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1.5px solid #e2e8f0',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  background: '#fafafa',
};

const suggestionCardSelectedStyle = {
  border: '1.5px solid #818cf8',
  background: '#eef2ff',
};

const checkboxAreaStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  paddingTop: '2px',
  flexShrink: 0,
};

const checkboxStyle = {
  width: '18px',
  height: '18px',
  borderRadius: '5px',
  border: '2px solid #cbd5e1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#fff',
  transition: 'all 0.15s',
};

const checkboxCheckedStyle = {
  background: '#6366f1',
  border: '2px solid #6366f1',
};

const retryBtnStyle = {
  padding: '9px 16px',
  borderRadius: '8px',
  border: '1.5px solid #e2e8f0',
  background: '#fff',
  color: '#475569',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
};

const saveBtnStyle = {
  padding: '9px 20px',
  borderRadius: '8px',
  border: 'none',
  background: 'linear-gradient(135deg, #34d399, #10b981)',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};
