import '../styles/CTA.css';

export default function CTA() {
  return (
    <section className="cta" id="cta">
      <div className="container cta__inner">
        <h2 className="cta__title">Ngừng đăng bài thủ công từ hôm nay</h2>
        <p className="cta__subtitle">
          Dùng thử miễn phí 14 ngày — không cần thẻ thanh toán.
        </p>
        <div className="cta__actions">
          <a href="#signup" className="btn btn-primary">Dùng thử miễn phí</a>
          <a href="#contact" className="btn btn-ghost">Liên hệ tư vấn</a>
        </div>
      </div>
    </section>
  );
}
