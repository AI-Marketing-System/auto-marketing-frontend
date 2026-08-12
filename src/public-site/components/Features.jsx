import '../styles/Features.css';

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    ),
    title: 'Soạn nội dung bằng AI',
    desc: 'Chỉ cần nhập chủ đề ngắn, AI tự động lên dàn ý, viết bài chi tiết, chèn hashtag xu hướng và gợi ý hình ảnh minh hoạ chỉ trong vài giây.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
      </svg>
    ),
    title: 'Lên lịch đăng hàng loạt',
    desc: 'Lên lịch sẵn cho hàng chục, hàng trăm bài viết theo khung giờ vàng tương tác cao, giúp duy trì tuần suất đăng bài đều đặn.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
    title: 'Quản lý nhiều Fanpage',
    desc: 'Kết nối không giới hạn và xuất bản chéo nội dung lên nhiều Fanpage Facebook khác nhau cùng lúc chỉ qua một bảng điều khiển tập trung.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" x2="18" y1="20" y2="10" />
        <line x1="12" x2="12" y1="20" y2="4" />
        <line x1="6" x2="6" y1="20" y2="14" />
        <path d="M3 20h18" />
      </svg>
    ),
    title: 'Theo dõi hiệu quả',
    desc: 'Thu thập thời gian thực các chỉ số quan trọng như lượt tiếp cận, tương tác, like, share để tối ưu hoá nội dung cho các chiến dịch tiếp theo.',
  },
];

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="container">
        <p className="eyebrow">Tính năng nổi bật</p>
        <h2 className="features__title">Vận hành Fanpage thông minh hơn nhờ AI</h2>

        <div className="features__grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-card__icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
