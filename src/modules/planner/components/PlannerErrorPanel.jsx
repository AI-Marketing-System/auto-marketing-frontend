import React from 'react';
import { AlertTriangleIcon } from './PlannerIcons';
import { PLANNER_ERROR_ACTION_LABELS } from '../utils/plannerCopy';

/**
 * Hiển thị lỗi phân tích kèm hành động khắc phục theo từng status.
 *
 * Luôn hiển thị `serverMessage` khi nó khác phần body: backend không có error code máy đọc được, chỉ
 * có `message` tiếng Việt tự do — và message đó thường CỤ THỂ hơn bất cứ copy theo status nào
 * (ví dụ nêu đúng tên file bị lỗi).
 */
function PlannerErrorPanel({ error, handlers }) {
  if (!error) return null;

  const { title, body, serverMessage, status, actions = [], retryEmphasis } = error;

  return (
    <section className="wp-card wp-error" role="alert">
      <div className="wp-error__head">
        <span className="wp-error__icon">
          <AlertTriangleIcon size={22} />
        </span>
        <div>
          <h2 className="wp-error__title">{title}</h2>
          {status ? <span className="wp-error__status">Mã lỗi HTTP {status}</span> : null}
        </div>
      </div>

      <p className="wp-error__body">{body}</p>

      {serverMessage && serverMessage !== body && (
        <p className="wp-error__server">Máy chủ báo: &ldquo;{serverMessage}&rdquo;</p>
      )}

      <div className="wp-error__actions">
        {actions.map((action) => {
          const handler = handlers[action];
          if (!handler) return null;
          const primary = retryEmphasis ? action === 'retry' : action === actions[0];
          return (
            <button
              key={action}
              type="button"
              className={`wp-btn ${primary ? 'wp-btn--primary' : 'wp-btn--ghost'}`}
              onClick={handler}
            >
              {PLANNER_ERROR_ACTION_LABELS[action] || action}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default PlannerErrorPanel;
