import '../styles/Hero.css';

const queue = [
  { time: '08:00', page: 'Fanpage Quán Cafe', status: 'done' },
  { time: '12:30', page: 'Fanpage Thời Trang', status: 'done' },
  { time: '18:00', page: 'Fanpage Spa & Beauty', status: 'live' },
  { time: '21:00', page: 'Fanpage Du Lịch', status: 'queued' },
];

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero__inner">
        <p className="eyebrow">Tự động đăng bài Facebook</p>
        <h1 className="hero__title">
          Đăng đúng giờ.
          <br />
          Không cần ngồi canh.
        </h1>
        <p className="hero__subtitle">
          MarqOps soạn nội dung bằng AI, lên lịch và tự động đăng lên nhiều
          fanpage Facebook cùng lúc — bạn chỉ cần duyệt bài, phần còn lại để
          hệ thống lo.
        </p>

        <div className="hero__actions">
          <a href="#cta" className="btn btn-primary">Dùng thử miễn phí</a>
          <a href="#how-it-works" className="btn btn-ghost">Xem cách hoạt động</a>
        </div>

        {/* Signature element: live posting timeline */}
        <div className="timeline" aria-label="Lịch đăng bài trong ngày">
          <div className="timeline__line" />
          {queue.map((item) => (
            <div className="timeline__item" key={item.time}>
              <span className={`timeline__dot timeline__dot--${item.status}`} />
              <span className="timeline__time">{item.time}</span>
              <span className="timeline__page">{item.page}</span>
              <span className={`timeline__badge timeline__badge--${item.status}`}>
                {item.status === 'done' && 'Đã đăng'}
                {item.status === 'live' && 'Đang đăng'}
                {item.status === 'queued' && 'Chờ đăng'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
