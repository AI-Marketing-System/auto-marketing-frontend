import React, { useEffect, useRef, useState } from 'react';
import { PLANNER_EMPTY_STATES } from '../utils/plannerCopy';

/**
 * Ô nội dung sửa trực tiếp: hiển thị như văn bản, bấm vào thì thành input/textarea/date.
 *
 * Giữ một bản `draft` cục bộ và chỉ commit khi blur / Enter, để việc gõ chữ không phải chạy ngược
 * qua cả cây 3 cấp sau mỗi ký tự.
 *
 * @param {{ value: string, onChange: (next: string) => void, as?: 'input'|'textarea'|'date',
 *           label?: string, placeholder?: string, rows?: number, maxLength?: number,
 *           inline?: boolean }} props
 */
function EditableField({
  value,
  onChange,
  as = 'input',
  label,
  placeholder,
  rows = 3,
  maxLength,
  inline = false,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const controlRef = useRef(null);

  // Đồng bộ lại khi giá trị bên ngoài đổi (phục hồi nháp, phân tích lại) và không đang gõ.
  useEffect(() => {
    if (!editing) setDraft(value ?? '');
  }, [value, editing]);

  useEffect(() => {
    if (editing && controlRef.current) {
      controlRef.current.focus();
      if (as !== 'date' && typeof controlRef.current.setSelectionRange === 'function') {
        const end = controlRef.current.value.length;
        controlRef.current.setSelectionRange(end, end);
      }
      if (as === 'textarea') {
        controlRef.current.style.height = 'auto';
        controlRef.current.style.height = controlRef.current.scrollHeight + 'px';
      }
    }
  }, [editing, as]);

  const handleInput = (event) => {
    setDraft(event.target.value);
    if (as === 'textarea' && controlRef.current) {
      controlRef.current.style.height = 'auto';
      controlRef.current.style.height = controlRef.current.scrollHeight + 'px';
    }
  };

  const commit = () => {
    setEditing(false);
    if (draft !== value) onChange(draft);
  };

  const cancel = () => {
    setDraft(value ?? '');
    setEditing(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
      return;
    }
    if (event.key === 'Enter') {
      // Trong textarea, Enter là xuống dòng; chỉ Ctrl/Cmd+Enter mới commit.
      if (as === 'textarea' && !(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      commit();
    }
  };

  const wrapperClass = `wp-field${inline ? ' wp-field--inline' : ''}`;
  const isEmpty = !value || String(value).trim() === '';

  if (!editing) {
    return (
      <div className={wrapperClass}>
        {label && <span className="wp-field__label">{label}</span>}
        <div
          className={`wp-field__display${isEmpty ? ' wp-field__display--empty' : ''}`}
          role="button"
          tabIndex={0}
          title="Bấm để sửa"
          onClick={() => setEditing(true)}
          onFocus={() => setEditing(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setEditing(true);
            }
          }}
        >
          {isEmpty ? PLANNER_EMPTY_STATES.emptyField : value}
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      {label && <span className="wp-field__label">{label}</span>}
      {as === 'textarea' ? (
        <textarea
          ref={controlRef}
          className="wp-field__control wp-field__control--textarea"
          value={draft}
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={handleInput}
          onBlur={commit}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <input
          ref={controlRef}
          // `<input type="date">` nhận đúng YYYY-MM-DD, là đúng định dạng backend trả về.
          type={as === 'date' ? 'date' : 'text'}
          className="wp-field__control"
          value={draft}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={handleInput}
          onBlur={commit}
          onKeyDown={handleKeyDown}
        />
      )}
      {as === 'textarea' && <span className="wp-field__hint">Ctrl + Enter để lưu · Esc để hoàn tác</span>}
    </div>
  );
}

export default EditableField;
