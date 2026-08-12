import { requestJson } from '../../../services/Api';

export const authApi = {
  register: (payload, baseUrl) =>
    requestJson(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      baseUrl
    ),
  login: (payload, baseUrl) =>
    requestJson(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      baseUrl
    ),
  forgotPassword: (payload, baseUrl) =>
    requestJson(
      '/auth/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      baseUrl
    ),
  resetPassword: (payload, baseUrl) =>
    requestJson(
      '/auth/reset-password',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      baseUrl
    ),
  logout: (payload, baseUrl) =>
    requestJson(
      '/auth/logout',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      baseUrl
    ),
};
