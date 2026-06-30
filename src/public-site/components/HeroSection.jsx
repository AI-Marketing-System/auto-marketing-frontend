import "./HeroSection.css";

function HeroSection() {
    return (
        <section className="hero">
            <div className="hero-left">
        <span className="hero-badge">
          🚀 Auto Marketing Platform
        </span>

                <h1>
                    Tự động hóa đăng bài Facebook bằng AI
                </h1>

                <p>
                    Quản lý nhiều Fanpage, tạo nội dung bằng AI,
                    lên lịch đăng bài và theo dõi hiệu quả chỉ
                    trên một nền tảng.
                </p>

                <div className="hero-actions">
                    <button className="btn-primary">
                        Dùng thử miễn phí
                    </button>

                    <button className="btn-secondary">
                        Xem Demo
                    </button>
                </div>
            </div>

            <div className="hero-right">
                <div className="dashboard-preview">
                    Dashboard Preview
                </div>
            </div>
        </section>
    );
}

export default HeroSection;