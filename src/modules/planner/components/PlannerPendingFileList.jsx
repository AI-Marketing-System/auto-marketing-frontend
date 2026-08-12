import React from 'react';
import { XIcon } from './PlannerIcons';
import { formatFileSize } from '../utils/documentFormat';
import { DEFAULT_FILE_TYPE_ICON, FILE_TYPE_ICONS, isPlannerReadableExtension } from '../utils/plannerConstants';
import { PLANNER_SECTION_LABELS, PLANNER_SELECTION_COPY } from '../utils/plannerCopy';

/**
 * Danh sách file mới người dùng vừa thêm cho lần phân tích này (chưa chắc được lưu vào thư viện).
 *
 * @param {{ files: Array<{key: string, name: string, size: number, ext: string}>,
 *           onRemove: (key: string) => void }} props
 */
function PlannerPendingFileList({ files, onRemove }) {
  if (!files || files.length === 0) return null;

  return (
    <div className="wp-pending">
      <p className="wp-pending__title">
        {PLANNER_SECTION_LABELS.newFiles} <span className="wp-pending__count">({files.length})</span>
      </p>
      <ul className="wp-pending__list">
        {files.map((item) => {
          const info = FILE_TYPE_ICONS[item.ext] || DEFAULT_FILE_TYPE_ICON;
          const readable = isPlannerReadableExtension(item.ext);
          return (
            <li key={item.key} className={`wp-pending__item${readable ? '' : ' wp-pending__item--invalid'}`}>
              <span
                className="wp-file-icon"
                style={{ backgroundColor: `${info.color}20`, color: info.color }}
              >
                {info.icon}
              </span>
              <span className="wp-pending__name" title={item.name}>
                {item.name}
              </span>
              <span
                className="wp-file-badge"
                style={{ backgroundColor: `${info.color}20`, color: info.color }}
              >
                {item.ext || '?'}
              </span>
              <span className="wp-pending__size">{formatFileSize(item.size)}</span>
              <button
                type="button"
                className="wp-icon-btn wp-icon-btn--delete"
                onClick={() => onRemove(item.key)}
                title={PLANNER_SELECTION_COPY.removeFile}
              >
                <XIcon size={14} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default PlannerPendingFileList;
