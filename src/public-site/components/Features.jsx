import '../styles/Features.css';

const features = [
  {
    title: 'Soạn nội dung bằng AI',
    desc: 'Nhập chủ đề, AI viết bài, gợi ý hashtag và đề xuất ảnh minh hoạ trong vài giây.',
  },
  {
    title: 'Lên lịch đăng hàng loạt',
    desc: 'Sắp xếp hàng chục bài viết theo khung giờ tối ưu cho nhiều chiến dịch khác nhau.',
  },
  {
    title: 'Quản lý nhiều fanpage',
    desc: 'Kết nối và đăng đồng thời lên nhiều fanpage Facebook từ một nơi duy nhất.',
  },
  {
    title: 'Theo dõi hiệu quả',
    desc: 'Xem lượt thích, bình luận, chia sẻ và lượt tiếp cận ngay sau khi bài viết lên sóng.',
  },
];

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="container">
        <p className="eyebrow">Tính năng</p>
        <h2 className="features__title">Mọi thứ để vận hành fanpage gọn trong một tab</h2>

        <div className="features__grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
