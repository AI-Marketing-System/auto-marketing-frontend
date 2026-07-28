import React from 'react';
import PlannerAlert from './PlannerAlert';
import PlannerDocumentLibrary from './PlannerDocumentLibrary';
import PlannerDropzone from './PlannerDropzone';
import PlannerPendingFileList from './PlannerPendingFileList';
import PlannerSelectionSummary from './PlannerSelectionSummary';
import { PLANNER_SECTION_LABELS, PLANNER_SELECTION_COPY } from '../utils/plannerCopy';

/** Bước 1: chọn nguồn tài liệu (thư viện đã có + file kéo thả mới). */
function PlannerSourcePanel({
  documents,
  docsLoading,
  docsError,
  totalCount,
  searchQuery,
  onSearchChange,
  selectedDocIds,
  onToggleDoc,
  onSelectAllSupported,
  onClearSelection,
  onReloadDocuments,
  onDeleteDocument,
  onPreviewDocument,
  onDownloadDocument,
  pendingFiles,
  onAddFiles,
  onRemovePendingFile,
  alsoSaveToLibrary,
  onToggleAlsoSaveToLibrary,
  uploading,
  uploadError,
  onDismissUploadError,
  validation,
  onAnalyze,
  analyzeDisabled,
}) {
  return (
    <section className="wp-card wp-source">
      <header className="wp-card__header">
        <h2 className="wp-card__title">{PLANNER_SECTION_LABELS.sources}</h2>
      </header>

      <PlannerDropzone onFiles={onAddFiles} uploading={uploading} disabled={uploading} />

      {uploadError && (
        <PlannerAlert tone="error" message={uploadError} onDismiss={onDismissUploadError} />
      )}

      <PlannerPendingFileList files={pendingFiles} onRemove={onRemovePendingFile} />

      {pendingFiles.length > 0 && (
        <label className="wp-checkbox">
          <input
            type="checkbox"
            checked={alsoSaveToLibrary}
            onChange={(event) => onToggleAlsoSaveToLibrary(event.target.checked)}
          />
          <span>
            {PLANNER_SELECTION_COPY.alsoSaveToLibrary}
            <span className="wp-checkbox__hint">{PLANNER_SELECTION_COPY.alsoSaveHint}</span>
          </span>
        </label>
      )}

      <PlannerDocumentLibrary
        documents={documents}
        loading={docsLoading}
        error={docsError}
        totalCount={totalCount}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        selectedDocIds={selectedDocIds}
        onToggleDoc={onToggleDoc}
        onSelectAllSupported={onSelectAllSupported}
        onClearSelection={onClearSelection}
        onReload={onReloadDocuments}
        onDelete={onDeleteDocument}
        onPreview={onPreviewDocument}
        onDownload={onDownloadDocument}
      />

      <PlannerSelectionSummary
        validation={validation}
        onAnalyze={onAnalyze}
        disabled={analyzeDisabled}
      />
    </section>
  );
}

export default PlannerSourcePanel;
