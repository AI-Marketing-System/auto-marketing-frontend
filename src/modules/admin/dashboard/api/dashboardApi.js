import { requestJson } from '../../../../services/Api';

export const dashboardApi = {
  getDashboard: async () => {
    return requestJson('/admin/dashboard');
  },
};
