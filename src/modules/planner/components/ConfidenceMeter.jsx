import React from 'react';
import { getConfidenceLevel } from '../utils/plannerConstants';

/**
 * Hiển thị độ tin cậy của AI.
 *
 * `getConfidenceLevel` kiểm tra `typeof value === 'number'` chứ không kiểm tra truthy, nên
 * confidence = 0 vẫn ra "0% · Độ tin cậy thấp" (đỏ) thay vì bị coi như không có dữ liệu.
 *
 * @param {{ value: number|null, size?: 'sm'|'md' }} props
 */
function ConfidenceMeter({ value, size = 'sm' }) {
  const level = getConfidenceLevel(value);

  if (!level) {
    return (
      <span className="wp-confidence wp-confidence--unknown" title="AI không đưa ra độ tin cậy cho bài viết này">
        —
      </span>
    );
  }

  const percent = Math.round(value * 100);

  return (
    <span
      className={`wp-confidence wp-confidence--${size}`}
      style={{ backgroundColor: level.bg, color: level.color }}
      title={`${level.label} (${percent}%)`}
    >
      <span className="wp-confidence__track">
        <span
          className="wp-confidence__fill"
          style={{ width: `${percent}%`, backgroundColor: level.color }}
        />
      </span>
      <span className="wp-confidence__value">{percent}%</span>
    </span>
  );
}

export default ConfidenceMeter;
