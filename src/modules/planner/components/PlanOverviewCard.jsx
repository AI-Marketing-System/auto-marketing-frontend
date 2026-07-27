import React from 'react';
import EditableField from './EditableField';
import { RefreshIcon, TrashIcon } from './PlannerIcons';
import { formatTime } from '../utils/documentFormat';
import { setOverviewField } from '../utils/plannerPlanModel';
import { PLANNER_DRAFT_COPY, PLANNER_FIELD_LABELS, PLANNER_SECTION_LABELS } from '../utils/plannerCopy';

/** Tổng quan workspace do AI suy ra, sửa trực tiếp được. */
function PlanOverviewCard({ plan, onChange, draftSavedAt, draftSaveState, onReanalyze, onDiscardDraft }) {
  const setField = (field) => (value) => onChange(setOverviewField, field, value);

  const draftLabel =
    draftSaveState === 'pending'
      ? PLANNER_DRAFT_COPY.pending
      : draftSaveState === 'failed'
        ? PLANNER_DRAFT_COPY.failed
        : draftSavedAt
          ? PLANNER_DRAFT_COPY.saved(formatTime(draftSavedAt))
          : '';

  return (
    <section className="wp-card wp-overview">
      <header className="wp-overview__head">
        <h2 className="wp-card__title">{PLANNER_SECTION_LABELS.overview}</h2>
        <div className="wp-overview__actions">
          {draftLabel && (
            <span className={`wp-draft wp-draft--${draftSaveState}`}>{draftLabel}</span>
          )}
          <button type="button" className="wp-btn wp-btn--ghost" onClick={onReanalyze}>
            <RefreshIcon size={14} />
            {PLANNER_SECTION_LABELS.reanalyze}
          </button>
          <button type="button" className="wp-btn wp-btn--ghost wp-btn--danger" onClick={onDiscardDraft}>
            <TrashIcon size={14} />
            {PLANNER_SECTION_LABELS.discardDraft}
          </button>
        </div>
      </header>

      <div className="wp-overview__grid">
        <EditableField
          label={PLANNER_FIELD_LABELS.workspaceName}
          value={plan.workspaceName}
          onChange={setField('workspaceName')}
        />
        <EditableField
          label={PLANNER_FIELD_LABELS.brandTone}
          value={plan.brandTone}
          onChange={setField('brandTone')}
        />
      </div>

      <EditableField
        label={PLANNER_FIELD_LABELS.workspaceDescription}
        value={plan.workspaceDescription}
        onChange={setField('workspaceDescription')}
        as="textarea"
        rows={2}
      />
      <EditableField
        label={PLANNER_FIELD_LABELS.businessSummary}
        value={plan.businessSummary}
        onChange={setField('businessSummary')}
        as="textarea"
        rows={3}
      />
      <EditableField
        label={PLANNER_FIELD_LABELS.targetAudience}
        value={plan.targetAudience}
        onChange={setField('targetAudience')}
        as="textarea"
        rows={2}
      />
    </section>
  );
}

export default PlanOverviewCard;
