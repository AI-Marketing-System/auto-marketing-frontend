import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { getQuota } from '../api/subscriptionApi';

export const QuotaContext = createContext(null);

export function QuotaProvider({ children }) {
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const nextQuota = await getQuota();
      setQuota(nextQuota);
      return nextQuota;
    } catch (error) {
      console.error('Không thể tải thông tin hạn mức:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handleQuotaChanged = (e) => {
      // Nếu sự kiện có đính kèm remainingTokens thực tế từ API response, cập nhật UI tức thì 0ms
      if (e?.detail?.remainingTokens !== undefined) {
        setQuota((prev) => (prev ? { ...prev, remainingTokens: e.detail.remainingTokens } : prev));
      }
      refresh();
    };

    window.addEventListener('quota:changed', handleQuotaChanged);
    window.addEventListener('subscription:payment_required', handleQuotaChanged);
    return () => {
      window.removeEventListener('quota:changed', handleQuotaChanged);
      window.removeEventListener('subscription:payment_required', handleQuotaChanged);
    };
  }, [refresh]);

  const value = useMemo(() => ({ quota, loading, refresh }), [quota, loading, refresh]);

  return <QuotaContext.Provider value={value}>{children}</QuotaContext.Provider>;
}
