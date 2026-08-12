import { requestJson } from '../../../services/Api';

const buildFormData = (payload, mediaFiles) => {
  const formData = new FormData();

  if (mediaFiles && mediaFiles.length > 0) {
    const mediaUrls = [];
    mediaFiles.forEach((file) => {
      if (file instanceof File) {
        formData.append('mediaFiles', file);
      } else if (file.url) {
        mediaUrls.push(file.url);
      }
    });
    if (mediaUrls.length > 0) {
      payload.mediaUrls = mediaUrls;
    }
  }

  const jsonBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  formData.append('request', jsonBlob);

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
