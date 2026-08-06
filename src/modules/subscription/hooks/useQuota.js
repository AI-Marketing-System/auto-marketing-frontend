import { useContext } from 'react';
import { QuotaContext } from '../context/QuotaContext';

export function useQuota() {
  const context = useContext(QuotaContext);
  if (!context) {
    return { quota: null, loading: false, refresh: async () => null };
  }
  return context;
}
