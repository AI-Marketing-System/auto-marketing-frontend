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
import { buildAnalyzeFormData, parseWorkspacePlanResponse, plannerApi } from '../api/plannerApi';
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
import { clearDraft, loadDraft, saveDraft } from '../utils/plannerDraft';
import {
  collectAllNodeIds,
  defaultExpanded,
  normalizePlan,
} from '../utils/plannerPlanModel';
import '../styles/WorkspacePlannerPage.css';
import '../styles/PlannerDocuments.css';

const DRAFT_DEBOUNCE_MS = 800;

let pendingFileCounter = 0;

/**
 * Trang AI Workspace Planner. Giữ TOÀN BỘ state; các component con đều không có state server.
 *
 * Trang này cũng thay thế popup Knowledge Assets: việc xem / thêm / xoá tài liệu nguồn giờ nằm ngay
 * ở đây, cạnh bước chọn tài liệu cho AI.
 */
function WorkspacePlannerPage() {
  const { workspaceId } = useParams();
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

  // ----- kết quả / nháp -----
  const [plan, setPlan] = useState(null);
  const [analyzedAt, setAnalyzedAt] = useState(null);
  const [draftSavedAt, setDraftSavedAt] = useState(null);
  const [draftSaveState, setDraftSaveState] = useState('idle');
  const [restoredAt, setRestoredAt] = useState(null);
  const [expanded, setExpanded] = useState({});
  const sourceRef = useRef({ documentIds: [], fileNames: [] });

  const loadDocuments = useCallback(async () => {
    if (!workspaceId) return;

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

  // Phục hồi nháp: người dùng F5 không mất kết quả (backend không lưu gì).
  useEffect(() => {
    if (!workspaceId) return;
    const draft = loadDraft(workspaceId);
    if (!draft) return;

    setPlan(draft.plan);
    setAnalyzedAt(draft.analyzedAt);
    setDraftSavedAt(draft.savedAt);
    setRestoredAt(draft.savedAt);
    sourceRef.current = draft.source || { documentIds: [], fileNames: [] };
    setExpanded(defaultExpanded(draft.plan));
    setPhase('result');
    setIntroCollapsed(true);
  }, [workspaceId]);

  // Tự lưu nháp, có debounce.
  useEffect(() => {
    if (!plan || !workspaceId) return undefined;

    setDraftSaveState('pending');
    const timer = setTimeout(() => {
      const savedAt = saveDraft(workspaceId, {
        plan,
        analyzedAt,
        source: sourceRef.current,
      });
      if (savedAt) {
        setDraftSavedAt(savedAt);
        setDraftSaveState('saved');
      } else {
        setDraftSaveState('failed');
      }
    }, DRAFT_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [plan, workspaceId, analyzedAt]);

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
      const response = await plannerApi.analyze(API_BASE_URL, workspaceId, formData, controller.signal);

      if (runId !== runIdRef.current) return; // một lần chạy mới hơn đã bắt đầu

      const normalized = normalizePlan(parseWorkspacePlanResponse(response));
      const now = new Date().toISOString();

      sourceRef.current = {
        documentIds: selectedDocIds,
        fileNames: pendingFiles.map((item) => item.name),
      };
      setPlan(normalized);
      setAnalyzedAt(now);
      setRestoredAt(null);
      setExpanded(defaultExpanded(normalized));
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

  const handleDiscardDraft = () => {
    if (!window.confirm(PLANNER_DRAFT_COPY.discardConfirm)) return;
    clearDraft(workspaceId);
    setPlan(null);
    setDraftSavedAt(null);
    setDraftSaveState('idle');
    setRestoredAt(null);
    setPhase('idle');
  };

  // ----- cây kết quả -----

  const handlePlanChange = (mutator, ...args) => {
    setPlan((current) => (current ? mutator(current, ...args) : current));
  };

  const handleToggleExpand = (nodeId) => {
    setExpanded((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleExpandAll = () => {
    const next = {};
    collectAllNodeIds(plan).forEach((id) => {
      next[id] = true;
    });
    setExpanded(next);
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

      {restoredAt && phase === 'result' && (
        <PlannerAlert
          tone="info"
          message={PLANNER_DRAFT_COPY.restored(formatTime(restoredAt))}
          onRetry={handleReanalyze}
          retryLabel={PLANNER_SECTION_LABELS.reanalyze}
          onDismiss={() => setRestoredAt(null)}
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

      {phase === 'result' && plan ? (
        <PlannerResultView
          plan={plan}
          workspaceId={workspaceId}
          expanded={expanded}
          onToggleExpand={handleToggleExpand}
          onExpandAll={handleExpandAll}
          onCollapseAll={() => setExpanded({})}
          onChange={handlePlanChange}
          draftSavedAt={draftSavedAt}
          draftSaveState={draftSaveState}
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

export default WorkspacePlannerPage;
