import React from 'react';
import { InfoIcon } from './PlannerIcons';
import { PLANNER_NOT_APPLIED_NOTICE } from '../utils/plannerCopy';

/**
 * Nói rõ rằng chưa có gì được tạo thật trong hệ thống.
 *
 * Cố ý dùng banner tường minh thay vì một nút "Tạo Campaign thật" bị disable: nút disabled mời người
 * ta bấm lặp lại rồi sinh câu hỏi, còn API `apply` thì chưa tồn tại.
 */
function PlannerNotAppliedNotice({ variant = 'intro' }) {
  return (
    <div className={`wp-notice wp-notice--${variant}`}>
      <span className="wp-notice__icon">
        <InfoIcon size={18} />
      </span>
      <div>
        <p className="wp-notice__title">{PLANNER_NOT_APPLIED_NOTICE.title}</p>
        <p className="wp-notice__body">{PLANNER_NOT_APPLIED_NOTICE.body}</p>
        <p className="wp-notice__future">{PLANNER_NOT_APPLIED_NOTICE.futureNote}</p>
      </div>
    </div>
  );
}

export default PlannerNotAppliedNotice;
