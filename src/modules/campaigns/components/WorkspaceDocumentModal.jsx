import React, { useState } from 'react';
import PlannerDocumentLibrary from '../../planner/components/PlannerDocumentLibrary';
import PlannerDropzone from '../../planner/components/PlannerDropzone';
import PlannerPendingFileList from '../../planner/components/PlannerPendingFileList';
import PlannerAlert from '../../planner/components/PlannerAlert';
import { useWorkspaceDocuments } from '../../planner/hooks/useWorkspaceDocuments';
import { documentApi } from '../api/documentApi';
import { API_BASE_URL } from '../../../config/env';
import { XIcon } from '../../planner/components/PlannerIcons';

function WorkspaceDocumentModal({ workspaceId, isOpen, onClose }) {
  const {
    documents,
    docsLoading,
    docsError,
    totalCount,
    searchQuery,
    setSearchQuery,
    selectedDocIds,
    handleDeleteDocument,
    handleToggleDoc,
    handleSelectAllSupported,
    handleClearSelection,
    loadDocuments,
    uploadMultipleDocuments,
  } = useWorkspaceDocuments(workspaceId);

  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  if (!isOpen) return null;

  const handleAddFiles = (files) => {
    setPendingFiles((prev) => [
      ...prev,
      ...files.map((file) => ({
        key: `${file.name}|${file.size}|${file.lastModified}|${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        ext: file.name.split('.').pop().toUpperCase(),
      })),
    ]);
  };

  const handleRemovePendingFile = (keyToRemove) => {
    setPendingFiles((prev) => prev.filter((item) => item.key !== keyToRemove));
  };

  const handleUploadPendingFiles = async () => {
    if (pendingFiles.length === 0) return;
    
    setUploading(true);
    setUploadError(null);
    try {
      const rawFiles = pendingFiles.map((pf) => pf.file || pf);
      await uploadMultipleDocuments(rawFiles);
      setPendingFiles([]);
      loadDocuments(); // Tải lại danh sách
    } catch (error) {
      setUploadError(error.message || 'Lỗi khi upload tài liệu');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: 18, color: '#1e293b' }}>Thư viện tài liệu Workspace</h2>
          <button style={closeBtnStyle} onClick={onClose}><XIcon size={20} /></button>
        </div>

        <div style={bodyStyle}>
          {/* Upload Area */}
          <div style={{ marginBottom: 24 }}>
            <PlannerDropzone onFiles={handleAddFiles} uploading={uploading} disabled={uploading} />
            {uploadError && (
              <PlannerAlert tone="error" message={uploadError} onDismiss={() => setUploadError(null)} />
            )}
            <PlannerPendingFileList files={pendingFiles} onRemove={handleRemovePendingFile} />
            
            {pendingFiles.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button 
                  className="wp-btn wp-btn--primary" 
                  onClick={handleUploadPendingFiles} 
                  disabled={uploading}
                >
                  {uploading ? 'Đang tải lên...' : `Tải lên ${pendingFiles.length} tài liệu`}
                </button>
              </div>
            )}
          </div>

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
            // onPreview & onDownload can be added later if needed, PlannerDocumentLibrary supports them
            // onPreview={...} 
            // onDownload={...}
          />
        </div>
      </div>
    </div>
  );
}

// Inline styles for quick modal setup
const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.4)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  padding: '24px'
};

const modalStyle = {
  background: '#fff',
  borderRadius: '12px',
  width: '100%',
  maxWidth: '900px',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

const headerStyle = {
  padding: '20px 24px',
  borderBottom: '1px solid #e2e8f0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const bodyStyle = {
  padding: '24px',
  overflowY: 'auto',
  flex: 1,
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#64748b',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
};

export default WorkspaceDocumentModal;
