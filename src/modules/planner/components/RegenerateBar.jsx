import React from 'react';
import { RefreshIcon } from './PlannerIcons';

function RegenerateBar({ freeText, setFreeText, onRegen, loading }) {
  return (
    <div className="sp-regen-bar">
      <div className="sp-regen-bar__label">
        <RefreshIcon size={14} />
        Chỉ dẫn điều chỉnh cho AI (Tùy chọn)
      </div>
      <div className="sp-regen-bar__row">
        <input
          type="text"
          className="sp-regen-bar__input"
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="VD: Nhấn mạnh thông điệp khuyến mãi Q3, tập trung vào đối tượng khách hàng trẻ..."
          disabled={loading}
        />
        <button
          className="sp-btn sp-btn--primary sp-btn--sm"
          onClick={onRegen}
          disabled={loading || !freeText.trim()}
          style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          Sinh lại bước này
        </button>
      </div>
    </div>
  );
}

export default RegenerateBar;
