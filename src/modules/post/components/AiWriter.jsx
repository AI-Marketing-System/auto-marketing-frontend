import React, { useState } from 'react';
import { postApi } from '../api/postApi';
import { API_BASE_URL } from '../../../config/env';
import { useQuota } from '../../subscription/hooks/useQuota';
import { showTokenToast } from '../../subscription/components/TokenToast';
import UpgradeModal from '../../subscription/components/UpgradeModal';

/**
 * AiWriter – Bảng viết nội dung bằng AI
 *
 * @param {{
 *   onInsert: (text: string) => void,
 *   topicId?: string | number,
 * }} props
 */
const TONES = ['Chuyên nghiệp', 'Vui tươi', 'Cảm xúc', 'Hài hước', 'Thuyết phục'];

export default function AiWriter({
  onInsert,
  topicId,
  initialPrompt,
  initialTone,
  brandTone,
  selectedPlatforms = [],
  hashtags = [],
  currentContent = '',
  onAiMediaChange,
  mediaSuggestion = '',  // Gợi ý media từ AI skeleton
}) {
  const { quota } = useQuota();
  const [activeTab, setActiveTab]   = useState('write');   // 'write' | 'read'
  const [prompt, setPrompt]         = useState(initialPrompt || '');
  const [tone, setTone]             = useState(initialTone || brandTone || 'Chuyên nghiệp');
  const [loading, setLoading]       = useState(false);
  const [errorMsg, setErrorMsg]     = useState(null);
  const [expanded, setExpanded]     = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Thêm state cho chức năng tạo ảnh
  const [imgLoading, setImgLoading] = useState(false);
  const [imgErrorMsg, setImgErrorMsg] = useState(null);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [imageCount, setImageCount]           = useState(1);
  const [reloadingIndex, setReloadingIndex]   = useState(null);

  // Prompt gen ảnh — khởi tạo từ mediaSuggestion, có thể chỉnh sửa trước khi gen
  const [imagePrompt, setImagePrompt] = useState(mediaSuggestion || '');

  const updateFilesToParent = (base64Array) => {
    try {
      const files = base64Array.map((base64, index) => {
         const byteString = atob(base64);
         const ab = new ArrayBuffer(byteString.length);
         const ia = new Uint8Array(ab);
         for (let i = 0; i < byteString.length; i++) {
           ia[i] = byteString.charCodeAt(i);
         }
         const blob = new Blob([ab], { type: 'image/png' });
         return new File([blob], `ai-generated-${Date.now()}-${index}.png`, { type: 'image/png' });
      });
      onAiMediaChange?.(files);
    } catch (error) {
      console.error("Lỗi khi chuyển đổi ảnh:", error);
    }
  };

  React.useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
    if (initialTone) {
      setTone(initialTone);
    } else if (brandTone) {
      setTone(brandTone);
    }
  }, [initialPrompt, initialTone, brandTone]);

  // Sync mediaSuggestion vào imagePrompt khi modal mở
  React.useEffect(() => {
    if (mediaSuggestion) setImagePrompt(mediaSuggestion);
  }, [mediaSuggestion]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const payload = {
        topicId: topicId ? Number(topicId) : 1,
        tone: tone,
        contentBrief: prompt.trim(),
        audience: prompt.trim(),
        platforms: selectedPlatforms,
        hashtags: hashtags,
        language: 'Vietnamese',
        length: 'Medium',
      };

      const res = await postApi.generate(payload, API_BASE_URL);
      if (res && res.success && res.data) {
        const generatedData = res.data;
        let generatedText = generatedData.content || '';
        const generatedHashtags = generatedData.hashtags || [];

        onInsert?.(generatedText, generatedHashtags);
        window.dispatchEvent(
          new CustomEvent('quota:changed', {
            detail: { remainingTokens: generatedData.remainingToken, tokensUsed: generatedData.tokensUsed },
          })
        );
        // Hiển thị toast token nếu backend trả về thông tin
        if (generatedData.tokensUsed !== undefined) {
          showTokenToast(generatedData.tokensUsed, generatedData.remainingToken);
        }
      } else {
        setErrorMsg(res?.message || 'Không thể tạo nội dung bằng AI.');
      }
    } catch (err) {
      console.error('AI generate content error:', err);
      const status = err?.response?.status || err?.status;
      if (status === 402) {
        setShowUpgrade(true);
      } else {
        setErrorMsg(err.message || 'Không thể gọi dịch vụ AI (Gemini). Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    // Build prompt: ưu tiên mediaSuggestion (imagePrompt) + nội dung bài
    const postText  = currentContent.trim() || prompt.trim();
    const imgHint   = imagePrompt.trim();
    const finalPrompt = imgHint
      ? `[Yêu cầu hình ảnh - quan trọng]: ${imgHint}\n[Nội dung bài viết - tham khảo]: ${postText}`
      : postText;
    if (!finalPrompt.trim()) return;

    setImgLoading(true);
    setImgErrorMsg(null);

    try {
      const payload = {
        prompt: finalPrompt,
        count: imageCount
      };

      const res = await postApi.generateImage(payload, API_BASE_URL);
      if (res && res.success && res.data && res.data.images) {
        setGeneratedImages(res.data.images);
        updateFilesToParent(res.data.images);
        window.dispatchEvent(
          new CustomEvent('quota:changed', {
            detail: { remainingTokens: res.data.remainingToken, tokensUsed: res.data.tokensUsed },
          })
        );
        // Hiển thị toast token
        if (res.data.tokensUsed !== undefined) {
          showTokenToast(res.data.tokensUsed, res.data.remainingToken);
        }
      } else {
        setImgErrorMsg(res?.message || 'Không thể tạo ảnh.');
        onAiMediaChange?.([]);
      }
    } catch (err) {
      console.error('AI generate image error:', err);
      const status = err?.response?.status || err?.status;
      if (status === 402) {
        setShowUpgrade(true);
      } else {
        setImgErrorMsg(err.message || 'Lỗi khi gọi dịch vụ tạo ảnh.');
        onAiMediaChange?.([]);
      }
    } finally {
      setImgLoading(false);
    }
  };

  const handleDeleteImage = (indexToRemove) => {
    const newImages = generatedImages.filter((_, idx) => idx !== indexToRemove);
    setGeneratedImages(newImages);
    updateFilesToParent(newImages);
  };

  const handleReloadImage = async (indexToReload) => {
    const postText  = currentContent.trim() || prompt.trim();
    const imgHint   = imagePrompt.trim();
    const finalPrompt = imgHint
      ? `[Yêu cầu hình ảnh - quan trọng]: ${imgHint}\n[Nội dung bài viết - tham khảo]: ${postText}`
      : postText;
    if (!finalPrompt.trim()) return;

    setReloadingIndex(indexToReload);
    try {
      const payload = {
        prompt: finalPrompt,
        count: 1 // Chỉ lấy 1 ảnh mới
      };

      const res = await postApi.generateImage(payload, API_BASE_URL);
      if (res && res.success && res.data && res.data.images && res.data.images.length > 0) {
        const newImages = [...generatedImages];
        newImages[indexToReload] = res.data.images[0];
        setGeneratedImages(newImages);
        updateFilesToParent(newImages);
        // Bổ sung: dispatch quota:changed và hiện toast sau reload ảnh
        window.dispatchEvent(
          new CustomEvent('quota:changed', {
            detail: { remainingTokens: res.data.remainingToken, tokensUsed: res.data.tokensUsed },
          })
        );
        if (res.data.tokensUsed !== undefined) {
          showTokenToast(res.data.tokensUsed, res.data.remainingToken);
        }
      } else {
        const status = res?.status;
        if (status === 402) {
          setShowUpgrade(true);
        } else {
          alert(res?.message || 'Không thể tạo lại ảnh.');
        }
      }
    } catch (err) {
      console.error('Reload image error:', err);
      const status = err?.response?.status || err?.status;
      if (status === 402) {
        setShowUpgrade(true);
      } else {
        alert(err.message || 'Lỗi khi gọi dịch vụ tạo lại ảnh.');
      }
    } finally {
      setReloadingIndex(null);
    }
  };

  return (
    <>
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
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
          AI viết nội dung & Gợi ý giọng văn
          <span className="cp-ai__badge">AI</span>
          {quota?.remainingTokens !== undefined && (
            <span style={{ fontSize: '11px', color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '12px', fontWeight: 600, marginLeft: '6px' }}>
              ⚡ {quota.remainingTokens.toLocaleString('vi-VN')} token
            </span>
          )}
          {!expanded && (
            <span style={{ fontSize: '11px', color: '#6d28d9', fontWeight: 500, marginLeft: '8px', opacity: 0.85 }}>
              • Giọng văn: {tone?.length > 25 ? tone.substring(0, 25) + '...' : tone}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {!expanded && <span style={{ fontSize: '11.5px', color: '#7c3aed', fontWeight: 600 }}>✦ Mở rộng</span>}
          <span className={`cp-ai__toggle${expanded ? ' cp-ai__toggle--open' : ''}`}>▾</span>
        </div>
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
                    {brandTone && (
                      <button
                        type="button"
                        key="brand-tone"
                        id="cp-tone-brand"
                        className={`cp-tone-chip cp-tone-chip--brand${tone === brandTone ? ' cp-tone-chip--active' : ''}`}
                        onClick={() => setTone(brandTone)}
                        title={brandTone}
                      >
                        🏢 Giọng Thương hiệu
                        <span className="cp-tone-badge">Brand</span>
                      </button>
                    )}
                    {TONES.map((t) => (
                      <button
                        type="button"
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
                {errorMsg && (
                  <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', textAlign: 'center' }}>
                    {errorMsg}
                  </div>
                )}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>Ảnh minh họa (AI)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Số lượng:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3].map(num => (
                <button
                  key={num}
                  onClick={() => setImageCount(num)}
                  style={{
                    padding: '2px 8px',
                    border: `1px solid ${imageCount === num ? '#7c3aed' : '#cbd5e1'}`,
                    backgroundColor: imageCount === num ? '#f3e8ff' : 'white',
                    color: imageCount === num ? '#7c3aed' : '#64748b',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Editable image prompt — ưu tiên từ mediaSuggestion */}
        <div style={{ marginBottom: 8 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 4,
            fontSize: 12,
            color: '#475569',
            fontWeight: 500,
          }}>
            <span>Mô tả hình ảnh cần tạo</span>
            {mediaSuggestion && (
              <span style={{
                background: 'linear-gradient(90deg,#7c3aed,#a855f7)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                borderRadius: 6,
                padding: '1px 6px',
                letterSpacing: 0.3,
              }}>
                🤖 AI gợi ý
              </span>
            )}
          </div>
          <textarea
            id="cp-ai-image-prompt"
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            rows={2}
            placeholder="Mô tả yêu cầu hình ảnh (VD: Banner sản phẩm nền trắng, ảnh thực tế...)"
            style={{
              width: '100%',
              fontSize: 12,
              padding: '7px 10px',
              border: '1px solid',
              borderColor: mediaSuggestion ? '#c4b5fd' : '#e2e8f0',
              borderRadius: 7,
              resize: 'vertical',
              outline: 'none',
              color: '#1e293b',
              background: mediaSuggestion ? '#fdf4ff' : '#fff',
              lineHeight: 1.45,
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div 
          className={`cp-ai-image ${imgLoading ? 'cp-ai-image--loading' : ''}`} 
          id="cp-ai-image-btn"
          onClick={imgLoading ? undefined : handleGenerateImage}
          style={{ cursor: imgLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
        >
          {imgLoading ? (
            <span className="cp-spinner" style={{ borderColor: '#7c3aed', borderRightColor: 'transparent', width: 14, height: 14, borderWidth: 2 }} />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          )}
          {imgLoading ? 'Đang tạo ảnh...' : `Tạo ${imageCount} ảnh cho bài viết (~${(imageCount * 1000).toLocaleString('vi-VN')} token)`}
          <span className="cp-ai-image__badge">AI</span>
        </div>
        
        {imgErrorMsg && (
          <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>
            {imgErrorMsg}
          </div>
        )}

        {generatedImages.length > 0 && (
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {generatedImages.map((base64, index) => (
              <div key={index} style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                <img 
                  src={`data:image/png;base64,${base64}`} 
                  alt={`Generated AI ${index}`} 
                  style={{ width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'block', opacity: reloadingIndex === index ? 0.5 : 1 }}
                />
                
                {/* Lớp phủ loading khi đang reload ảnh này */}
                {reloadingIndex === index && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="cp-spinner" style={{ borderColor: '#7c3aed', borderRightColor: 'transparent', width: 24, height: 24, borderWidth: 3 }} />
                  </div>
                )}

                {/* Các nút thao tác */}
                {reloadingIndex !== index && (
                  <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => handleReloadImage(index)}
                      title="Tạo lại ảnh này"
                      style={{
                        width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)', 
                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteImage(index)}
                      title="Xóa ảnh này"
                      style={{
                        width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)', 
                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </>
);
}
