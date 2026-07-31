import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import StageProgress from '../components/StageProgress';
import EntitySourceBadge from '../components/EntitySourceBadge';
import FieldRow from '../components/FieldRow';
import RegenerateBar from '../components/RegenerateBar';
import StagePageHeader from '../components/StagePageHeader';
import {
  SparkleIcon,
  PlusIcon,
  TrashIcon,
  FolderIcon,
  TargetIcon,
  FileTextIcon,
} from '../components/PlannerIcons';
import PlannerAlert from '../components/PlannerAlert';
import PlannerDropzone from '../components/PlannerDropzone';
import PlannerLoadingOverlay from '../components/PlannerLoadingOverlay';
import { PLAN_STAGES, SEED_INPUT_FIELDS } from '../utils/stagedPlannerConstants';
import {
  initDraft,
  generateCampaigns,
  regenerateCampaigns,
  generateTopics,
  regenerateTopics,
  generatePosts,
  regeneratePosts,
  confirmStage,
  updateDraftStructure,
  finalizePlan,
} from '../api/stagedPlannerApi';
import { planDraftApi, parsePlanDraftResponse } from '../api/plannerApi';
import { API_BASE_URL } from '../../../config/env';
import '../styles/StagedPlannerPage.css';

// ─────────────────────────────────────────────────────────────────────────
// Main StagedPlannerPage
// ─────────────────────────────────────────────────────────────────────────
function StagedPlannerPage() {
  const { workspaceId } = useParams();

  const [stage, setStage] = useState(PLAN_STAGES.INIT);
  const [error, setError] = useState(null);
  const [draftLoading, setDraftLoading] = useState(true);

  // 7 core business input fields
  const [seedInput, setSeedInput] = useState({
    companyName: '',
    visionMissionCoreValues: '',
    industryAndBusinessModel: '',
    targetCustomerPersona: '',
    brandTone: '',
    campaignPeriod: '',
    additionalInstructions: '',
  });

  const [pendingFiles, setPendingFiles] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState([]);

  const [campaigns, setCampaigns] = useState([]);
  const [overview, setOverview] = useState(null);

  const [freeText, setFreeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState('');

  // ─── Restore draft on load ──────────────────────────────────────────────
  useEffect(() => {
    if (!workspaceId) {
      setDraftLoading(false);
      return;
    }
    let alive = true;
    const ctrl = new AbortController();

    planDraftApi
      .get(API_BASE_URL, workspaceId, ctrl.signal)
      .then((res) => {
        if (!alive) return;
        const draft = parsePlanDraftResponse(res);
        if (!draft?.plan) {
          setDraftLoading(false);
          return;
        }
        setStage(draft.stage || draft.plan.stage || PLAN_STAGES.INIT);
        if (draft.plan.seedInput) {
          setSeedInput((p) => ({ ...p, ...draft.plan.seedInput }));
        }
        if (Array.isArray(draft.plan.campaigns)) {
          setCampaigns(draft.plan.campaigns);
        }
        if (draft.plan.workspaceName || draft.plan.businessSummary) {
          setOverview(draft.plan);
        }
        setDraftLoading(false);
      })
      .catch((err) => {
        if (!alive || err?.name === 'AbortError') return;
        setError(err.message);
        setDraftLoading(false);
      });
    return () => {
      alive = false;
      ctrl.abort();
    };
  }, [workspaceId]);

  // ─── Generic safe API caller wrapper ────────────────────────────────────
  const callApi = useCallback(async (fn, msg) => {
    setLoading(true);
    setLoadMsg(msg);
    setError(null);
    try {
      const res = await fn();
      let d = res?.data ?? res;
      if (typeof d === 'string') {
        try {
          d = JSON.parse(d);
        } catch (e) {}
      }
      return d;
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra trong quá trình xử lý');
      throw err;
    } finally {
      setLoading(false);
      setLoadMsg('');
    }
  }, []);

  // ─── Save Manual Edits to Backend Draft Structure ────────────────────────
  const syncStructureToBackend = useCallback(
    async (currentCampaigns, currentOverview) => {
      if (!workspaceId) return;
      const fullPlanNode = {
        ...overview,
        workspaceName:
          overview?.workspaceName || seedInput.companyName || 'Workspace Marketing Plan',
        seedInput,
        campaigns: currentCampaigns,
      };
      try {
        await updateDraftStructure(workspaceId, fullPlanNode);
      } catch (err) {
        console.warn('Lỗi lưu cấu trúc bản nháp:', err);
      }
    },
    [workspaceId, overview, seedInput]
  );

  // ─── Step 0 -> Step 1: Init & Generate Campaigns ───────────────────────
  const handleStartPlan = useCallback(async () => {
    if (!workspaceId) return;
    const seedJson = JSON.stringify(seedInput);

    await callApi(async () => {
      await initDraft(workspaceId, {
        seedInput: seedJson,
        files: pendingFiles.map((p) => p.file || p),
        documentIds: selectedDocIds,
      });

      const raw = await generateCampaigns(workspaceId);
      let data = raw?.data ?? raw;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {}
      }
      if (data) {
        setOverview({
          workspaceName: data.workspaceName,
          workspaceDescription: data.workspaceDescription,
          businessSummary: data.businessSummary,
          targetAudience: data.targetAudience,
          brandTone: data.brandTone,
        });
        setCampaigns(Array.isArray(data.campaigns) ? data.campaigns : []);
        setStage(PLAN_STAGES.CAMPAIGNS_GENERATED);
      }
    }, 'AI đang phân tích thông tin và khởi tạo danh sách chiến dịch...');
  }, [workspaceId, seedInput, pendingFiles, selectedDocIds, callApi]);

  // ─── Regenerate Campaigns ───────────────────────────────────────────────
  const handleRegenCampaigns = useCallback(async () => {
    if (!workspaceId) return;
    await syncStructureToBackend(campaigns, overview);
    const data = await callApi(
      () =>
        regenerateCampaigns(workspaceId, {
          freeTextInstructions: freeText.trim() ? [freeText] : [],
          campaignIndex: -1,
          topicIndex: -1,
        }),
      'AI đang sinh lại danh sách chiến dịch...'
    );
    if (data) {
      setOverview({
        workspaceName: data.workspaceName,
        workspaceDescription: data.workspaceDescription,
        businessSummary: data.businessSummary,
        targetAudience: data.targetAudience,
        brandTone: data.brandTone,
      });
      setCampaigns(Array.isArray(data.campaigns) ? data.campaigns : []);
    }
    setFreeText('');
  }, [workspaceId, freeText, campaigns, overview, syncStructureToBackend, callApi]);

  // ─── Step 1 -> Step 2: Confirm Campaigns & Generate Batch Topics ────────
  const handleProceedToTopics = useCallback(async () => {
    if (!workspaceId) return;
    await syncStructureToBackend(campaigns, overview);
    await callApi(async () => {
      // Gọi generateTopics TRƯỚC khi stage còn CAMPAIGNS_GENERATED (backend assertStage yêu cầu vậy)
      await generateTopics(workspaceId, {
        freeTextInstructions: freeText.trim() ? [freeText] : [],
      });
      // Sau đó mới confirm chuyển stage
      await confirmStage(workspaceId, PLAN_STAGES.TOPICS_GENERATED);

      const draftRes = await planDraftApi.get(API_BASE_URL, workspaceId);
      const updated = parsePlanDraftResponse(draftRes);
      if (updated?.plan?.campaigns) {
        setCampaigns(updated.plan.campaigns);
      }
      setStage(PLAN_STAGES.TOPICS_GENERATED);
    }, 'AI đang tạo danh sách chủ đề cho toàn bộ các chiến dịch...');
    setFreeText('');
  }, [workspaceId, campaigns, overview, freeText, syncStructureToBackend, callApi]);

  // ─── Regenerate Topics ──────────────────────────────────────────────────
  const handleRegenBatchTopics = useCallback(async () => {
    if (!workspaceId) return;
    await syncStructureToBackend(campaigns, overview);
    await callApi(async () => {
      await regenerateTopics(workspaceId, {
        freeTextInstructions: freeText.trim() ? [freeText] : [],
      });
      const draftRes = await planDraftApi.get(API_BASE_URL, workspaceId);
      const updated = parsePlanDraftResponse(draftRes);
      if (updated?.plan?.campaigns) {
        setCampaigns(updated.plan.campaigns);
      }
    }, 'AI đang sinh lại danh sách chủ đề...');
    setFreeText('');
  }, [workspaceId, campaigns, overview, freeText, syncStructureToBackend, callApi]);

  // ─── Step 2 -> Step 3: Confirm Topics & Generate Batch Posts ───────────
  const handleProceedToPosts = useCallback(async () => {
    if (!workspaceId) return;
    await syncStructureToBackend(campaigns, overview);
    await callApi(async () => {
      // Gọi generatePosts TRƯỚC khi stage còn TOPICS_GENERATED (backend assertStage yêu cầu vậy)
      await generatePosts(workspaceId, { freeTextInstructions: freeText.trim() ? [freeText] : [] });
      // Sau đó mới confirm chuyển stage
      await confirmStage(workspaceId, PLAN_STAGES.POSTS_GENERATED);

      const draftRes = await planDraftApi.get(API_BASE_URL, workspaceId);
      const updated = parsePlanDraftResponse(draftRes);
      if (updated?.plan?.campaigns) {
        setCampaigns(updated.plan.campaigns);
      }
      setStage(PLAN_STAGES.POSTS_GENERATED);
    }, 'AI đang tạo danh sách bài viết skeleton cho toàn bộ các chủ đề...');
    setFreeText('');
  }, [workspaceId, campaigns, overview, freeText, syncStructureToBackend, callApi]);

  // ─── Regenerate Posts ───────────────────────────────────────────────────
  const handleRegenBatchPosts = useCallback(async () => {
    if (!workspaceId) return;
    await syncStructureToBackend(campaigns, overview);
    await callApi(async () => {
      await regeneratePosts(workspaceId, {
        freeTextInstructions: freeText.trim() ? [freeText] : [],
      });
      const draftRes = await planDraftApi.get(API_BASE_URL, workspaceId);
      const updated = parsePlanDraftResponse(draftRes);
      if (updated?.plan?.campaigns) {
        setCampaigns(updated.plan.campaigns);
      }
    }, 'AI đang sinh lại danh sách bài viết skeleton...');
    setFreeText('');
  }, [workspaceId, campaigns, overview, freeText, syncStructureToBackend, callApi]);

  // ─── Step 3 -> Step 4: Proceed to Final Review ──────────────────────────
  const handleProceedToFinalReview = useCallback(async () => {
    if (!workspaceId) return;
    await syncStructureToBackend(campaigns, overview);
    await callApi(async () => {
      await confirmStage(workspaceId, PLAN_STAGES.CONFIRMED);
      setStage(PLAN_STAGES.CONFIRMED);
    }, 'Đang chuyển sang màn hình Review tổng thể...');
  }, [workspaceId, campaigns, overview, syncStructureToBackend, callApi]);

  // ─── Finalize Plan ──────────────────────────────────────────────────────
  const handleFinalize = useCallback(async () => {
    if (!workspaceId) return;
    await syncStructureToBackend(campaigns, overview);
    await callApi(async () => {
      await finalizePlan(workspaceId);
    }, 'Đang hoàn tất và chốt kế hoạch...');
  }, [workspaceId, campaigns, overview, syncStructureToBackend, callApi]);

  // ─── Manual Handlers (Add / Edit / Delete) ─────────────────────────────
  const setSource = (obj) => ({ ...obj, source: obj.source || 'USER_EDITED' });

  const handleSeedChange = (field, val) => setSeedInput((p) => ({ ...p, [field]: val }));

  // Campaigns manual controls
  const handleAddCampaign = () => {
    setCampaigns((prev) => [
      ...prev,
      {
        name: `Chiến dịch mới #${prev.length + 1}`,
        objective: 'Tăng nhận diện thương hiệu & tương tác khách hàng',
        description: 'Mô tả chi tiết chiến dịch',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        topics: [],
        source: 'USER_CREATED',
      },
    ]);
  };

  const handleCampaignChange = (ci, field, val) => {
    setCampaigns((prev) => {
      const copy = [...prev];
      if (copy[ci]) copy[ci] = setSource({ ...copy[ci], [field]: val });
      return copy;
    });
  };

  const handleDeleteCampaign = (ci) => {
    if (!window.confirm('Xoá chiến dịch này và tất cả chủ đề/bài viết liên quan?')) return;
    setCampaigns((prev) => prev.filter((_, idx) => idx !== ci));
  };

  // Topics manual controls
  const handleAddTopic = (ci) => {
    setCampaigns((prev) => {
      const copy = [...prev];
      const camp = copy[ci];
      if (camp) {
        const topics = Array.isArray(camp.topics) ? [...camp.topics] : [];
        topics.push({
          name: `Chủ đề mới #${topics.length + 1}`,
          description: 'Mô tả ngắn cho chủ đề này',
          posts: [],
          source: 'USER_CREATED',
        });
        copy[ci] = { ...camp, topics };
      }
      return copy;
    });
  };

  const handleTopicChange = (ci, ti, field, val) => {
    setCampaigns((prev) => {
      const copy = [...prev];
      const camp = copy[ci];
      if (camp?.topics) {
        const topics = [...camp.topics];
        if (topics[ti]) topics[ti] = setSource({ ...topics[ti], [field]: val });
        copy[ci] = { ...camp, topics };
      }
      return copy;
    });
  };

  const handleDeleteTopic = (ci, ti) => {
    setCampaigns((prev) => {
      const copy = [...prev];
      const camp = copy[ci];
      if (camp?.topics) {
        const topics = camp.topics.filter((_, idx) => idx !== ti);
        copy[ci] = { ...camp, topics };
      }
      return copy;
    });
  };

  // Posts manual controls
  const handleAddPost = (ci, ti) => {
    setCampaigns((prev) => {
      const copy = [...prev];
      const camp = copy[ci];
      if (camp?.topics) {
        const topics = [...camp.topics];
        const topic = topics[ti];
        if (topic) {
          const posts = Array.isArray(topic.posts) ? [...topic.posts] : [];
          posts.push({
            title: `Bài viết mới #${posts.length + 1}`,
            objective: 'Thu hút sự chú ý của khách hàng',
            contentBrief: 'Tóm tắt nội dung chính cần truyền tải',
            mediaSuggestion: 'Hình ảnh thiết kế banner sản phẩm',
            hashtagsSuggestion: '#Marketing #AutoMarketing',
            platformSuggestion: 'Facebook',
            scheduleSuggestion: 'Buổi sáng (8h-9h)',
            confidence: 0.9,
            note: 'Tự thêm thủ công',
            source: 'USER_CREATED',
          });
          topics[ti] = { ...topic, posts };
          copy[ci] = { ...camp, topics };
        }
      }
      return copy;
    });
  };

  const handlePostChange = (ci, ti, pi, field, val) => {
    setCampaigns((prev) => {
      const copy = [...prev];
      const camp = copy[ci];
      if (camp?.topics) {
        const topics = [...camp.topics];
        const topic = topics[ti];
        if (topic?.posts) {
          const posts = [...topic.posts];
          if (posts[pi]) posts[pi] = setSource({ ...posts[pi], [field]: val });
          topics[ti] = { ...topic, posts };
          copy[ci] = { ...camp, topics };
        }
      }
      return copy;
    });
  };

  const handleDeletePost = (ci, ti, pi) => {
    setCampaigns((prev) => {
      const copy = [...prev];
      const camp = copy[ci];
      if (camp?.topics) {
        const topics = [...camp.topics];
        const topic = topics[ti];
        if (topic?.posts) {
          const posts = topic.posts.filter((_, idx) => idx !== pi);
          topics[ti] = { ...topic, posts };
          copy[ci] = { ...camp, topics };
        }
      }
      return copy;
    });
  };

  // ─── Render View ────────────────────────────────────────────────────────
  if (draftLoading) return <LoadingSplash />;

  return (
    <div className="sp-page">
      {/* Global Anti-Spam Loading Overlay */}
      <PlannerLoadingOverlay isLoading={loading} message={loadMsg} />

      <StagePageHeader workspaceId={workspaceId} />

      {/* Progress Indicator - Purely linear, no clicking back */}
      <StageProgress currentStage={stage} />

      {error && <PlannerAlert tone="error" message={error} onDismiss={() => setError(null)} />}

      {/* STEP 0: Init Form */}
      {stage === PLAN_STAGES.INIT && (
        <InitStep
          seedInput={seedInput}
          onChange={handleSeedChange}
          pendingFiles={pendingFiles}
          setPendingFiles={setPendingFiles}
          onStartPlan={handleStartPlan}
          loading={loading}
        />
      )}

      {/* STEP 1: Campaigns Stage */}
      {stage === PLAN_STAGES.CAMPAIGNS_GENERATED && (
        <CampaignsStep
          overview={overview}
          campaigns={campaigns}
          freeText={freeText}
          setFreeText={setFreeText}
          onCampaignChange={handleCampaignChange}
          onAddCampaign={handleAddCampaign}
          onDeleteCampaign={handleDeleteCampaign}
          onRegenAll={handleRegenCampaigns}
          onProceedToTopics={handleProceedToTopics}
          loading={loading}
        />
      )}

      {/* STEP 2: Topics Stage */}
      {stage === PLAN_STAGES.TOPICS_GENERATED && (
        <TopicsStep
          campaigns={campaigns}
          freeText={freeText}
          setFreeText={setFreeText}
          onTopicChange={handleTopicChange}
          onAddTopic={handleAddTopic}
          onDeleteTopic={handleDeleteTopic}
          onRegenTopics={handleRegenBatchTopics}
          onProceedToPosts={handleProceedToPosts}
          loading={loading}
        />
      )}

      {/* STEP 3: Posts Stage */}
      {stage === PLAN_STAGES.POSTS_GENERATED && (
        <PostsStep
          campaigns={campaigns}
          freeText={freeText}
          setFreeText={setFreeText}
          onPostChange={handlePostChange}
          onAddPost={handleAddPost}
          onDeletePost={handleDeletePost}
          onRegenPosts={handleRegenBatchPosts}
          onProceedToReview={handleProceedToFinalReview}
          loading={loading}
        />
      )}

      {/* STEP 4: Overall Review Stage */}
      {stage === PLAN_STAGES.CONFIRMED && (
        <ConfirmedStep
          campaigns={campaigns}
          overview={overview}
          seedInput={seedInput}
          workspaceId={workspaceId}
          onCampaignChange={handleCampaignChange}
          onTopicChange={handleTopicChange}
          onPostChange={handlePostChange}
          onAddCampaign={handleAddCampaign}
          onAddTopic={handleAddTopic}
          onAddPost={handleAddPost}
          onDeleteCampaign={handleDeleteCampaign}
          onDeleteTopic={handleDeleteTopic}
          onDeletePost={handleDeletePost}
          onFinalize={handleFinalize}
          loading={loading}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Sub-components & Helpers
// ─────────────────────────────────────────────────────────────────────────

function LoadingSplash() {
  return (
    <div className="sp-page">
      <div className="sp-card">
        <div className="sp-loading">
          <div className="sp-loading__spinner" />
          <p className="sp-loading__text">Đang tải cấu trúc kế hoạch...</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// STEP 0: Init Form Component
// ─────────────────────────────────────────────────────────────────────────
function InitStep({ seedInput, onChange, pendingFiles, setPendingFiles, onStartPlan, loading }) {
  const isFormValid = seedInput.companyName && seedInput.companyName.trim().length > 0;

  return (
    <section className="sp-card">
      <div className="sp-step-header">
        <h2 className="sp-step-title">Bước 1 — Khởi tạo Thông tin Doanh nghiệp</h2>
        <p className="sp-step-subtitle">
          Cung cấp các thông tin nền tảng về thương hiệu và tài liệu đính kèm. AI sẽ phân tích
          chuyên sâu để lên kế hoạch.
        </p>
      </div>

      <div className="sp-grid-2">
        {SEED_INPUT_FIELDS.map((f) => (
          <div
            key={f.name}
            className={f.as === 'textarea' || f.name === 'companyName' ? 'sp-grid-full' : ''}
          >
            <FieldRow
              label={f.label}
              value={seedInput[f.name]}
              onChange={(val) => onChange(f.name, val)}
              type={f.as === 'textarea' ? 'textarea' : 'text'}
              rows={f.rows || 2}
              required={f.required}
              disabled={loading}
              placeholder={f.placeholder}
            />
          </div>
        ))}
      </div>

      {/* File Dropzone */}
      <div className="sp-file-section">
        <label className="sp-field__label">File tài liệu đính kèm (Tuỳ chọn)</label>
        <PlannerDropzone onFiles={(files) => setPendingFiles((p) => [...p, ...files])} />
        {pendingFiles.length > 0 && (
          <div className="sp-file-list">
            {pendingFiles.map((f, idx) => (
              <div key={idx} className="sp-file-item">
                <span className="sp-file-item__name">
                  <FileTextIcon size={14} /> {f.name || f.file?.name}
                </span>
                <button
                  type="button"
                  className="sp-file-item__remove"
                  onClick={() => setPendingFiles((p) => p.filter((_, i) => i !== idx))}
                  disabled={loading}
                  title="Xoá file"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sp-footer">
        <button
          type="button"
          className="sp-btn sp-btn--primary"
          onClick={onStartPlan}
          disabled={!isFormValid || loading}
        >
          Tạo Kế Hoạch
        </button>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// STEP 1: Campaigns Step Component
// ─────────────────────────────────────────────────────────────────────────
function CampaignsStep({
  overview,
  campaigns,
  freeText,
  setFreeText,
  onCampaignChange,
  onAddCampaign,
  onDeleteCampaign,
  onRegenAll,
  onProceedToTopics,
  loading,
}) {
  return (
    <section className="sp-card">
      <div
        className="sp-step-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <div>
          <h2 className="sp-step-title">
            Bước 2 — Danh sách Chiến dịch Quảng bá ({campaigns.length})
          </h2>
          <p className="sp-step-subtitle">
            Xem, chỉnh sửa hoặc thêm/xoá các chiến dịch trước khi chuyển sang sinh các chủ đề chi
            tiết.
          </p>
        </div>
        <button
          type="button"
          className="sp-btn sp-btn--dashed sp-btn--sm"
          onClick={onAddCampaign}
          disabled={loading}
        >
          <PlusIcon size={14} /> Thêm chiến dịch
        </button>
      </div>

      <RegenerateBar
        freeText={freeText}
        setFreeText={setFreeText}
        onRegen={onRegenAll}
        loading={loading}
      />

      <div className="sp-thread">
        {campaigns.map((c, ci) => (
          <div key={ci} className="sp-thread__campaign sp-hover-reveal">
            <div className="sp-thread__campaign-header">
              <div className="sp-thread__campaign-title-group">
                <span className="sp-thread__campaign-number">{ci + 1}</span>
                <input
                  type="text"
                  className="sp-field__title-input"
                  value={c.name || ''}
                  onChange={(e) => onCampaignChange(ci, 'name', e.target.value)}
                  placeholder="Tên chiến dịch"
                  disabled={loading}
                />
              </div>
              <div className="sp-thread__campaign-actions sp-hover-reveal__actions">
                <EntitySourceBadge source={c.source} />
                <button
                  type="button"
                  className="sp-btn sp-btn--danger"
                  onClick={() => onDeleteCampaign(ci)}
                  disabled={loading}
                  title="Xoá chiến dịch"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            </div>

            <div className="sp-grid-2">
              <FieldRow
                label="Mục tiêu chiến dịch"
                value={c.objective}
                onChange={(v) => onCampaignChange(ci, 'objective', v)}
                disabled={loading}
              />
              <FieldRow
                label="Mô tả chiến dịch"
                value={c.description}
                onChange={(v) => onCampaignChange(ci, 'description', v)}
                type="textarea"
                rows={2}
                disabled={loading}
              />
            </div>

            <div className="sp-grid-2" style={{ marginTop: 16 }}>
              <FieldRow
                label="Ngày bắt đầu"
                value={c.startDate}
                onChange={(v) => onCampaignChange(ci, 'startDate', v)}
                type="date"
                disabled={loading}
              />
              <FieldRow
                label="Ngày kết thúc"
                value={c.endDate}
                onChange={(v) => onCampaignChange(ci, 'endDate', v)}
                type="date"
                disabled={loading}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="sp-footer">
        <button
          type="button"
          className="sp-btn sp-btn--primary"
          onClick={onProceedToTopics}
          disabled={loading || campaigns.length === 0}
        >
          Tiếp tục — Sinh Chủ Đề
        </button>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// STEP 2: Topics Step Component
// ─────────────────────────────────────────────────────────────────────────
function TopicsStep({
  campaigns,
  freeText,
  setFreeText,
  onTopicChange,
  onAddTopic,
  onDeleteTopic,
  onRegenTopics,
  onProceedToPosts,
  loading,
}) {
  return (
    <section className="sp-card">
      <div className="sp-step-header">
        <h2 className="sp-step-title">Bước 3 — Danh sách Chủ đề Nội dung theo Chiến dịch</h2>
        <p className="sp-step-subtitle">
          Kiểm tra các chủ đề được AI khởi tạo cho từng chiến dịch. Bạn có thể tự do thêm/sửa/xoá
          bằng tay hoặc sinh lại.
        </p>
      </div>

      <RegenerateBar
        freeText={freeText}
        setFreeText={setFreeText}
        onRegen={onRegenTopics}
        loading={loading}
      />

      <div className="sp-thread">
        {campaigns.map((c, ci) => (
          <div key={ci} className="sp-thread__campaign">
            <div className="sp-thread__campaign-header">
              <div className="sp-thread__campaign-title-group">
                <FolderIcon
                  size={16}
                  style={{ color: 'var(--sp-text-secondary)', flexShrink: 0 }}
                />
                <span
                  className="sp-field__title-input"
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    border: 'none',
                    padding: 0,
                    cursor: 'default',
                  }}
                >
                  {c.name || `Chiến dịch #${ci + 1}`}
                </span>
              </div>
              <button
                type="button"
                className="sp-btn sp-btn--dashed sp-btn--sm"
                onClick={() => onAddTopic(ci)}
                disabled={loading}
              >
                <PlusIcon size={13} /> Thêm chủ đề
              </button>
            </div>

            {c.objective && (
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--sp-text-secondary)',
                  margin: '-12px 0 16px',
                  lineHeight: 1.5,
                }}
              >
                {c.objective}
              </p>
            )}

            <div>
              {Array.isArray(c.topics) && c.topics.length > 0 ? (
                c.topics.map((t, ti) => (
                  <div key={ti} className="sp-thread__topic sp-hover-reveal">
                    <div className="sp-thread__topic-header">
                      <div className="sp-thread__topic-title-group">
                        <span className="sp-thread__topic-icon">
                          <TargetIcon size={14} />
                        </span>
                        <input
                          type="text"
                          className="sp-field__title-input"
                          value={t.name || ''}
                          onChange={(e) => onTopicChange(ci, ti, 'name', e.target.value)}
                          placeholder="Tên chủ đề"
                          disabled={loading}
                          style={{ fontSize: 14, fontWeight: 500 }}
                        />
                      </div>
                      <div className="sp-thread__topic-actions sp-hover-reveal__actions">
                        <EntitySourceBadge source={t.source} />
                        <button
                          type="button"
                          className="sp-btn sp-btn--danger"
                          onClick={() => onDeleteTopic(ci, ti)}
                          disabled={loading}
                          title="Xoá chủ đề"
                        >
                          <TrashIcon size={15} />
                        </button>
                      </div>
                    </div>
                    <FieldRow
                      label="Mô tả nội dung chủ đề"
                      value={t.description}
                      onChange={(v) => onTopicChange(ci, ti, 'description', v)}
                      type="textarea"
                      rows={2}
                      disabled={loading}
                    />
                  </div>
                ))
              ) : (
                <div className="sp-empty">
                  <div className="sp-empty__icon">
                    <TargetIcon size={16} />
                  </div>
                  <p className="sp-empty__text">Chưa có chủ đề nào trong chiến dịch này.</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="sp-footer">
        <button
          type="button"
          className="sp-btn sp-btn--primary"
          onClick={onProceedToPosts}
          disabled={loading}
        >
          Tiếp tục — Sinh Khung Bài Viết
        </button>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// STEP 3: Posts Step Component
// ─────────────────────────────────────────────────────────────────────────
function PostsStep({
  campaigns,
  freeText,
  setFreeText,
  onPostChange,
  onAddPost,
  onDeletePost,
  onRegenPosts,
  onProceedToReview,
  loading,
}) {
  return (
    <section className="sp-card">
      <div className="sp-step-header">
        <h2 className="sp-step-title">Bước 4 — Khung Bài viết Skeleton</h2>
        <p className="sp-step-subtitle">
          Review và điều chỉnh trực tiếp các định hướng nội dung bài viết trước khi chốt tổng thể.
        </p>
      </div>

      <RegenerateBar
        freeText={freeText}
        setFreeText={setFreeText}
        onRegen={onRegenPosts}
        loading={loading}
      />

      <div className="sp-thread">
        {campaigns.map((c, ci) => (
          <div key={ci} className="sp-thread__campaign">
            <div className="sp-thread__campaign-header" style={{ marginBottom: 16 }}>
              <div className="sp-thread__campaign-title-group">
                <FolderIcon
                  size={16}
                  style={{ color: 'var(--sp-text-secondary)', flexShrink: 0 }}
                />
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--sp-text-primary)' }}>
                  Chiến dịch: {c.name || `#${ci + 1}`}
                </span>
              </div>
            </div>

            <div>
              {Array.isArray(c.topics) &&
                c.topics.map((t, ti) => (
                  <div key={ti} className="sp-thread__topic">
                    <div className="sp-thread__topic-header">
                      <div className="sp-thread__topic-title-group">
                        <span className="sp-thread__topic-icon">
                          <TargetIcon size={14} />
                        </span>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: 'var(--sp-text-secondary)',
                          }}
                        >
                          Chủ đề: {t.name || `#${ti + 1}`}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="sp-btn sp-btn--dashed sp-btn--sm"
                        onClick={() => onAddPost(ci, ti)}
                        disabled={loading}
                      >
                        <PlusIcon size={12} /> Thêm bài viết
                      </button>
                    </div>

                    <div>
                      {Array.isArray(t.posts) && t.posts.length > 0 ? (
                        t.posts.map((p, pi) => (
                          <div key={pi} className="sp-thread__post sp-hover-reveal">
                            <div className="sp-thread__post-header">
                              <div className="sp-thread__post-title-group">
                                <span className="sp-thread__post-icon">
                                  <FileTextIcon size={13} />
                                </span>
                                <input
                                  type="text"
                                  className="sp-field__title-input"
                                  value={p.title || ''}
                                  onChange={(e) =>
                                    onPostChange(ci, ti, pi, 'title', e.target.value)
                                  }
                                  placeholder="Tiêu đề bài viết"
                                  disabled={loading}
                                  style={{ fontSize: 14, fontWeight: 500 }}
                                />
                              </div>
                              <div className="sp-thread__post-actions sp-hover-reveal__actions">
                                <EntitySourceBadge source={p.source} />
                                <button
                                  type="button"
                                  className="sp-btn sp-btn--danger"
                                  onClick={() => onDeletePost(ci, ti, pi)}
                                  disabled={loading}
                                  title="Xoá bài viết"
                                >
                                  <TrashIcon size={15} />
                                </button>
                              </div>
                            </div>

                            <div className="sp-grid-2">
                              <FieldRow
                                label="Mục tiêu bài viết"
                                value={p.objective}
                                onChange={(v) => onPostChange(ci, ti, pi, 'objective', v)}
                                disabled={loading}
                              />
                              <FieldRow
                                label="Gợi ý Media/Hình ảnh"
                                value={p.mediaSuggestion}
                                onChange={(v) => onPostChange(ci, ti, pi, 'mediaSuggestion', v)}
                                disabled={loading}
                              />
                            </div>

                            <div style={{ marginTop: 16 }}>
                              <FieldRow
                                label="Content Brief (Tóm tắt nội dung)"
                                value={p.contentBrief}
                                onChange={(v) => onPostChange(ci, ti, pi, 'contentBrief', v)}
                                type="textarea"
                                rows={2}
                                disabled={loading}
                              />
                            </div>

                            <div className="sp-grid-3" style={{ marginTop: 16 }}>
                              <FieldRow
                                label="Nền tảng"
                                value={p.platformSuggestion}
                                onChange={(v) => onPostChange(ci, ti, pi, 'platformSuggestion', v)}
                                disabled={loading}
                              />
                              <FieldRow
                                label="Lịch đăng gợi ý"
                                value={p.scheduleSuggestion}
                                onChange={(v) => onPostChange(ci, ti, pi, 'scheduleSuggestion', v)}
                                disabled={loading}
                              />
                              <FieldRow
                                label="Hashtags"
                                value={p.hashtagsSuggestion}
                                onChange={(v) => onPostChange(ci, ti, pi, 'hashtagsSuggestion', v)}
                                disabled={loading}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="sp-empty">
                          <div className="sp-empty__icon">
                            <FileTextIcon size={15} />
                          </div>
                          <p className="sp-empty__text">Chưa có bài viết nào trong chủ đề này.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sp-footer">
        <button
          type="button"
          className="sp-btn sp-btn--primary"
          onClick={onProceedToReview}
          disabled={loading}
        >
          Tiếp tục — Review & Hoàn Tất
        </button>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// STEP 4: Confirmed / Overall Review Component
// ─────────────────────────────────────────────────────────────────────────
function ConfirmedStep({
  campaigns,
  overview,
  seedInput,
  workspaceId,
  onCampaignChange,
  onTopicChange,
  onPostChange,
  onAddCampaign,
  onAddTopic,
  onAddPost,
  onDeleteCampaign,
  onDeleteTopic,
  onDeletePost,
  onFinalize,
  loading,
}) {
  return (
    <section className="sp-card">
      <div className="sp-review-header">
        <div className="sp-review-icon">
          <SparkleIcon size={22} />
        </div>
        <h2 className="sp-review-title">Review Tổng Thể Kế Hoạch</h2>
        <p className="sp-review-subtitle">
          Toàn bộ kế hoạch đã được tạo. Bạn có thể xem lại chi tiết trước khi chốt.
        </p>
      </div>

      <div className="sp-brand-info">
        <h3 className="sp-section-title">Thông tin Thương hiệu</h3>
        <div className="sp-brand-info__grid">
          <div>
            <span className="sp-brand-info__label">Tên công ty:</span>{' '}
            {seedInput.companyName || overview?.workspaceName || 'Chưa cập nhật'}
          </div>
          <div>
            <span className="sp-brand-info__label">Giai đoạn:</span>{' '}
            {seedInput.campaignPeriod || 'Chưa cập nhật'}
          </div>
          <div>
            <span className="sp-brand-info__label">Giọng điệu:</span>{' '}
            {seedInput.brandTone || overview?.brandTone || 'Chưa cập nhật'}
          </div>
          <div>
            <span className="sp-brand-info__label">Ngành hàng:</span>{' '}
            {seedInput.industryAndBusinessModel || 'Chưa cập nhật'}
          </div>
          <div className="sp-brand-info__full">
            <span className="sp-brand-info__label">Khách hàng mục tiêu:</span>{' '}
            {seedInput.targetCustomerPersona || overview?.targetAudience || 'Chưa cập nhật'}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h3 className="sp-section-title" style={{ margin: 0 }}>
          Chi tiết Kế Hoạch
        </h3>
        <button
          type="button"
          className="sp-btn sp-btn--dashed sp-btn--sm"
          onClick={onAddCampaign}
          disabled={loading}
        >
          <PlusIcon size={13} /> Thêm chiến dịch
        </button>
      </div>

      <div className="sp-thread">
        {campaigns.map((c, ci) => (
          <div key={ci} className="sp-thread__campaign">
            <div className="sp-thread__campaign-header">
              <div
                className="sp-thread__campaign-title-group"
                style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="sp-thread__campaign-number">{ci + 1}</span>
                  <input
                    type="text"
                    className="sp-field__title-input"
                    value={c.name || ''}
                    onChange={(e) => onCampaignChange(ci, 'name', e.target.value)}
                    placeholder="Tên chiến dịch"
                    disabled={loading}
                  />
                </div>
                <div className="sp-grid-2">
                  <FieldRow
                    label="Mục tiêu"
                    value={c.objective}
                    onChange={(v) => onCampaignChange(ci, 'objective', v)}
                    disabled={loading}
                  />
                  <div className="sp-field">
                    <label className="sp-field__label">Thời gian</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="date"
                        className="sp-field__input"
                        value={c.startDate || ''}
                        onChange={(e) => onCampaignChange(ci, 'startDate', e.target.value)}
                        disabled={loading}
                      />
                      <span style={{ color: 'var(--sp-text-muted)' }}>—</span>
                      <input
                        type="date"
                        className="sp-field__input"
                        value={c.endDate || ''}
                        onChange={(e) => onCampaignChange(ci, 'endDate', e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <FieldRow
                    label="Mô tả"
                    value={c.description}
                    onChange={(v) => onCampaignChange(ci, 'description', v)}
                    type="textarea"
                    rows={2}
                    disabled={loading}
                  />
                </div>
              </div>
              <div
                className="sp-thread__campaign-actions"
                style={{ flexDirection: 'column', gap: 8 }}
              >
                <button
                  type="button"
                  className="sp-btn sp-btn--dashed sp-btn--sm"
                  onClick={() => onAddTopic(ci)}
                  disabled={loading}
                >
                  <PlusIcon size={12} /> Thêm chủ đề
                </button>
                <button
                  type="button"
                  className="sp-btn sp-btn--danger"
                  onClick={() => onDeleteCampaign(ci)}
                  disabled={loading}
                  title="Xoá chiến dịch"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            </div>

            <div>
              {Array.isArray(c.topics) &&
                c.topics.map((t, ti) => (
                  <div key={ti} className="sp-thread__topic">
                    <div className="sp-thread__topic-header">
                      <div
                        className="sp-thread__topic-title-group"
                        style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="sp-thread__topic-icon">
                            <TargetIcon size={14} />
                          </span>
                          <input
                            type="text"
                            className="sp-field__title-input"
                            value={t.name || ''}
                            onChange={(e) => onTopicChange(ci, ti, 'name', e.target.value)}
                            placeholder="Tên chủ đề"
                            disabled={loading}
                            style={{ fontSize: 14, fontWeight: 500 }}
                          />
                        </div>
                        <div>
                          <FieldRow
                            label="Mô tả nội dung"
                            value={t.description}
                            onChange={(v) => onTopicChange(ci, ti, 'description', v)}
                            type="textarea"
                            rows={2}
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <div
                        className="sp-thread__topic-actions"
                        style={{ flexDirection: 'column', gap: 8 }}
                      >
                        <button
                          type="button"
                          className="sp-btn sp-btn--dashed sp-btn--sm"
                          onClick={() => onAddPost(ci, ti)}
                          disabled={loading}
                        >
                          <PlusIcon size={12} /> Bài viết
                        </button>
                        <button
                          type="button"
                          className="sp-btn sp-btn--danger"
                          onClick={() => onDeleteTopic(ci, ti)}
                          disabled={loading}
                          title="Xoá chủ đề"
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </div>

                    <div>
                      {Array.isArray(t.posts) &&
                        t.posts.map((p, pi) => (
                          <div key={pi} className="sp-thread__post sp-hover-reveal">
                            <div className="sp-thread__post-header">
                              <div
                                className="sp-thread__post-title-group"
                                style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span className="sp-thread__post-icon">
                                    <FileTextIcon size={13} />
                                  </span>
                                  <input
                                    type="text"
                                    className="sp-field__title-input"
                                    value={p.title || ''}
                                    onChange={(e) =>
                                      onPostChange(ci, ti, pi, 'title', e.target.value)
                                    }
                                    placeholder="Tiêu đề bài viết"
                                    disabled={loading}
                                    style={{ fontSize: 14, fontWeight: 500 }}
                                  />
                                </div>
                                <div className="sp-grid-2">
                                  <FieldRow
                                    label="Mục tiêu"
                                    value={p.objective}
                                    onChange={(v) => onPostChange(ci, ti, pi, 'objective', v)}
                                    disabled={loading}
                                  />
                                  <FieldRow
                                    label="Gợi ý Media"
                                    value={p.mediaSuggestion}
                                    onChange={(v) => onPostChange(ci, ti, pi, 'mediaSuggestion', v)}
                                    disabled={loading}
                                  />
                                </div>
                                <div>
                                  <FieldRow
                                    label="Content Brief"
                                    value={p.contentBrief}
                                    onChange={(v) => onPostChange(ci, ti, pi, 'contentBrief', v)}
                                    type="textarea"
                                    rows={2}
                                    disabled={loading}
                                  />
                                </div>
                                <div className="sp-grid-3">
                                  <FieldRow
                                    label="Nền tảng"
                                    value={p.platformSuggestion}
                                    onChange={(v) =>
                                      onPostChange(ci, ti, pi, 'platformSuggestion', v)
                                    }
                                    disabled={loading}
                                  />
                                  <FieldRow
                                    label="Lịch đăng"
                                    value={p.scheduleSuggestion}
                                    onChange={(v) =>
                                      onPostChange(ci, ti, pi, 'scheduleSuggestion', v)
                                    }
                                    disabled={loading}
                                  />
                                  <FieldRow
                                    label="Hashtag"
                                    value={p.hashtagsSuggestion}
                                    onChange={(v) =>
                                      onPostChange(ci, ti, pi, 'hashtagsSuggestion', v)
                                    }
                                    disabled={loading}
                                  />
                                </div>
                              </div>
                              <div className="sp-thread__post-actions sp-hover-reveal__actions">
                                <button
                                  type="button"
                                  className="sp-btn sp-btn--danger"
                                  onClick={() => onDeletePost(ci, ti, pi)}
                                  disabled={loading}
                                  title="Xoá bài viết"
                                >
                                  <TrashIcon size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sp-footer">
        <button
          type="button"
          className="sp-btn sp-btn--primary"
          onClick={onFinalize}
          disabled={loading}
          style={{ padding: '12px 32px' }}
        >
          Chốt & Lưu Kế Hoạch Đã Tạo
        </button>
      </div>
    </section>
  );
}

export default StagedPlannerPage;
