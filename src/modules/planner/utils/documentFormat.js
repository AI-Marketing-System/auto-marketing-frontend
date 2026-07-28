/**
 * Helper định dạng và tải tài liệu.
 * Chuyển từ KnowledgeAssetsModal (vốn định nghĩa inline trong component) để cả trang planner dùng lại.
 */

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const formatElapsed = (totalSeconds) => {
  const safe = Math.max(0, Math.floor(totalSeconds || 0));
  const minutes = String(Math.floor(safe / 60)).padStart(2, '0');
  const seconds = String(safe % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

/** Tải qua blob để trình duyệt lưu file thay vì mở tab; nếu bị CORS thì rơi về link trực tiếp. */
export const downloadDocument = async (url, fileName) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'document';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/** Kiểu tài liệu gửi kèm khi upload vào thư viện, khớp cách backend đặt thư mục Cloudinary. */
export const detectDocumentType = (fileName) => {
  const ext = (fileName || '').split('.').pop().toUpperCase();
  if (ext === 'PDF') return 'pdf';
  if (ext === 'XLSX' || ext === 'XLS' || ext === 'CSV') return 'spreadsheet';
  if (ext === 'PPTX' || ext === 'PPT') return 'presentation';
  return 'documents';
};
