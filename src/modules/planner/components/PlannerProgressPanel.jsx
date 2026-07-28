import React from 'react';
import PlannerAlert from './PlannerAlert';
import { CheckCircleIcon } from './PlannerIcons';
import { formatElapsed } from '../utils/documentFormat';
import {
  ANALYZE_EXPECTED_SECONDS,
  ANALYZE_PROGRESS_CEILING,
  ANALYZE_SLOW_WARNING_SECOND,
  ANALYZE_STAGES,
} from '../utils/plannerConstants';
import { PLANNER_PROGRESS_COPY, PLANNER_SECTION_LABELS } from '../utils/plannerCopy';

/**
 * Trải nghiệm chờ cho một lời gọi đồng bộ dài.
 *
 * Backend không phát event tiến trình nào, nên thanh tiến trình bị chốt ở
 * ANALYZE_PROGRESS_CEILING và KHÔNG bao giờ tự chạy tới 100% trước khi có phản hồi thật — vờ như
 * biết tiến độ chính xác là nói dối người dùng. Vì vậy có thêm một dòng nói rõ điều đó.
 */
function PlannerProgressPanel({ elapsedSeconds, onCancel }) {
  const stageIndex = Math.max(
    0,
    ANALYZE_STAGES.filter((stage) => stage.atSecond <= elapsedSeconds).length - 1
  );
  const percent = Math.min(
    ANALYZE_PROGRESS_CEILING,
    Math.round((elapsedSeconds / ANALYZE_EXPECTED_SECONDS) * 100)
  );

  return (
    <section className="wp-card wp-progress">
      <div className="wp-progress__head">
        <div>
          <h2 className="wp-card__title">{PLANNER_SECTION_LABELS.analyzing}</h2>
          <p className="wp-progress__elapsed">
            Đã trôi qua <strong>{formatElapsed(elapsedSeconds)}</strong> ({elapsedSeconds} giây)
          </p>
        </div>
        <button type="button" className="wp-btn wp-btn--ghost" onClick={onCancel}>
          {PLANNER_PROGRESS_COPY.cancel}
        </button>
      </div>

      <div
        className="wp-progress__bar"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Tiến trình phân tích (ước lượng)"
      >
        <div className="wp-progress__fill" style={{ width: `${percent}%` }} />
      </div>

      <ol className="wp-progress__stages">
        {ANALYZE_STAGES.map((stage, index) => {
          const state = index < stageIndex ? 'done' : index === stageIndex ? 'active' : 'todo';
          return (
            <li key={stage.step} className={`wp-progress__stage wp-progress__stage--${state}`}>
              <span className="wp-progress__stage-mark">
                {state === 'done' ? (
                  <CheckCircleIcon size={16} />
                ) : state === 'active' ? (
                  <span className="wp-spinner wp-spinner--sm" />
                ) : (
                  <span className="wp-progress__dot" />
                )}
              </span>
              <span className="wp-progress__stage-text">
                <span className="wp-progress__stage-step">{stage.step}</span>
                <span className="wp-progress__stage-label">{stage.label}</span>
              </span>
            </li>
          );
        })}
      </ol>

      <p className="wp-progress__honesty">{PLANNER_PROGRESS_COPY.honesty}</p>

      {elapsedSeconds >= ANALYZE_SLOW_WARNING_SECOND && (
        <PlannerAlert tone="warning" message={PLANNER_PROGRESS_COPY.slowWarning} />
      )}
    </section>
  );
}

export default PlannerProgressPanel;
