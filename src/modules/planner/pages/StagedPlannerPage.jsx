import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StageProgress from '../components/StageProgress';
import EntitySourceBadge from '../components/EntitySourceBadge';
import FieldRow from '../components/FieldRow';
import RegenerateBar from '../components/RegenerateBar';
import StagePageHeader from '../components/StagePageHeader';
import {
  SparkleIcon,
  PlusIcon,
  TrashIcon,
  TargetIcon,
  FileTextIcon,
} from '../components/PlannerIcons';
import PlannerAlert from '../components/PlannerAlert';
import PlannerDropzone from '../components/PlannerDropzone';
import PlannerPendingFileList from '../components/PlannerPendingFileList';
import PlannerDocumentLibrary from '../components/PlannerDocumentLibrary';
import PlannerLoadingOverlay from '../components/PlannerLoadingOverlay';
import StagedPlannerIntroPanel from '../components/StagedPlannerIntroPanel';
import { PLAN_STAGES, SEED_INPUT_FIELDS } from '../utils/stagedPlannerConstants';
import {
  STAGED_INIT_COPY,
  STAGED_CAMPAIGNS_COPY,
  STAGED_TOPICS_COPY,
  STAGED_POSTS_COPY,
  STAGED_REVIEW_COPY,
  STAGED_REGEN_COPY,
  STAGED_DRAFT_COPY,
  STAGED_ERROR_COPY,
} from '../utils/stagedPlannerCopy';
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
  finalizeAndMaterializePlan,
} from '../api/stagedPlannerApi';
import { planDraftApi, parsePlanDraftResponse } from '../api/plannerApi';
import { documentApi } from '../../campaigns/api/documentApi';
import { useWorkspaceDocuments } from '../hooks/useWorkspaceDocuments';
import { API_BASE_URL } from '../../../config/env';
import { showTokenToast } from '../../subscription/components/TokenToast';
import UpgradeModal from '../../subscription/components/UpgradeModal';
import '../styles/StagedPlannerPage.css';

