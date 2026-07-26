import React, { useState } from 'react';
import PlannerAlert from './PlannerAlert';
import { AlertTriangleIcon, ChevronDownIcon, ChevronRightIcon } from './PlannerIcons';
import { PLANNER_EMPTY_STATES, PLANNER_SECTION_LABELS } from '../utils/plannerCopy';

/**
 * Thông tin AI cho biết còn thiếu. Chỉ để đọc — đây là nhận định của AI về dữ liệu đầu vào, không
 * phải nội dung kế hoạch để sửa.
 *
 * Backend cũng gắn thêm vào đây các ghi chú về tài liệu bị cắt hoặc bị bỏ qua.
 */
function PlanMissingInfoPanel({ items }) {
  const [open, setOpen] = useState(true);

  if (!items || items.length === 0) {
    return <PlannerAlert tone="success" message={PLANNER_EMPTY_STATES.noMissingInfo} />;
  }

  return (
    <section className="wp-missing">
      <button type="button" className="wp-missing__head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="wp-missing__icon">
          <AlertTriangleIcon size={18} />
        </span>
        <span className="wp-missing__title">
          {PLANNER_SECTION_LABELS.missingInfo} ({items.length})
        </span>
        {open ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
      </button>

      {open && (
        <>
          <p className="wp-missing__lead">
            Bổ sung những thông tin dưới đây vào tài liệu rồi phân tích lại sẽ cho kế hoạch chính xác hơn.
          </p>
          <ul className="wp-missing__list">
            {items.map((item, index) => (
              <li key={`${index}-${item.slice(0, 20)}`}>{item}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export default PlanMissingInfoPanel;
