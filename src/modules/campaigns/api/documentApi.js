import { requestJson } from '../../../services/Api';

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '' || value === 'ALL') return;
    searchParams.append(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const assertApiSuccess = (response, fallbackMessage = 'Yêu cầu không thành công') => {
  if (response && response.success === false) {
    throw new Error(response.message || fallbackMessage);
  }
  return response;
};

export const parseDocumentsResponse = (response) => {
  assertApiSuccess(response, 'Không thể tải tài liệu');

  const payload = response?.data || response;

  // If it's already an array
  if (Array.isArray(payload)) {
    return {
      documents: payload,
      totalElements: payload.length,
      totalPages: 1,
      number: 0,
      size: payload.length,
    };
  }

  // If it's a paginated response
  if (payload?.documents) {
    return {
      documents: payload.documents,
      totalElements: payload.totalElements || 0,
      totalPages: payload.totalPages || 1,
      number: payload.page || 0,
      size: payload.size || 20,
    };
  }

  // If it has content array (Spring Data Page structure)
  if (payload?.content) {
    return {
      documents: payload.content,
      totalElements: payload.totalElements || 0,
      totalPages: payload.totalPages || 1,
      number: payload.number || 0,
      size: payload.size || 20,
    };
  }

  return {
    documents: [],
    totalElements: 0,
    totalPages: 1,
    number: 0,
    size: 0,
  };
};

export const documentApi = {
  upload: (baseUrl, workspaceId, formData) => {
    return requestJson(
      `/workspaces/${workspaceId}/documents`,
      { method: 'POST', body: formData, isFormData: true },
      baseUrl
    );
  },

  list: (baseUrl, workspaceId, params = {}) => {
    const queryString = buildQueryString({
      page: params.page || 0,
      size: params.size || 20,
      folderPath: params.folderPath,
    });
    return requestJson(
      `/workspaces/${workspaceId}/documents${queryString}`,
      { method: 'GET' },
      baseUrl
    );
  },

  getDetail: (baseUrl, workspaceId, documentId) => {
    return requestJson(
      `/workspaces/${workspaceId}/documents/${documentId}`,
      { method: 'GET' },
      baseUrl
    );
  },

  delete: (baseUrl, workspaceId, documentId) => {
    return requestJson(
      `/workspaces/${workspaceId}/documents/${documentId}`,
      { method: 'DELETE' },
      baseUrl
    );
  },
};
