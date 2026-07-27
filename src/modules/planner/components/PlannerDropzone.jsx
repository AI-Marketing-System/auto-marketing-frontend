import React, { useCallback, useRef, useState } from 'react';
import { UploadIcon } from './PlannerIcons';
import { PLANNER_ACCEPT_ATTRIBUTE } from '../utils/plannerConstants';
import { PLANNER_SELECTION_COPY } from '../utils/plannerCopy';

/**
 * Khu vực kéo thả file. Chuyển từ KnowledgeAssetsModal (handleDrag / handleDrop / handleFileInput);
 * `dragActive` là state cục bộ của component này.
 *
 * @param {{ onFiles: (files: File[]) => void, disabled?: boolean, uploading?: boolean,
 *           accept?: string, hint?: string }} props
 */
function PlannerDropzone({ onFiles, disabled = false, uploading = false, accept, hint }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true);
    } else if (event.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      setDragActive(false);
      if (disabled) return;
      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        onFiles(Array.from(event.dataTransfer.files));
      }
    },
    [disabled, onFiles]
  );

  const handleFileInput = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      onFiles(Array.from(event.target.files));
    }
    // Reset để chọn lại đúng file vừa bỏ ra vẫn kích hoạt onChange.
    event.target.value = '';
  };

  return (
    <div
      className={`wp-dropzone${dragActive ? ' wp-dropzone--active' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="wp-dropzone__icon">
        <UploadIcon size={44} />
      </div>
      <p className="wp-dropzone__text">{PLANNER_SELECTION_COPY.dropzoneText}</p>
      <p className="wp-dropzone__hint">{PLANNER_SELECTION_COPY.dropzoneHint}</p>
      <p className="wp-dropzone__formats">{hint || PLANNER_SELECTION_COPY.dropzoneFormats}</p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept || PLANNER_ACCEPT_ATTRIBUTE}
        onChange={handleFileInput}
        className="wp-dropzone__input"
        disabled={disabled}
      />
      {uploading && (
        <div className="wp-dropzone__overlay">
          <div className="wp-spinner" />
          <p>{PLANNER_SELECTION_COPY.uploading}</p>
        </div>
      )}
    </div>
  );
}

export default PlannerDropzone;
