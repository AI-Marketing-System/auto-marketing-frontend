import { requestJson } from '../../../services/Api';

const buildFormData = (payload, mediaFiles) => {
  const formData = new FormData();
  const jsonBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  formData.append('request', jsonBlob);
  if (mediaFiles && mediaFiles.length > 0) {
    mediaFiles.forEach((file) => {
      if (file instanceof File) {
        formData.append('mediaFiles', file);
      }
    });
  }
  return formData;
};

export const postApi = {
  listByTopicId: (topicId, baseUrl) =>
    requestJson(`/posts/topic/${topicId}`, { method: 'GET' }, baseUrl),

  create: (payload, mediaFiles, baseUrl) => {
    const formData = buildFormData(payload, mediaFiles);
    return requestJson('/posts', { method: 'POST', body: formData }, baseUrl);
  },

  update: (id, payload, mediaFiles, baseUrl) => {
    const formData = buildFormData(payload, mediaFiles);
    return requestJson(`/posts/${id}`, { method: 'PUT', body: formData }, baseUrl);
  },

  delete: (id, baseUrl) =>
    requestJson(`/posts/${id}`, { method: 'DELETE' }, baseUrl),

  generate: (payload, baseUrl) =>
    requestJson(
      '/posts/generate',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      baseUrl
    ),

  generateImage: (payload, baseUrl) =>
    requestJson(
      '/posts/generate-image',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      baseUrl
    ),
};
