import React from 'react';
import PlannerNotAppliedNotice from './PlannerNotAppliedNotice';
import { ChevronDownIcon, ChevronRightIcon, ClockIcon, SparkleIcon } from './PlannerIcons';
import { STAGED_PLANNER_INTRO } from '../utils/stagedPlannerCopy';

/** Giải thích cho người dùng quy trình Staged Planner. */
function StagedPlannerIntroPanel({ collapsed, onToggle }) {
  if (collapsed) {
    return (
      <button type="button" className="wp-intro__reopen" onClick={onToggle}>
        <ChevronRightIcon size={16} />
        {STAGED_PLANNER_INTRO.expandLabel}
      </button>
    );
  }

  return (
    <section className="wp-card wp-intro">
      <div className="wp-intro__head">
        <span className="wp-intro__eyebrow">
          <SparkleIcon size={16} />
          {STAGED_PLANNER_INTRO.eyebrow}
        </span>
        <h2 className="wp-intro__title">{STAGED_PLANNER_INTRO.title}</h2>
        <p className="wp-intro__lead">{STAGED_PLANNER_INTRO.lead}</p>
      </div>

      <ol className="wp-steps">
        {STAGED_PLANNER_INTRO.steps.map((step) => (
          <li key={step.n} className="wp-steps__item">
            <span className="wp-steps__n">{step.n}</span>
            <div>
              <p className="wp-steps__title">{step.title}</p>
              <p className="wp-steps__body">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="wp-intro__grid">
        <div className="wp-intro__block wp-intro__block--reads">
          <h3 className="wp-intro__block-title">{STAGED_PLANNER_INTRO.readsTitle}</h3>
          <ul>
            {STAGED_PLANNER_INTRO.reads.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="wp-intro__block wp-intro__block--produces">
          <h3 className="wp-intro__block-title">{STAGED_PLANNER_INTRO.producesTitle}</h3>
          <ul>
            {STAGED_PLANNER_INTRO.produces.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="wp-intro__block wp-intro__block--not">
          <h3 className="wp-intro__block-title">{STAGED_PLANNER_INTRO.notTitle}</h3>
          <ul>
            {STAGED_PLANNER_INTRO.not.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="wp-intro__notes">
        <p className="wp-intro__note">
          <ClockIcon size={14} />
          {STAGED_PLANNER_INTRO.durationNote}
        </p>
        <p className="wp-intro__note">{STAGED_PLANNER_INTRO.draftNote}</p>
      </div>

      <PlannerNotAppliedNotice variant="intro" />

      <button type="button" className="wp-intro__collapse" onClick={onToggle}>
        <ChevronDownIcon size={16} />
        {STAGED_PLANNER_INTRO.collapseLabel}
      </button>
    </section>
  );
}

export default StagedPlannerIntroPanel;
