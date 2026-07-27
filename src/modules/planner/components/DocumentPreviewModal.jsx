import React from 'react';
import { createPortal } from 'react-dom';
import { DownloadIcon } from './PlannerIcons';
import { formatDate, formatFileSize } from '../utils/documentFormat';
import { getFileExtension } from '../utils/plannerConstants';

const IMAGE_EXTENSIONS = ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'SVG'];

/**
 * Xem trước tài liệu. Chuyển nguyên từ KnowledgeAssetsModal: ảnh dùng <img>, PDF dùng iframe trực
 * tiếp, còn lại rơi về Google Docs viewer.
 *
 * @param {{ doc: object|null, onClose: () => void, onDownload: (url: string, name: string) => void }} props
 */
function DocumentPreviewModal({ doc, onClose, onDownload }) {
  if (!doc) return null;

  const extension = getFileExtension(doc.name);

  return createPortal(
    <div className="wp-preview__backdrop" role="presentation" onClick={onClose}>
      <div
        className="wp-preview__modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="wp-preview__header">
          <div className="wp-preview__title-group">
            <span className="wp-file-badge">{extension}</span>
            <div className="wp-preview__info">
              <h3 className="wp-preview__title">{doc.name}</h3>
              <span className="wp-preview__meta">
                {formatFileSize(doc.fileSize)} • {formatDate(doc.createdAt)}
              </span>
            </div>
          </div>
          <div className="wp-preview__actions">
            <button
              type="button"
              className="wp-preview__btn wp-preview__btn--primary"
              onClick={() => onDownload(doc.url, doc.name)}
            >
              <DownloadIcon size={16} />
              Tải xuống
            </button>
            <button
              type="button"
              className="wp-preview__btn wp-preview__btn--secondary"
              onClick={() => window.open(doc.url, '_blank')}
            >
              Mở tab mới
            </button>
            <button
              type="button"
              className="wp-preview__btn wp-preview__btn--close"
              onClick={onClose}
              title="Đóng"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="wp-preview__body">
          {IMAGE_EXTENSIONS.includes(extension) ? (
            <div className="wp-preview__img-wrap">
              <img src={doc.url} alt={doc.name} className="wp-preview__img" />
            </div>
          ) : extension === 'PDF' ? (
            <iframe src={doc.url} title={doc.name} className="wp-preview__iframe" />
          ) : (
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(doc.url)}&embedded=true`}
              title={doc.name}
              className="wp-preview__iframe"
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default DocumentPreviewModal;
