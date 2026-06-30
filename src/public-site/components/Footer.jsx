import '../styles/Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="container footer__inner">
          {/* Brand Section */}
          <div className="footer__brand">
            <a href="#top" className="footer__logo">
              <span className="footer__logo-dot" />
              MarqOps
            </a>
            <p className="footer__tagline">Tự động hoá social media. Dành thời gian làm những điều bạn thích!</p>
            <div className="footer__social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer__social-link">
                Facebook
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer__social-link">
                Twitter
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer__social-link">
                Instagram
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="footer__columns">
            <div className="footer__column">
              <h4 className="footer__column-title">Sản phẩm</h4>
              <ul className="footer__links">
                <li><a href="#features">Tính năng</a></li>
                <li><a href="#pricing">Bảng giá</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#blog">Blog</a></li>
              </ul>
            </div>

            <div className="footer__column">
              <h4 className="footer__column-title">Công ty</h4>
              <ul className="footer__links">
                <li><a href="#about">Về chúng tôi</a></li>
                <li><a href="#contact">Liên hệ</a></li>
                <li><a href="#careers">Tuyển dụng</a></li>
                <li><a href="#press">Báo chí</a></li>
              </ul>
            </div>

            <div className="footer__column">
              <h4 className="footer__column-title">Hỗ trợ</h4>
              <ul className="footer__links">
                <li><a href="#docs">Tài liệu</a></li>
                <li><a href="#help">Trung tâm trợ giúp</a></li>
                <li><a href="#status">Trạng thái hệ thống</a></li>
                <li><a href="#contact">Liên hệ hỗ trợ</a></li>
              </ul>
            </div>

            <div className="footer__column">
              <h4 className="footer__column-title">Pháp lý</h4>
              <ul className="footer__links">
                <li><a href="#privacy">Chính sách bảo mật</a></li>
                <li><a href="#terms">Điều khoản dịch vụ</a></li>
                <li><a href="#cookies">Cookies</a></li>
                <li><a href="#gdpr">GDPR</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer__bottom">
          <div className="container footer__bottom-inner">
            <p className="footer__copy">© {new Date().getFullYear()} MarqOps. Tất cả quyền được bảo lưu.</p>
            <div className="footer__badges">
              <span className="footer__badge">Được xây dựng ở Việt Nam 🇻🇳</span>
              <span className="footer__badge">Bảo mật cấp doanh nghiệp</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
