import '../styles/HowItWorks.css';

const steps = [
  {
    n: '01',
    title: 'Kết nối fanpage',
    desc: 'Liên kết một hoặc nhiều fanpage Facebook chỉ với một lần xác thực.',
  },
  {
    n: '02',
    title: 'Tạo & lên lịch bài viết',
    desc: 'Soạn nội dung, chọn fanpage đích và đặt thời gian đăng mong muốn.',
  },
  {
    n: '03',
    title: 'Theo dõi kết quả',
    desc: 'MarqOps tự động đăng đúng giờ và tổng hợp số liệu tương tác cho bạn.',
  },
];

export default function HowItWorks() {
  return (
    <section className="how" id="how-it-works">
      <div className="container">
        <p className="eyebrow">Cách hoạt động</p>
        <h2 className="how__title">Ba bước, không cần kỹ thuật</h2>

        <div className="how__steps">
          {steps.map((s) => (
            <div className="how__step" key={s.n}>
              <span className="how__step-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
