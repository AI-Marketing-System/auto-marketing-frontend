import React from 'react';
import PlannerAlert from './PlannerAlert';
import { SparkleIcon } from './PlannerIcons';
import { formatFileSize } from '../utils/documentFormat';
import { PLANNER_SECTION_LABELS, PLANNER_SELECTION_COPY } from '../utils/plannerCopy';

/**
 * Tóm tắt lựa chọn + nút chạy phân tích.
 *
 * @param {{ validation: object, onAnalyze: () => void, disabled?: boolean }} props
 */
function PlannerSelectionSummary({ validation, onAnalyze, disabled = false }) {
  const { fileCount, totalBytes, errors, warnings, canSubmit } = validation;

  return (
    <div className="wp-summary">
      {errors.length > 0 && (
        <PlannerAlert tone="error" title="Cần điều chỉnh lựa chọn" items={errors} />
      )}
      {warnings.length > 0 && <PlannerAlert tone="warning" items={warnings} />}

      <div className="wp-summary__bar">
        <div className="wp-summary__stats">
          {fileCount > 0 ? (
            <>
              <strong>{fileCount}</strong> tài liệu đã chọn
              <span className="wp-summary__dot">·</span>
              tổng <strong>{formatFileSize(totalBytes)}</strong>
            </>
          ) : (
            <span className="wp-summary__hint">{PLANNER_SELECTION_COPY.emptyHint}</span>
          )}
          <span className="wp-summary__limits">{PLANNER_SELECTION_COPY.limitsHint}</span>
        </div>

        <button
          type="button"
          className="wp-btn wp-btn--primary wp-btn--lg"
          onClick={onAnalyze}
          disabled={disabled || !canSubmit}
          title={canSubmit ? 'Gửi tài liệu cho AI phân tích' : PLANNER_SELECTION_COPY.emptyHint}
        >
          <SparkleIcon size={18} />
          {PLANNER_SECTION_LABELS.analyze}
        </button>
      </div>
    </div>
  );
}

export default PlannerSelectionSummary;
