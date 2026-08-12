import React from 'react';
import {
  ENTITY_SOURCE,
  ENTITY_SOURCE_LABELS,
  ENTITY_SOURCE_COLORS,
} from '../utils/stagedPlannerConstants';

/**
 * Badge hiển thị nguồn gốc entity: AI_GENERATED | USER_EDITED | USER_CREATED.
 * Dùng để user biết entity nào sẽ bị ghi đè nếu bấm "sinh lại".
 */
export default function EntitySourceBadge({ source = ENTITY_SOURCE.AI_GENERATED }) {
  const colors = ENTITY_SOURCE_COLORS[source] || ENTITY_SOURCE_COLORS[ENTITY_SOURCE.AI_GENERATED];
  const label = ENTITY_SOURCE_LABELS[source] || source;

  return (
    <span
      className="es-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 600,
        lineHeight: '18px',
        backgroundColor: colors.bg,
        color: colors.text,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}
