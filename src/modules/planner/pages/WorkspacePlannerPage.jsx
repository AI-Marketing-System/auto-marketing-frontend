import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DocumentPreviewModal from '../components/DocumentPreviewModal';
import PlannerAlert from '../components/PlannerAlert';
import PlannerErrorPanel from '../components/PlannerErrorPanel';
import PlannerIntroPanel from '../components/PlannerIntroPanel';
import PlannerProgressPanel from '../components/PlannerProgressPanel';
import PlannerResultView from '../components/PlannerResultView';
import PlannerSourcePanel from '../components/PlannerSourcePanel';
import { ArrowLeftIcon, SparkleIcon } from '../components/PlannerIcons';
import {
  buildAnalyzeFormData,
  parsePlanDraftResponse,
  parseWorkspacePlanResponse,
  planDraftApi,
  plannerApi,
} from '../api/plannerApi';
import { documentApi, parseDocumentsResponse } from '../../campaigns/api/documentApi';
import { API_BASE_URL } from '../../../config/env';
import { detectDocumentType, downloadDocument, formatTime } from '../utils/documentFormat';
import {
  DOCUMENT_LIBRARY_EXTENSIONS,
  DOCUMENT_LIBRARY_MAX_FILE_SIZE_MB,
  getFileExtension,
  isDocumentSelectable,
  validatePlannerSelection,
} from '../utils/plannerConstants';
import {
  PLANNER_DRAFT_COPY,
  PLANNER_PROGRESS_COPY,
  PLANNER_SECTION_LABELS,
  PLANNER_UPLOAD_ERROR_COPY,
  resolvePlannerError,
} from '../utils/plannerCopy';
import { purgeLegacyLocalDrafts } from '../utils/plannerDraft';
import { collectAllNodeIds, defaultExpanded, normalizePlan } from '../utils/plannerPlanModel';
import '../styles/WorkspacePlannerPage.css';
import '../styles/PlannerDocuments.css';

const DRAFT_DEBOUNCE_MS = 1500;

let pendingFileCounter = 0;

/**
 * Toàn bộ trạng thái liên quan tới bản nháp, gộp vào MỘT object.
 *
 * `workspaceId` ở đây là chủ sở hữu của `plan`, và luôn là string vì `useParams()` trả string —
 * lưu số vào đây sẽ làm mọi phép so sánh `'10' === 10` thành false và chặn im lặng việc lưu.
 *
 * Gộp lại như vậy để "xoá nháp" là một lần set duy nhất, không thể thực hiện nửa vời, và để không
 * còn `sourceRef` nằm ngoài state mà không ai reset.
 */
const EMPTY_PLAN_STATE = {
  workspaceId: null,
  plan: null,
  analyzedAt: null,
  source: { documentIds: [], fileNames: [] },
  savedAt: null,
  saveState: 'idle', // 'idle' | 'pending' | 'saved' | 'failed'
  restoredAt: null,
  expanded: {},
};

/**
 * Trang AI Workspace Planner của một workspace. Giữ TOÀN BỘ state; component con không có state
 * server nào.
 *
 * Trang này cũng thay thế popup Knowledge Assets: việc xem / thêm / xoá tài liệu nguồn giờ nằm ngay
 * ở đây, cạnh bước chọn tài liệu cho AI.
 *
 * Nhận `workspaceId` qua prop (không tự gọi useParams) để giá trị component dùng và `key` ở vỏ ngoài
 * chắc chắn cùng một nguồn, không thể lệch nhau.
 */
