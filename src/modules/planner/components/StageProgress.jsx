import React from 'react';
import { PLAN_STAGES, STAGE_LABELS, STAGE_ORDER } from '../utils/stagedPlannerConstants';

/**
 * Linear-style progress indicator for the 5-step staged planner flow.
 * Clean dots with connecting lines, labels below.
 */
export default function StageProgress({ currentStage, onStageClick }) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);

  return (
    <div
      className="sp-progress"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 0,
        marginBottom: 32,
        padding: '4px 0',
      }}
    >
      {STAGE_ORDER.map((stage, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;

        return (
          <React.Fragment key={stage}>
            <div
              className="sp-progress__step"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                cursor: 'default',
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                className="sp-progress__dot"
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: isCompleted ? '#0f172a' : isCurrent ? '#0f172a' : '#e2e8f0',
                  backgroundColor: isCompleted ? '#0f172a' : isCurrent ? '#fff' : 'transparent',
                  position: 'relative',
                  zIndex: 1,
                  transition: 'all 200ms ease',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(15, 23, 42, 0.1)' : 'none',
                  boxSizing: 'border-box',
                }}
              >
                {isCompleted && (
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="none"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <path
                      d="M2 4L3.5 5.5L6 2.5"
                      stroke="#fff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span
                className="sp-progress__label"
                style={{
                  fontSize: 12,
                  fontWeight: isCurrent ? 600 : 400,
                  color: isCurrent ? '#0f172a' : isCompleted ? '#475569' : '#94a3b8',
                  textAlign: 'center',
                  lineHeight: 1.3,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  transition: 'color 200ms ease',
                }}
              >
                {STAGE_LABELS[stage]}
              </span>
            </div>
            {index < STAGE_ORDER.length - 1 && (
              <div
                className="sp-progress__connector"
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: isCompleted ? '#0f172a' : '#e2e8f0',
                  marginTop: 5,
                  alignSelf: 'flex-start',
                  minWidth: 16,
                  borderRadius: 1,
                  transition: 'background-color 200ms ease',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