// ─────────────────────────────────────────────────────────────────────────
// Main StagedPlannerPage
// ─────────────────────────────────────────────────────────────────────────
function StagedPlannerPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [stage, setStage] = useState(PLAN_STAGES.INIT);
  const [error, setError] = useState(null);
  const [draftLoading, setDraftLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [introCollapsed, setIntroCollapsed] = useState(true);

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

  const {
    documents, docsLoading, docsError, totalCount,
    searchQuery, setSearchQuery, selectedDocIds, setSelectedDocIds,
    handleToggleDoc, handleSelectAllSupported, handleClearSelection,
    loadDocuments, handleDeleteDocument, uploadMultipleDocuments
  } = useWorkspaceDocuments(workspaceId);

  const [pendingFiles, setPendingFiles] = useState([]);
  const [alsoSaveToLibrary, setAlsoSaveToLibrary] = useState(true);

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

  // Helper bóc tách TokenAwareResponse: phát tín hiệu quota:changed và hiển thị Toast token
  const processTokenAwareResponse = useCallback((raw) => {
    let d = raw?.data ?? raw;
    if (typeof d === 'string') {
      try { d = JSON.parse(d); } catch (e) {}
    }
    if (d && typeof d === 'object' && 'tokensUsed' in d) {
      window.dispatchEvent(new CustomEvent('quota:changed'));
      showTokenToast(d.tokensUsed, d.remainingToken);
      return d.payload ?? d;
    }
    return d;
  }, []);

  // ─── Generic safe API caller wrapper ────────────────────────────────────
  const callApi = useCallback(async (fn, msg) => {
    setLoading(true);
    setLoadMsg(msg);
    setError(null);
    try {
      const res = await fn();
      let d = res?.data ?? res;
      if (typeof d === 'string') {
        try { d = JSON.parse(d); } catch (e) {}
      }

      if (d && typeof d === 'object' && 'payload' in d && 'tokensUsed' in d) {
        window.dispatchEvent(new CustomEvent('quota:changed'));
        showTokenToast(d.tokensUsed, d.remainingToken);
        return d.payload;
      }

      return d;
    } catch (err) {
      const status = err?.response?.status || err?.status;
      if (status === 402) {
        setShowUpgrade(true);
      } else {
        setError(err.message || STAGED_ERROR_COPY.generic);
      }
      // Khác với trước đây, không throw err nữa để tránh bung popup Uncaught Runtime Errors
      // Các callback truyền vào callApi nếu gặp lỗi thì sẽ dừng lại tại dòng lỗi, 
      // sau đó lỗi ném ra bị callApi bắt và xử lý hiển thị UI.
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
    
    if (!seedInput.companyName.trim()) {
      setError('Vui lòng điền Tên Công ty / Thương hiệu.');
      return;
    }

    await callApi(async () => {
      let finalDocIds = [...selectedDocIds];
      let filesToUploadInline = pendingFiles.map((p) => p.file || p);

      if (pendingFiles.length > 0 && alsoSaveToLibrary) {
        // Upload file vào thư viện workspace trước
        const uploadResArray = await uploadMultipleDocuments(filesToUploadInline);
        if (uploadResArray && uploadResArray.length > 0) {
          const newIds = uploadResArray.map(res => res.data?.id).filter(Boolean);
          finalDocIds = [...finalDocIds, ...newIds];
        }
        setPendingFiles([]); // Xoá pending file vì đã up
        loadDocuments();     // Cập nhật lại list UI
        filesToUploadInline = []; // Không truyền file thô vào initDraft nữa vì đã có ID
      }

      const seedJson = JSON.stringify(seedInput);
      await initDraft(workspaceId, {
        seedInput: seedJson,
        files: filesToUploadInline,
        documentIds: finalDocIds,
      });

      const raw = await generateCampaigns(workspaceId);
      const data = processTokenAwareResponse(raw);
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
    }, STAGED_INIT_COPY.loadingMsg);
  }, [workspaceId, seedInput, pendingFiles, selectedDocIds, callApi, processTokenAwareResponse, alsoSaveToLibrary, loadDocuments]);

  // ─── Regenerate Campaigns ───────────────────────────────────────────────
  const handleRegenCampaigns = useCallback(async () => {
    if (!workspaceId) return;
    await syncStructureToBackend(campaigns, overview);
    const data = await callApi(
      async () => {
        const raw = await regenerateCampaigns(workspaceId, {
          freeTextInstructions: freeText.trim() ? [freeText] : [],
          campaignIndex: -1,
          topicIndex: -1,
        });
        return processTokenAwareResponse(raw);
      },
      STAGED_CAMPAIGNS_COPY.regenLoadingMsg
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
  }, [workspaceId, freeText, campaigns, overview, syncStructureToBackend, callApi, processTokenAwareResponse]);

  // ─── Step 1 -> Step 2: Confirm Campaigns & Generate Batch Topics ────────
  const handleProceedToTopics = useCallback(async () => {
    if (!workspaceId) return;
    await syncStructureToBackend(campaigns, overview);
    await callApi(async () => {
      // Gọi generateTopics TRƯỚC khi stage còn CAMPAIGNS_GENERATED (backend assertStage yêu cầu vậy)
      const raw = await generateTopics(workspaceId, {
        freeTextInstructions: freeText.trim() ? [freeText] : [],
      });
      processTokenAwareResponse(raw);

      // Sau đó mới confirm chuyển stage
      await confirmStage(workspaceId, PLAN_STAGES.TOPICS_GENERATED);

      const draftRes = await planDraftApi.get(API_BASE_URL, workspaceId);
      const updated = parsePlanDraftResponse(draftRes);
      if (updated?.plan?.campaigns) {
        setCampaigns(updated.plan.campaigns);
      }
      setStage(PLAN_STAGES.TOPICS_GENERATED);
    }, STAGED_CAMPAIGNS_COPY.proceedLoadingMsg);
    setFreeText('');
  }, [workspaceId, campaigns, overview, freeText, syncStructureToBackend, callApi, processTokenAwareResponse]);

  // ─── Regenerate Topics ──────────────────────────────────────────────────
  const handleRegenBatchTopics = useCallback(async () => {
    if (!workspaceId) return;
    await syncStructureToBackend(campaigns, overview);
    await callApi(async () => {
      const raw = await regenerateTopics(workspaceId, {
        freeTextInstructions: freeText.trim() ? [freeText] : [],
      });
      processTokenAwareResponse(raw);

      const draftRes = await planDraftApi.get(API_BASE_URL, workspaceId);
      const updated = parsePlanDraftResponse(draftRes);
      if (updated?.plan?.campaigns) {
        setCampaigns(updated.plan.campaigns);
      }
    }, STAGED_TOPICS_COPY.regenLoadingMsg);
    setFreeText('');
  }, [workspaceId, campaigns, overview, freeText, syncStructureToBackend, callApi, processTokenAwareResponse]);

  // ─── Step 2 -> Step 3: Confirm Topics & Generate Batch Posts ───────────
  const handleProceedToPosts = useCallback(async () => {
    if (!workspaceId) return;
    await syncStructureToBackend(campaigns, overview);
    await callApi(async () => {
      // Gọi generatePosts TRƯỚC khi stage còn TOPICS_GENERATED (backend assertStage yêu cầu vậy)
      const raw = await generatePosts(workspaceId, { freeTextInstructions: freeText.trim() ? [freeText] : [] });
      processTokenAwareResponse(raw);

      // Sau đó mới confirm chuyển stage
      await confirmStage(workspaceId, PLAN_STAGES.POSTS_GENERATED);

      const draftRes = await planDraftApi.get(API_BASE_URL, workspaceId);
      const updated = parsePlanDraftResponse(draftRes);
      if (updated?.plan?.campaigns) {
        setCampaigns(updated.plan.campaigns);
      }
      setStage(PLAN_STAGES.POSTS_GENERATED);
    }, STAGED_TOPICS_COPY.proceedLoadingMsg);
    setFreeText('');
  }, [workspaceId, campaigns, overview, freeText, syncStructureToBackend, callApi, processTokenAwareResponse]);

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
    }, STAGED_POSTS_COPY.regenLoadingMsg);
    setFreeText('');
  }, [workspaceId, campaigns, overview, freeText, syncStructureToBackend, callApi]);

  // ─── Step 3 -> Step 4: Proceed to Final Review ──────────────────────────
  const handleProceedToFinalReview = useCallback(async () => {
    if (!workspaceId) return;
    await syncStructureToBackend(campaigns, overview);
    await callApi(async () => {
      await confirmStage(workspaceId, PLAN_STAGES.CONFIRMED);
      setStage(PLAN_STAGES.CONFIRMED);
    }, STAGED_POSTS_COPY.proceedLoadingMsg);
  }, [workspaceId, campaigns, overview, syncStructureToBackend, callApi]);

  // ─── Finalize & Materialize Plan ─────────────────────────────────────────
  const handleFinalize = useCallback(async () => {
    if (!workspaceId) return;
    await syncStructureToBackend(campaigns, overview);
    await callApi(async () => {
      await finalizeAndMaterializePlan(workspaceId);
      navigate(`/workspaces/${workspaceId}/campaigns`);
    }, STAGED_REVIEW_COPY.finalizeLoadingMsg);
  }, [workspaceId, campaigns, overview, syncStructureToBackend, callApi, navigate]);

  // ─── Manual Handlers (Add / Edit / Delete) ─────────────────────────────
  const setSource = (obj) => ({ ...obj, source: obj.source || 'USER_EDITED' });

  const handleSeedChange = (field, val) => setSeedInput((p) => ({ ...p, [field]: val }));

  // Campaigns manual controls
  const handleAddCampaign = () => {
    setCampaigns((prev) => [
      ...prev,
      {
        name: STAGED_CAMPAIGNS_COPY.newCampaignDefaults.name(prev.length + 1),
        objective: STAGED_CAMPAIGNS_COPY.newCampaignDefaults.objective,
        description: STAGED_CAMPAIGNS_COPY.newCampaignDefaults.description,
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
    if (!window.confirm(STAGED_CAMPAIGNS_COPY.deleteConfirm)) return;
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
          name: STAGED_TOPICS_COPY.newTopicDefaults.name(topics.length + 1),
          description: STAGED_TOPICS_COPY.newTopicDefaults.description,
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
            title: STAGED_POSTS_COPY.newPostDefaults.title(posts.length + 1),
            objective: STAGED_POSTS_COPY.newPostDefaults.objective,
            contentBrief: STAGED_POSTS_COPY.newPostDefaults.contentBrief,
            mediaSuggestion: STAGED_POSTS_COPY.newPostDefaults.mediaSuggestion,
            hashtagsSuggestion: STAGED_POSTS_COPY.newPostDefaults.hashtagsSuggestion,
            platformSuggestion: STAGED_POSTS_COPY.newPostDefaults.platformSuggestion,
            scheduleSuggestion: STAGED_POSTS_COPY.newPostDefaults.scheduleSuggestion,
            confidence: STAGED_POSTS_COPY.newPostDefaults.confidence,
            note: STAGED_POSTS_COPY.newPostDefaults.note,
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
      {/* UpgradeModal — hiển thị khi hết AI token (HTTP 402) */}
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />

      {/* Global Anti-Spam Loading Overlay */}
      <PlannerLoadingOverlay isLoading={loading} message={loadMsg} />

      <StagePageHeader workspaceId={workspaceId} />

      <StagedPlannerIntroPanel
        collapsed={introCollapsed}
        onToggle={() => setIntroCollapsed((value) => !value)}
      />

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
          alsoSaveToLibrary={alsoSaveToLibrary}
          setAlsoSaveToLibrary={setAlsoSaveToLibrary}
          documents={documents}
          docsLoading={docsLoading}
          docsError={docsError}
          totalCount={totalCount}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedDocIds={selectedDocIds}
          handleToggleDoc={handleToggleDoc}
          handleSelectAllSupported={handleSelectAllSupported}
          handleClearSelection={handleClearSelection}
          loadDocuments={loadDocuments}
          handleDeleteDocument={handleDeleteDocument}
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
          <p className="sp-loading__text">{STAGED_DRAFT_COPY.loading}</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// STEP 0: Init Form Component
// ─────────────────────────────────────────────────────────────────────────
function InitStep({ 
  seedInput, onChange, pendingFiles, setPendingFiles, 
  alsoSaveToLibrary, setAlsoSaveToLibrary,
  documents, docsLoading, docsError, totalCount,
  searchQuery, setSearchQuery, selectedDocIds,
  handleToggleDoc, handleSelectAllSupported, handleClearSelection,
  loadDocuments, handleDeleteDocument,
  onStartPlan, loading 
}) {
  const isFormValid = seedInput.companyName && seedInput.companyName.trim().length > 0;

  return (
    <section className="sp-card">
      <div className="sp-step-header">
        <h2 className="sp-step-title">{STAGED_INIT_COPY.stepTitle}</h2>
        <p className="sp-step-subtitle">{STAGED_INIT_COPY.stepSubtitle}</p>
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

      {/* File Dropzone & Library */}
      <div className="sp-file-section" style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Nguồn tài liệu phân tích</h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
          Chọn tài liệu có sẵn trong thư viện hoặc tải lên tài liệu mới. AI sẽ đọc toàn bộ các tài liệu được chọn.
        </p>

        <PlannerDropzone onFiles={(files) => setPendingFiles((p) => [
          ...p, 
          ...files.map((file) => ({
            key: `${file.name}|${file.size}|${file.lastModified}|${Math.random()}`,
            file,
            name: file.name,
            size: file.size,
            ext: file.name.split('.').pop().toUpperCase(),
          }))
        ])} />
        
        <PlannerPendingFileList files={pendingFiles} onRemove={(keyToRemove) => setPendingFiles((p) => p.filter((item) => item.key !== keyToRemove))} />

        {pendingFiles.length > 0 && (
          <label className="wp-checkbox" style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={alsoSaveToLibrary}
              onChange={(e) => setAlsoSaveToLibrary(e.target.checked)}
            />
            <span style={{ fontSize: 13, color: '#334155' }}>Đồng thời lưu các file mới vào thư viện tài liệu của workspace</span>
          </label>
        )}

        <div style={{ marginTop: 32 }}>
          <PlannerDocumentLibrary
            documents={documents}
            loading={docsLoading}
            error={docsError}
            totalCount={totalCount}
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e)}
            selectedDocIds={selectedDocIds}
            onToggleDoc={handleToggleDoc}
            onSelectAllSupported={handleSelectAllSupported}
            onClearSelection={handleClearSelection}
            onReload={loadDocuments}
            onDelete={handleDeleteDocument}
          />
        </div>
      </div>

      <div className="sp-footer">
        <button
          type="button"
          className="sp-btn sp-btn--primary"
          onClick={onStartPlan}
          disabled={!isFormValid || loading}
        >
          {STAGED_INIT_COPY.submitBtn}
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
          <h2 className="sp-step-title">{STAGED_CAMPAIGNS_COPY.stepTitle}</h2>
          <p className="sp-step-subtitle">{STAGED_CAMPAIGNS_COPY.stepSubtitle}</p>
        </div>
        <button
          type="button"
          className="sp-btn sp-btn--dashed sp-btn--sm"
          onClick={onAddCampaign}
          disabled={loading}
        >
          <PlusIcon size={14} /> {STAGED_CAMPAIGNS_COPY.addBtn}
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
            {/* ── Campaign Header (gradient tím) ── */}
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

            {/* ── Campaign Body ── */}
            <div className="sp-thread__campaign-body">
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
              <div className="sp-grid-2" style={{ marginTop: 14 }}>
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
          {STAGED_CAMPAIGNS_COPY.proceedBtn}
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
        <h2 className="sp-step-title">{STAGED_TOPICS_COPY.stepTitle}</h2>
        <p className="sp-step-subtitle">{STAGED_TOPICS_COPY.stepSubtitle}</p>
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
            {/* ── Campaign Header (gradient) ── */}
            <div className="sp-thread__campaign-header">
              <div className="sp-thread__campaign-title-group">
                <span className="sp-thread__campaign-number">{ci + 1}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sp-text-primary)' }}>
                  {c.name || `Chiến dịch #${ci + 1}`}
                </span>
              </div>
              <button
                type="button"
                className="sp-btn sp-btn--dashed sp-btn--sm"
                onClick={() => onAddTopic(ci)}
                disabled={loading}
              >
                <PlusIcon size={13} /> {STAGED_TOPICS_COPY.addBtn}
              </button>
            </div>

            {/* ── Topic tree list ── */}
            <div className="sp-thread__campaign-body">
              {c.objective && (
                <p className="sp-campaign-objective">{c.objective}</p>
              )}

              {Array.isArray(c.topics) && c.topics.length > 0 ? (
                <ul className="sp-thread__topic-list">
                  {c.topics.map((t, ti) => (
                    <li key={ti} className="sp-thread__topic sp-hover-reveal">
                      <div className="sp-thread__topic-header">
                        <div className="sp-thread__topic-title-group">
                          <span className="sp-thread__topic-index">#{ti + 1}</span>
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
                            style={{ fontSize: 14, fontWeight: 600 }}
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
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="sp-empty">
                  <div className="sp-empty__icon"><TargetIcon size={16} /></div>
                  <p className="sp-empty__text">{STAGED_TOPICS_COPY.emptyHint}</p>
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
          {STAGED_TOPICS_COPY.proceedBtn}
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
        <h2 className="sp-step-title">{STAGED_POSTS_COPY.stepTitle}</h2>
        <p className="sp-step-subtitle">{STAGED_POSTS_COPY.stepSubtitle}</p>
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
            {/* ── Campaign Header ── */}
            <div className="sp-thread__campaign-header">
              <div className="sp-thread__campaign-title-group">
                <span className="sp-thread__campaign-number">{ci + 1}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sp-text-primary)' }}>
                  {c.name || `Chiến dịch #${ci + 1}`}
                </span>
              </div>
            </div>

            {/* ── Topic + Post tree ── */}
            <div className="sp-thread__campaign-body">
              {Array.isArray(c.topics) &&
                c.topics.map((t, ti) => (
                  <div key={ti} className="sp-thread__topic" style={{ marginBottom: ti < c.topics.length - 1 ? 20 : 0 }}>
                    {/* Topic header */}
                    <div className="sp-thread__topic-header">
                      <div className="sp-thread__topic-title-group">
                        <span className="sp-thread__topic-index">#{ti + 1}</span>
                        <span className="sp-thread__topic-icon"><TargetIcon size={14} /></span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--sp-text-primary)' }}>
                          {t.name || `Chủ đề #${ti + 1}`}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="sp-btn sp-btn--dashed sp-btn--sm"
                        onClick={() => onAddPost(ci, ti)}
                        disabled={loading}
                      >
                        <PlusIcon size={12} /> {STAGED_POSTS_COPY.addBtn}
                      </button>
                    </div>

                    {/* Post list with tree connector */}
                    {Array.isArray(t.posts) && t.posts.length > 0 ? (
                      <ul className="sp-thread__post-list">
                        {t.posts.map((p, pi) => (
                          <li key={pi} className="sp-thread__post sp-hover-reveal">
                            <div className="sp-thread__post-header">
                              <div className="sp-thread__post-title-group">
                                <span className="sp-thread__post-icon"><FileTextIcon size={13} /></span>
                                <input
                                  type="text"
                                  className="sp-field__title-input"
                                  value={p.title || ''}
                                  onChange={(e) => onPostChange(ci, ti, pi, 'title', e.target.value)}
                                  placeholder="Tiêu đề bài viết"
                                  disabled={loading}
                                  style={{ fontSize: 14, fontWeight: 600 }}
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

                            <div style={{ marginTop: 14 }}>
                              <FieldRow
                                label="Content Brief"
                                value={p.contentBrief}
                                onChange={(v) => onPostChange(ci, ti, pi, 'contentBrief', v)}
                                type="textarea"
                                rows={2}
                                disabled={loading}
                              />
                            </div>

                            <div className="sp-grid-3" style={{ marginTop: 14 }}>
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
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="sp-empty" style={{ padding: '14px 0' }}>
                        <div className="sp-empty__icon"><FileTextIcon size={15} /></div>
                        <p className="sp-empty__text">{STAGED_POSTS_COPY.emptyHint}</p>
                      </div>
                    )}
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
          {STAGED_POSTS_COPY.proceedBtn}
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
          <SparkleIcon size={24} />
        </div>
        <h2 className="sp-review-title">{STAGED_REVIEW_COPY.stepTitle}</h2>
        <p className="sp-review-subtitle">{STAGED_REVIEW_COPY.stepSubtitle}</p>
      </div>

      <div className="sp-brand-info">
        <h3 className="sp-section-title">{STAGED_REVIEW_COPY.brandInfoTitle}</h3>
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
          marginBottom: 20,
        }}
      >
        <h3 className="sp-section-title" style={{ margin: 0 }}>
          {STAGED_REVIEW_COPY.planDetailTitle(campaigns.length)}
        </h3>
        <button
          type="button"
          className="sp-btn sp-btn--dashed sp-btn--sm"
          onClick={onAddCampaign}
          disabled={loading}
        >
          <PlusIcon size={13} /> {STAGED_CAMPAIGNS_COPY.addBtn}
        </button>
      </div>

      <div className="sp-thread">
        {campaigns.map((c, ci) => (
          <div key={ci} className="sp-thread__campaign">
            {/* ── Campaign Header ── */}
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
              <div className="sp-thread__campaign-actions">
                <button
                  type="button"
                  className="sp-btn sp-btn--dashed sp-btn--sm"
                  onClick={() => onAddTopic(ci)}
                  disabled={loading}
                >
                  <PlusIcon size={12} /> {STAGED_TOPICS_COPY.addBtn}
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

            {/* ── Campaign Body ── */}
            <div className="sp-thread__campaign-body">
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
                    <span style={{ color: 'var(--sp-text-muted)', flexShrink: 0 }}>—</span>
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
              <div style={{ marginTop: 12 }}>
                <FieldRow
                  label="Mô tả"
                  value={c.description}
                  onChange={(v) => onCampaignChange(ci, 'description', v)}
                  type="textarea"
                  rows={2}
                  disabled={loading}
                />
              </div>

              {/* ── Topic tree ── */}
              {Array.isArray(c.topics) && c.topics.length > 0 && (
                <ul className="sp-thread__topic-list" style={{ marginTop: 20 }}>
                  {c.topics.map((t, ti) => (
                    <li key={ti} className="sp-thread__topic">
                      {/* Topic header */}
                      <div className="sp-thread__topic-header">
                        <div className="sp-thread__topic-title-group">
                          <span className="sp-thread__topic-index">#{ti + 1}</span>
                          <span className="sp-thread__topic-icon"><TargetIcon size={14} /></span>
                          <input
                            type="text"
                            className="sp-field__title-input"
                            value={t.name || ''}
                            onChange={(e) => onTopicChange(ci, ti, 'name', e.target.value)}
                            placeholder="Tên chủ đề"
                            disabled={loading}
                            style={{ fontSize: 14, fontWeight: 600 }}
                          />
                        </div>
                        <div className="sp-thread__topic-actions">
                          <button
                            type="button"
                            className="sp-btn sp-btn--dashed sp-btn--sm"
                            onClick={() => onAddPost(ci, ti)}
                            disabled={loading}
                          >
                            <PlusIcon size={11} /> {STAGED_POSTS_COPY.addBtn}
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

                      <FieldRow
                        label="Mô tả nội dung"
                        value={t.description}
                        onChange={(v) => onTopicChange(ci, ti, 'description', v)}
                        type="textarea"
                        rows={2}
                        disabled={loading}
                      />

                      {/* ── Post tree ── */}
                      {Array.isArray(t.posts) && t.posts.length > 0 && (
                        <ul className="sp-thread__post-list">
                          {t.posts.map((p, pi) => (
                            <li key={pi} className="sp-thread__post sp-hover-reveal">
                              <div className="sp-thread__post-header">
                                <div className="sp-thread__post-title-group">
                                  <span className="sp-thread__post-icon"><FileTextIcon size={13} /></span>
                                  <input
                                    type="text"
                                    className="sp-field__title-input"
                                    value={p.title || ''}
                                    onChange={(e) => onPostChange(ci, ti, pi, 'title', e.target.value)}
                                    placeholder="Tiêu đề bài viết"
                                    disabled={loading}
                                    style={{ fontSize: 14, fontWeight: 600 }}
                                  />
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
                              <div style={{ marginTop: 12 }}>
                                <FieldRow
                                  label="Content Brief"
                                  value={p.contentBrief}
                                  onChange={(v) => onPostChange(ci, ti, pi, 'contentBrief', v)}
                                  type="textarea"
                                  rows={2}
                                  disabled={loading}
                                />
                              </div>
                              <div className="sp-grid-3" style={{ marginTop: 12 }}>
                                <FieldRow
                                  label="Nền tảng"
                                  value={p.platformSuggestion}
                                  onChange={(v) => onPostChange(ci, ti, pi, 'platformSuggestion', v)}
                                  disabled={loading}
                                />
                                <FieldRow
                                  label="Lịch đăng"
                                  value={p.scheduleSuggestion}
                                  onChange={(v) => onPostChange(ci, ti, pi, 'scheduleSuggestion', v)}
                                  disabled={loading}
                                />
                                <FieldRow
                                  label="Hashtag"
                                  value={p.hashtagsSuggestion}
                                  onChange={(v) => onPostChange(ci, ti, pi, 'hashtagsSuggestion', v)}
                                  disabled={loading}
                                />
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
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
          style={{ padding: '12px 32px', fontSize: 15 }}
        >
          {STAGED_REVIEW_COPY.finalizeBtn}
        </button>
      </div>
    </section>
  );
}

export default StagedPlannerPage;