function PlannerWorkspaceView({ workspaceId }) {
  const navigate = useNavigate();

  // ----- máy trạng thái -----
  const [phase, setPhase] = useState('idle'); // 'idle' | 'analyzing' | 'result' | 'error'
  const [introCollapsed, setIntroCollapsed] = useState(false);

  // ----- thư viện tài liệu -----
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  // ----- lựa chọn -----
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [alsoSaveToLibrary, setAlsoSaveToLibrary] = useState(true);

  // ----- phân tích -----
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [cancelNotice, setCancelNotice] = useState(false);
  const abortRef = useRef(null);
  const runIdRef = useRef(0);

  // ----- nháp -----
  const [planState, setPlanState] = useState(EMPTY_PLAN_STATE);
  const [draftLoading, setDraftLoading] = useState(true);
  const [draftLoadError, setDraftLoadError] = useState(null);
  /** Bản plan đã nằm trên máy chủ, để không PUT lại đúng cái vừa tải về hoặc vừa lưu xong. */
  const savedPlanRef = useRef(null);

  /**
   * Kế hoạch của workspace khác là KHÔNG RENDER ĐƯỢC, chứ không phải "sẽ được reset ở effect sau".
   * Đây là điều duy nhất chặn được frame đầu tiên hiển thị nháp của workspace trước, vì useEffect
   * chạy SAU khi trình duyệt đã paint.
   */
  const isOwnPlan = planState.workspaceId === workspaceId;
  const plan = isOwnPlan ? planState.plan : null;
  const expanded = isOwnPlan ? planState.expanded : {};

  const loadDocuments = useCallback(async () => {
    if (!workspaceId) return;

    // Xoá danh sách cũ trước khi gọi, để tên tài liệu của workspace trước không hiện dưới workspace
    // hiện tại trong lúc chờ response.
    setDocuments([]);
    setTotalCount(0);
    setDocsLoading(true);
    setDocsError(null);
    try {
      // Luôn xin page 0: `parseDocumentsResponse` map `number` từ `page` của backend vốn là 1-based,
      // nên không đọc giá trị đó.
      const response = await documentApi.list(API_BASE_URL, workspaceId, { page: 0, size: 100 });
      const parsed = parseDocumentsResponse(response);
      setDocuments(parsed.documents);
      setTotalCount(parsed.totalElements);
      // Bỏ khỏi lựa chọn những tài liệu đã bị xoá ở nơi khác.
      const availableIds = new Set(parsed.documents.map((doc) => doc.id));
      setSelectedDocIds((prev) => prev.filter((id) => availableIds.has(id)));
    } catch (err) {
      setDocsError(err.message || 'Không thể tải tài liệu');
    } finally {
      setDocsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Nạp bản nháp từ máy chủ. `draftLoading` khởi tạo là true nên frame đầu tiên là khối đang tải,
  // không bao giờ là panel chọn tài liệu rồi mới nhảy sang màn kết quả.
  useEffect(() => {
    if (!workspaceId) {
      setDraftLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    let alive = true;

    planDraftApi
      .get(API_BASE_URL, workspaceId, controller.signal)
      .then((response) => {
        if (!alive) return;

        const draft = parsePlanDraftResponse(response);
        if (!draft || !draft.plan) return; // chưa có nháp -> ở lại bước chọn tài liệu

        // Kiểm tra chéo: nếu máy chủ (hoặc một proxy) trả nháp của workspace khác thì BỎ, không
        // render. Rẻ, và đánh trực diện vào yêu cầu "nháp workspace này không lọt sang workspace kia".
        if (draft.workspaceId != null && String(draft.workspaceId) !== String(workspaceId)) return;

        setPlanState({
          workspaceId, // gắn chủ sở hữu ngay tại điểm dữ liệu vào state
          plan: draft.plan,
          analyzedAt: draft.analyzedAt || null,
          source: draft.source || { documentIds: [], fileNames: [] },
          savedAt: draft.updatedAt || null,
          saveState: 'saved',
          restoredAt: draft.updatedAt || null,
          expanded: defaultExpanded(draft.plan),
        });
        // Nháp vừa tải về ĐÃ nằm trên máy chủ nên không PUT lại ngay. So sánh bằng tham chiếu là
        // chính xác vì mọi mutator trong plannerPlanModel đều thuần và bất biến.
        savedPlanRef.current = draft.plan;
        setPhase('result');
        setIntroCollapsed(true);
      })
      .catch((err) => {
        if (!alive || err?.name === 'AbortError') return;
        setDraftLoadError(err.message || PLANNER_DRAFT_COPY.loadFailed);
      })
      .finally(() => {
        if (alive) setDraftLoading(false);
      });

    return () => {
      alive = false;
      controller.abort();
    };
  }, [workspaceId]);

  // Tự lưu nháp lên máy chủ, có debounce.
  useEffect(() => {
    const owner = planState.workspaceId;
    const current = planState.plan;

    if (!owner || !current) return undefined;
    // Kế hoạch này thuộc workspace khác (route vừa đổi): KHÔNG lưu. Đây chính là chỗ bug cũ ghi nháp
    // của workspace trước vào workspace hiện tại.
    if (owner !== workspaceId) return undefined;
    // Không PUT lại đúng cái vừa tải về hoặc vừa lưu xong.
    if (current === savedPlanRef.current) return undefined;

    setPlanState((prev) => (prev.saveState === 'pending' ? prev : { ...prev, saveState: 'pending' }));

    const controller = new AbortController();
    const timer = setTimeout(() => {
      planDraftApi
        .save(
          API_BASE_URL,
          // owner, KHÔNG phải tham số route: id trong URL luôn đến từ cùng object với plan, nên kể
          // cả khi câu guard ở trên bị xoá thì cũng chỉ ghi nháp về đúng workspace của nó.
          owner,
          { plan: current, source: planState.source, analyzedAt: planState.analyzedAt },
          controller.signal
        )
        .then((response) => {
          const saved = parsePlanDraftResponse(response);
          savedPlanRef.current = current;
          setPlanState((prev) =>
            prev.plan === current && prev.workspaceId === owner
              ? {
                  ...prev,
                  savedAt: saved?.updatedAt || new Date().toISOString(),
                  saveState: 'saved',
                }
              : prev
          );
        })
        .catch((err) => {
          if (err?.name === 'AbortError') return; // route đổi giữa lúc lưu: im lặng
          // KHÔNG xoá `plan`: chỉnh sửa của người dùng phải còn trên màn hình khi lưu thất bại.
          setPlanState((prev) =>
            prev.plan === current && prev.workspaceId === owner
              ? { ...prev, saveState: 'failed' }
              : prev
          );
        });
    }, DRAFT_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // Dependency chỉ gồm những field định danh "cần lưu cái gì". Đưa cả `planState` vào đây sẽ lặp
    // vô hạn: effect gọi setPlanState -> planState là object mới -> effect chạy lại.
  }, [planState.plan, planState.source, planState.analyzedAt, planState.workspaceId, workspaceId]);

  // Đồng hồ đếm thời gian chờ.
  useEffect(() => {
    if (phase !== 'analyzing') return undefined;
    const timer = setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // Cảnh báo khi đóng tab giữa lúc đang phân tích (đã tốn một lượt gọi AI).
  useEffect(() => {
    if (phase !== 'analyzing') return undefined;
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [phase]);

  // Huỷ request đang chạy khi rời trang.
  useEffect(() => () => abortRef.current?.abort(), []);

  const validation = useMemo(
    () => validatePlannerSelection({ pendingFiles, selectedDocIds, documents }),
    [pendingFiles, selectedDocIds, documents]
  );

  // ----- lựa chọn tài liệu -----

  const handleToggleDoc = (docId) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleSelectAllSupported = () => {
    setSelectedDocIds(documents.filter(isDocumentSelectable).map((doc) => doc.id));
  };

  const handleAddFiles = (files) => {
    setPendingFiles((prev) => [
      ...prev,
      ...files.map((file) => {
        pendingFileCounter += 1;
        return {
          // File không có identity ổn định và hai file có thể trùng tên hợp lệ.
          key: `${file.name}|${file.size}|${file.lastModified}|${pendingFileCounter}`,
          file,
          name: file.name,
          size: file.size,
          ext: getFileExtension(file.name),
        };
      }),
    ]);
  };

  const handleRemovePendingFile = (key) => {
    setPendingFiles((prev) => prev.filter((item) => item.key !== key));
  };

  // ----- thư viện: upload / xoá -----

  const uploadToLibrary = useCallback(
    async (files) => {
      if (!files || files.length === 0 || !workspaceId) return;

      setUploadError(null);

      for (const file of files) {
        const ext = getFileExtension(file.name);
        if (!DOCUMENT_LIBRARY_EXTENSIONS.includes(ext)) {
          setUploadError(`File "${file.name}" không đúng định dạng thư viện hỗ trợ.`);
          return;
        }
        if (file.size > DOCUMENT_LIBRARY_MAX_FILE_SIZE_MB * 1024 * 1024) {
          setUploadError(
            `File "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB) vượt quá dung lượng ` +
              `tối đa cho phép (${DOCUMENT_LIBRARY_MAX_FILE_SIZE_MB}MB).`
          );
          return;
        }
      }

      setUploading(true);
      try {
        await Promise.all(
          files.map((file) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folderPath', '/documents');
            formData.append('documentType', detectDocumentType(file.name));
            return documentApi.upload(API_BASE_URL, workspaceId, formData);
          })
        );
        await loadDocuments();
      } catch (err) {
        const rawMsg = err.message || '';
        if (rawMsg.includes('Invalid Signature')) {
          setUploadError(PLANNER_UPLOAD_ERROR_COPY.cloudinarySignature);
        } else if (err.status === 413 || rawMsg.includes('vượt quá')) {
          setUploadError(PLANNER_UPLOAD_ERROR_COPY.tooLarge);
        } else if (err.status === 400 || rawMsg.includes('not supported')) {
          setUploadError(PLANNER_UPLOAD_ERROR_COPY.unsupported);
        } else {
          setUploadError(rawMsg || PLANNER_UPLOAD_ERROR_COPY.fallback);
        }
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [workspaceId, loadDocuments]
  );

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
    try {
      await documentApi.delete(API_BASE_URL, workspaceId, documentId);
      await loadDocuments();
    } catch (err) {
      setDocsError(err.message || 'Không thể xóa tài liệu');
    }
  };

  // ----- phân tích -----

  const runAnalyze = async () => {
    if (!validation.canSubmit) return;

    const owner = workspaceId; // chốt trước khi await
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    const controller = new AbortController();
    abortRef.current = controller;

    setPhase('analyzing');
    setAnalyzeError(null);
    setCancelNotice(false);
    setElapsedSeconds(0);

    const files = pendingFiles.map((item) => item.file);

    try {
      if (alsoSaveToLibrary && files.length > 0) {
        try {
          await uploadToLibrary(files);
        } catch (uploadErr) {
          // uploadToLibrary đã đặt uploadError với thông báo cụ thể. Quay về bước chọn để người dùng
          // chỉ thấy MỘT thông báo, thay vì cả panel lỗi phân tích chồng lên lỗi upload.
          setPhase('idle');
          return;
        }
      }

      // Luôn dựng lại FormData mỗi lần gọi; không giữ nó trong state.
      const formData = buildAnalyzeFormData({ files, documentIds: selectedDocIds });
      const response = await plannerApi.analyze(API_BASE_URL, owner, formData, controller.signal);

      if (runId !== runIdRef.current) return; // một lần chạy mới hơn đã bắt đầu

      const normalized = normalizePlan(parseWorkspacePlanResponse(response));

      savedPlanRef.current = null; // kế hoạch mới -> phải lưu
      setPlanState({
        workspaceId: owner,
        plan: normalized,
        analyzedAt: new Date().toISOString(),
        source: {
          documentIds: selectedDocIds,
          fileNames: pendingFiles.map((item) => item.name),
        },
        savedAt: null,
        saveState: 'idle',
        restoredAt: null,
        expanded: defaultExpanded(normalized),
      });
      setPhase('result');
      setIntroCollapsed(true);
    } catch (err) {
      if (runId !== runIdRef.current) return;

      const resolved = resolvePlannerError(err);
      if (resolved.kind === 'aborted') {
        setPhase('idle');
        setAnalyzeError(null);
        setCancelNotice(true);
        return;
      }
      setAnalyzeError(resolved);
      setPhase('error');
    } finally {
      if (runId === runIdRef.current) abortRef.current = null;
    }
  };

  const handleCancel = () => abortRef.current?.abort();

  const handleReanalyze = () => {
    if (plan && !window.confirm(PLANNER_DRAFT_COPY.reanalyzeConfirm)) return;
    setPhase('idle');
    setAnalyzeError(null);
  };

  /**
   * Phải chờ máy chủ và chỉ xoá state khi thành công: bản localStorage cũ không thể lỗi, còn HTTP
   * DELETE thì có. Xoá lạc quan sẽ hiện "đã xoá" trong khi tải lại trang là nháp quay về.
   */
  const handleDiscardDraft = async () => {
    if (!window.confirm(PLANNER_DRAFT_COPY.discardConfirm)) return;

    const owner = planState.workspaceId;
    if (owner) {
      try {
        await planDraftApi.remove(API_BASE_URL, owner);
      } catch (err) {
        setDraftLoadError(err.message || PLANNER_DRAFT_COPY.discardFailed);
        return; // giữ nguyên bản nháp trên màn hình
      }
    }
    savedPlanRef.current = null;
    setPlanState(EMPTY_PLAN_STATE);
    setPhase('idle');
  };

  // ----- cây kết quả -----

  const handlePlanChange = (mutator, ...args) => {
    setPlanState((prev) =>
      prev.plan && prev.workspaceId === workspaceId
        ? { ...prev, plan: mutator(prev.plan, ...args) }
        : prev
    );
  };

  const handleToggleExpand = (nodeId) => {
    setPlanState((prev) =>
      prev.workspaceId === workspaceId
        ? { ...prev, expanded: { ...prev.expanded, [nodeId]: !prev.expanded[nodeId] } }
        : prev
    );
  };

  const handleExpandAll = () => {
    setPlanState((prev) => {
      if (prev.workspaceId !== workspaceId || !prev.plan) return prev;
      const next = {};
      collectAllNodeIds(prev.plan).forEach((id) => {
        next[id] = true;
      });
      return { ...prev, expanded: next };
    });
  };

  const handleCollapseAll = () => {
    setPlanState((prev) =>
      prev.workspaceId === workspaceId ? { ...prev, expanded: {} } : prev
    );
  };

  const errorHandlers = {
    retry: runAnalyze,
    'back-to-selection': () => {
      setPhase('idle');
      setAnalyzeError(null);
    },
    'reload-documents': () => {
      setPhase('idle');
      setAnalyzeError(null);
      loadDocuments();
    },
    'back-to-campaigns': () => navigate(`/workspaces/${workspaceId}/campaigns`),
    login: () => navigate('/login'),
    'contact-admin': () =>
      window.alert(
        'Vui lòng liên hệ quản trị viên hệ thống và cung cấp thời điểm bạn gặp lỗi để được hỗ trợ.'
      ),
  };

  if (!workspaceId) {
    return (
      <div className="wp-page">
        <PlannerAlert
          tone="error"
          title="Thiếu workspace"
          message="Đường dẫn không có mã workspace. Hãy mở AI Planner từ trang chiến dịch."
        />
      </div>
    );
  }

  return (
    <div className="wp-page">
      <header className="wp-page__header">
        <div className="wp-page__title-group">
          <span className="wp-page__icon">
            <SparkleIcon size={22} />
          </span>
          <div>
            <h1 className="wp-page__title">{PLANNER_SECTION_LABELS.pageTitle}</h1>
            <p className="wp-page__subtitle">Nguồn nội dung &amp; kế hoạch marketing do AI đề xuất</p>
          </div>
        </div>
        <Link className="wp-btn wp-btn--ghost" to={`/workspaces/${workspaceId}/campaigns`}>
          <ArrowLeftIcon size={14} />
          {PLANNER_SECTION_LABELS.backToCampaigns}
        </Link>
      </header>

      <PlannerIntroPanel
        collapsed={introCollapsed}
        onToggle={() => setIntroCollapsed((value) => !value)}
      />

      {draftLoadError && (
        <PlannerAlert
          tone="warning"
          message={draftLoadError}
          onDismiss={() => setDraftLoadError(null)}
        />
      )}

      {planState.restoredAt && isOwnPlan && phase === 'result' && (
        <PlannerAlert
          tone="info"
          message={PLANNER_DRAFT_COPY.restored(formatTime(planState.restoredAt))}
          onRetry={handleReanalyze}
          retryLabel={PLANNER_SECTION_LABELS.reanalyze}
          onDismiss={() => setPlanState((prev) => ({ ...prev, restoredAt: null }))}
        />
      )}

      {cancelNotice && (
        <PlannerAlert
          tone="info"
          message={PLANNER_PROGRESS_COPY.cancelled}
          onDismiss={() => setCancelNotice(false)}
        />
      )}

      {phase === 'analyzing' && (
        <PlannerProgressPanel elapsedSeconds={elapsedSeconds} onCancel={handleCancel} />
      )}

      {phase === 'error' && <PlannerErrorPanel error={analyzeError} handlers={errorHandlers} />}

      {draftLoading ? (
        <section className="wp-card">
          <div className="wp-loading">
            <div className="wp-spinner" />
            <p>{PLANNER_DRAFT_COPY.loading}</p>
          </div>
        </section>
      ) : phase === 'result' && plan ? (
        <PlannerResultView
          plan={plan}
          workspaceId={workspaceId}
          expanded={expanded}
          onToggleExpand={handleToggleExpand}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          onChange={handlePlanChange}
          draftSavedAt={planState.savedAt}
          draftSaveState={planState.saveState}
          onReanalyze={handleReanalyze}
          onDiscardDraft={handleDiscardDraft}
        />
      ) : (
        phase !== 'analyzing' && (
          <PlannerSourcePanel
            documents={documents}
            docsLoading={docsLoading}
            docsError={docsError}
            totalCount={totalCount}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedDocIds={selectedDocIds}
            onToggleDoc={handleToggleDoc}
            onSelectAllSupported={handleSelectAllSupported}
            onClearSelection={() => setSelectedDocIds([])}
            onReloadDocuments={loadDocuments}
            onDeleteDocument={handleDeleteDocument}
            onPreviewDocument={setPreviewDoc}
            onDownloadDocument={downloadDocument}
            pendingFiles={pendingFiles}
            onAddFiles={handleAddFiles}
            onRemovePendingFile={handleRemovePendingFile}
            alsoSaveToLibrary={alsoSaveToLibrary}
            onToggleAlsoSaveToLibrary={setAlsoSaveToLibrary}
            uploading={uploading}
            uploadError={uploadError}
            onDismissUploadError={() => setUploadError(null)}
            validation={validation}
            onAnalyze={runAnalyze}
            analyzeDisabled={uploading}
          />
        )
      )}

      <DocumentPreviewModal
        doc={previewDoc}
        onClose={() => setPreviewDoc(null)}
        onDownload={downloadDocument}
      />
    </div>
  );
}

/**
 * Vỏ ngoài của route.
 *
 * React Router dùng LẠI cùng một component instance khi chỉ `:workspaceId` đổi (vẫn là một route
 * pattern), nên toàn bộ state và ref của workspace cũ sống sót qua điều hướng
 * /workspaces/10/planner -> /workspaces/1/planner. Đó chính là lý do bản nháp của workspace này từng
 * hiện ở workspace khác.
 *
 * `key` buộc React unmount rồi mount lại: mọi state, ref, timer và AbortController đều mới, và mọi
 * cleanup của workspace cũ được chạy — không có danh sách reset nào phải bảo trì bằng tay.
 */
function WorkspacePlannerPage() {
  const { workspaceId } = useParams();

  // Dọn nháp localStorage của phiên bản cũ. Đặt ở vỏ ngoài (không phải component có key) để chỉ chạy
  // một lần cho mỗi lần vào route, không chạy lại mỗi lần đổi workspace.
  useEffect(() => {
    purgeLegacyLocalDrafts();
  }, []);

  return <PlannerWorkspaceView key={workspaceId ?? 'none'} workspaceId={workspaceId} />;
}

export default WorkspacePlannerPage;
