import { useState, useCallback, useEffect } from 'react';
import { documentApi, parseDocumentsResponse } from '../../campaigns/api/documentApi';
import { API_BASE_URL } from '../../../config/env';
import { isDocumentSelectable, DOCUMENT_LIBRARY_EXTENSIONS, DOCUMENT_LIBRARY_MAX_FILE_SIZE_MB, getFileExtension } from '../utils/plannerConstants';
import { detectDocumentType } from '../utils/documentFormat';

export function useWorkspaceDocuments(workspaceId) {
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // For file selection
  const [selectedDocIds, setSelectedDocIds] = useState([]);

  const loadDocuments = useCallback(async () => {
    if (!workspaceId) return;

    setDocuments([]);
    setTotalCount(0);
    setDocsLoading(true);
    setDocsError(null);
    try {
      const response = await documentApi.list(API_BASE_URL, workspaceId, { page: 0, size: 100 });
      const parsed = parseDocumentsResponse(response);
      setDocuments(parsed.documents);
      setTotalCount(parsed.totalElements);
      
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

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
    try {
      await documentApi.delete(API_BASE_URL, workspaceId, id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      setSelectedDocIds((prev) => prev.filter((docId) => docId !== id));
    } catch (err) {
      window.alert(err.message || 'Không thể xoá tài liệu');
    }
  };

  const uploadMultipleDocuments = async (files) => {
    if (!files || files.length === 0 || !workspaceId) return [];

    for (const file of files) {
      const ext = getFileExtension(file.name);
      if (!DOCUMENT_LIBRARY_EXTENSIONS.includes(ext)) {
        throw new Error(`File "${file.name}" không đúng định dạng thư viện hỗ trợ.`);
      }
      if (file.size > DOCUMENT_LIBRARY_MAX_FILE_SIZE_MB * 1024 * 1024) {
        throw new Error(`File "${file.name}" vượt quá dung lượng tối đa (${DOCUMENT_LIBRARY_MAX_FILE_SIZE_MB}MB).`);
      }
    }

    const responses = await Promise.all(
      files.map((file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folderPath', '/documents');
        formData.append('documentType', detectDocumentType(file.name));
        return documentApi.upload(API_BASE_URL, workspaceId, formData);
      })
    );
    return responses;
  };

  const handleToggleDoc = (id, checked) => {
    setSelectedDocIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const handleSelectAllSupported = () => {
    const supportedIds = documents.filter(isDocumentSelectable).map((d) => d.id);
    setSelectedDocIds(supportedIds);
  };

  const handleClearSelection = () => setSelectedDocIds([]);

  return {
    documents,
    docsLoading,
    docsError,
    totalCount,
    searchQuery,
    selectedDocIds,
    setSearchQuery: handleSearchChange,
    setSelectedDocIds,
    loadDocuments,
    handleDeleteDocument,
    uploadMultipleDocuments,
    handleToggleDoc,
    handleSelectAllSupported,
    handleClearSelection,
  };
}
