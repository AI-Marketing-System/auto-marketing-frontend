import React, { useMemo } from 'react';
import PlannerAlert from './PlannerAlert';
import { DownloadIcon, EyeIcon, RefreshIcon, SearchIcon, TrashIcon } from './PlannerIcons';
import { formatDate, formatFileSize } from '../utils/documentFormat';
import {
  DEFAULT_FILE_TYPE_ICON,
  FILE_TYPE_ICONS,
  getFileExtension,
  getUnselectableReason,
  isDocumentSelectable,
} from '../utils/plannerConstants';
import { PLANNER_EMPTY_STATES, PLANNER_SECTION_LABELS, PLANNER_SELECTION_COPY } from '../utils/plannerCopy';

/**
 * Thư viện tài liệu của workspace, kèm cột tick chọn để phân tích.
 * Chuyển từ KnowledgeAssetsModal: giữ đúng 6 cột gốc và thêm một cột checkbox dẫn đầu.
 */
function PlannerDocumentLibrary({
  documents,
  loading,
  error,
  totalCount,
  searchQuery,
  onSearchChange,
  selectedDocIds,
  onToggleDoc,
  onSelectAllSupported,
  onClearSelection,
  onReload,
  onDelete,
  onPreview,
  onDownload,
}) {
  const filteredDocuments = useMemo(() => {
    if (!searchQuery) return documents;
    const needle = searchQuery.toLowerCase();
    return documents.filter((doc) => doc.name?.toLowerCase().includes(needle));
  }, [documents, searchQuery]);

  const selectableCount = useMemo(
    () => documents.filter(isDocumentSelectable).length,
    [documents]
  );

  return (
    <section className="wp-doc-lib">
      <div className="wp-doc-lib__header">
        <div>
          <h3 className="wp-doc-lib__title">{PLANNER_SECTION_LABELS.library}</h3>
          <span className="wp-doc-lib__count">
            {totalCount} tài liệu · đã chọn {selectedDocIds.length}
          </span>
        </div>
        <div className="wp-doc-lib__bulk">
          <button
            type="button"
            className="wp-doc-lib__bulk-btn"
            onClick={onSelectAllSupported}
            disabled={selectableCount === 0}
          >
            {PLANNER_SELECTION_COPY.selectAll}
          </button>
          <button
            type="button"
            className="wp-doc-lib__bulk-btn"
            onClick={onClearSelection}
            disabled={selectedDocIds.length === 0}
          >
            {PLANNER_SELECTION_COPY.clearSelection}
          </button>
          <button type="button" className="wp-doc-lib__bulk-btn" onClick={onReload} title="Tải lại">
            <RefreshIcon size={14} />
          </button>
        </div>
      </div>

      <div className="wp-doc-toolbar">
        <div className="wp-search">
          <span className="wp-search__icon">
            <SearchIcon size={16} />
          </span>
          <input
            type="text"
            className="wp-search__input"
            placeholder="Tìm tài liệu..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </div>

      {error && (
        <PlannerAlert tone="error" message={error} onRetry={onReload} />
      )}

      {loading ? (
        <div className="wp-loading">
          <div className="wp-spinner" />
          <p>Đang tải tài liệu...</p>
        </div>
      ) : filteredDocuments.length > 0 ? (
        <div className="wp-doc-table-wrap">
          <table className="wp-doc-table">
            <thead>
              <tr>
                <th className="wp-doc-table__check-col" scope="col">
                  <span className="wp-sr-only">Chọn</span>
                </th>
                <th scope="col">Tên tài liệu</th>
                <th scope="col">Loại file</th>
                <th scope="col">Kích thước</th>
                <th scope="col">Ngày upload</th>
                <th scope="col">Người upload</th>
                <th scope="col">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => {
                const extension = getFileExtension(doc.name);
                const fileInfo = FILE_TYPE_ICONS[extension] || DEFAULT_FILE_TYPE_ICON;
                const selectable = isDocumentSelectable(doc);
                const selected = selectedDocIds.includes(doc.id);
                // Chặn ngay ở đây một lỗi 400/413 hoàn toàn có thể tránh được.
                const reason = selectable ? '' : getUnselectableReason(doc);

                const rowClass = [
                  selected ? 'wp-doc-row--selected' : '',
                  selectable ? '' : 'wp-doc-row--unsupported',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <tr key={doc.id} className={rowClass}>
                    <td className="wp-doc-table__check-col">
                      <input
                        type="checkbox"
                        className="wp-doc-check"
                        checked={selected}
                        disabled={!selectable}
                        title={reason || 'Chọn tài liệu này để AI phân tích'}
                        onChange={() => onToggleDoc(doc.id)}
                        aria-label={`Chọn ${doc.name}`}
                      />
                    </td>
                    <td>
                      <div className="wp-doc-name">
                        <span
                          className="wp-file-icon"
                          style={{ backgroundColor: `${fileInfo.color}20`, color: fileInfo.color }}
                        >
                          {fileInfo.icon}
                        </span>
                        <span className="wp-doc-name__text">{doc.name}</span>
                        {!selectable && (
                          <span className="wp-doc-row__badge-unsupported" title={reason}>
                            AI không đọc được
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className="wp-file-badge"
                        style={{ backgroundColor: `${fileInfo.color}20`, color: fileInfo.color }}
                      >
                        {extension}
                      </span>
                    </td>
                    <td>{formatFileSize(doc.fileSize)}</td>
                    <td>{formatDate(doc.createdAt)}</td>
                    <td>
                      {doc.uploadedBy ? (
                        <div className="wp-uploader">
                          {doc.uploadedBy.avatarUrl ? (
                            <img
                              src={doc.uploadedBy.avatarUrl}
                              alt={doc.uploadedBy.fullName || 'User'}
                              className="wp-uploader__avatar"
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="wp-uploader__avatar">
                              {doc.uploadedBy.fullName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                          <span className="wp-uploader__name">
                            {doc.uploadedBy.fullName || doc.uploadedBy.email || 'N/A'}
                          </span>
                        </div>
                      ) : (
                        <span className="wp-doc-dash">—</span>
                      )}
                    </td>
                    <td>
                      <div className="wp-row-actions">
                        <button
                          type="button"
                          className="wp-icon-btn wp-icon-btn--view"
                          onClick={() => onPreview(doc)}
                          title="Xem"
                        >
                          <EyeIcon size={16} />
                        </button>
                        <button
                          type="button"
                          className="wp-icon-btn wp-icon-btn--download"
                          onClick={() => onDownload(doc.url, doc.name)}
                          title="Tải xuống"
                        >
                          <DownloadIcon size={16} />
                        </button>
                        <button
                          type="button"
                          className="wp-icon-btn wp-icon-btn--delete"
                          onClick={() => onDelete(doc.id)}
                          title="Xóa"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="wp-doc-empty">
          <p>{searchQuery ? PLANNER_EMPTY_STATES.noSearchResult : PLANNER_EMPTY_STATES.noDocuments}</p>
          {!searchQuery && (
            <p className="wp-doc-empty__hint">{PLANNER_EMPTY_STATES.noDocumentsHint}</p>
          )}
        </div>
      )}
    </section>
  );
}

export default PlannerDocumentLibrary;
