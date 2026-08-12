import React, { useEffect, useState, useCallback } from 'react';
import '../styles/SubscriptionModule.css';

/**
 * TokenToast — toast nhỏ góc dưới phải thông báo số token vừa tiêu tốn.
 * Sử dụng hook useTokenToast() để trigger từ bất kỳ component nào.
 */

// ── Singleton event emitter ────────────────────────────────────────────────────
const TOKEN_TOAST_EVENT = 'token:toast';

export function showTokenToast(tokensUsed, remainingToken) {
  window.dispatchEvent(
    new CustomEvent(TOKEN_TOAST_EVENT, {
      detail: { tokensUsed, remainingToken },
    })
  );
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function TokenToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((detail) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, ...detail }]);
    // Tự động xóa sau 4 giây
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    const handler = (e) => addToast(e.detail);
    window.addEventListener(TOKEN_TOAST_EVENT, handler);
    return () => window.removeEventListener(TOKEN_TOAST_EVENT, handler);
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="token-toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="token-toast">
          <span className="token-toast-icon">⚡</span>
          <span className="token-toast-text">
            Đã dùng{' '}
            <strong>{(toast.tokensUsed || 0).toLocaleString('vi-VN')}</strong>{' '}
            token •{' '}
            <span className="token-toast-remaining">
              Còn {(toast.remainingToken || 0).toLocaleString('vi-VN')}
            </span>
          </span>
          <button
            className="token-toast-close"
            onClick={() =>
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }
            aria-label="Đóng thông báo"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
