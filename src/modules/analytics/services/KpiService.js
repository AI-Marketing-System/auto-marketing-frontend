import { requestJson } from '../../../services/Api';

export const KpiService = {
  compareKpi: async (postTargetId) => {
    return await requestJson(`/analytics/kpi/compare/${postTargetId}`, { method: 'GET' });
  },
  
  saveTarget: async (data) => {
    return await requestJson(`/analytics/kpi`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
