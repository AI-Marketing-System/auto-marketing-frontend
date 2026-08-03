import React from 'react';

function FieldRow({
  label,
  value,
  onChange,
  type,
  rows = 2,
  required = false,
  disabled = false,
  placeholder,
}) {
  return (
    <div className="sp-field">
      <label className="sp-field__label">
        {label}
        {required && <span className="sp-field__required">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          className="sp-field__textarea"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          disabled={disabled}
          placeholder={placeholder}
          spellCheck={false}
        />
      ) : (
        <input
          className="sp-field__input"
          type={type || 'text'}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export default FieldRow;
