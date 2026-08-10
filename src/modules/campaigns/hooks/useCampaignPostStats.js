import { useState, useEffect, useCallback } from 'react';
import { requestJson } from '../../../services/Api';
import { API_BASE_URL } from '../../../config/env';

export const useCampaignPostStats = (campaignId, dependencies = []) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!campaignId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await requestJson(`/campaigns/${campaignId}/post-stats`, { method: 'GET' }, API_BASE_URL);
      if (response && response.success) {
        setStats(response.data);
      } else {
        setError(response.message || 'Lỗi khi tải thống kê');
      }
    } catch (err) {
      setError(err.message || 'Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, ...dependencies]);

  return { stats, loading, error, refetch: fetchStats };
};
