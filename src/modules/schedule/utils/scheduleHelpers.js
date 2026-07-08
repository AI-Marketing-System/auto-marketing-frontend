// ─── Constants ────────────────────────────────────────────────────────────────

export const DAYS_VI = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
export const HOURS = Array.from({ length: 24 }, (_, i) => i);

// ─── Date Helpers ─────────────────────────────────────────────────────────────

/**
 * Trả về mảng 7 ngày (Thứ 2 → Chủ nhật) của tuần chứa referenceDate
 */
export function getWeekDays(referenceDate) {
  const d = new Date(referenceDate);
  const day = d.getDay(); // 0 = Chủ nhật
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day === 0 ? 7 : day) - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

/**
 * Trả về { dayName, dateStr } để hiển thị tiêu đề cột ngày
 */
export function formatDayLabel(date) {
  const dayName = DAYS_VI[date.getDay()];
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return { dayName, dateStr: `${dd}/${mm}` };
}

/**
 * Kiểm tra hai Date có cùng ngày không
 */
export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Format số giờ thành chuỗi "HH:00"
 */
export function formatHour(h) {
  return String(h).padStart(2, '0') + ':00';
}

/**
 * Tỷ lệ phần trăm vị trí thời gian hiện tại trong ngày (0–1)
 */
export function getCurrentTimePercent() {
  const now = new Date();
  return (now.getHours() * 60 + now.getMinutes()) / (24 * 60);
}

// ─── Mock Data Generator ──────────────────────────────────────────────────────

const MOCK_PLATFORMS = ['Facebook', 'Instagram', 'TikTok'];
const MOCK_COLORS = ['#7c3aed', '#10b981', '#ef4444', '#f59e0b', '#3b82f6'];
const MOCK_TITLES = [
  'Super sale mùa hè',
  'Bài viết mới',
  'Khuyến mãi đặc biệt',
  'Ra mắt sản phẩm',
  'Sự kiện cuối tuần',
  'Flash sale 50%',
  'Giới thiệu menu mới',
  'Chương trình tích điểm',
];

/**
 * Sinh dữ liệu bài đăng mẫu cho một tuần
 */
export function generateMockPosts(weekDays) {
  const posts = [];
  let id = 1;

  weekDays.forEach((_, dayIdx) => {
    const count = Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      posts.push({
        id: id++,
        dayIdx,
        hour: Math.floor(Math.random() * 18) + 5,
        minute: Math.floor(Math.random() * 60),
        title: MOCK_TITLES[Math.floor(Math.random() * MOCK_TITLES.length)],
        platform: MOCK_PLATFORMS[Math.floor(Math.random() * MOCK_PLATFORMS.length)],
        color: MOCK_COLORS[Math.floor(Math.random() * MOCK_COLORS.length)],
        image: null,
      });
    }
  });

  return posts;
}
