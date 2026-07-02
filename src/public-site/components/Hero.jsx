import '../styles/Hero.css';

const queue = [
  { 
    time: '08:00', 
    page: 'Coffee House Fanpage', 
    avatar: 'CH', 
    avatarBg: '#ffedd5', 
    avatarColor: '#ea580c', 
    snippet: '☕️ [AI soạn] Thưởng thức ly Americano mát lạnh khởi động ngày mới tràn đầy năng lượng cùng ưu đãi giảm 20%...', 
    status: 'done' 
  },
  { 
    time: '12:30', 
    page: 'Thời Trang Boutique', 
    avatar: 'TT', 
    avatarBg: '#f3e8ff', 
    avatarColor: '#7c3aed', 
    snippet: '👗 [AI soạn] BST Mùa hè năng động với chất liệu lanh mát rượi vừa cập bến. Ghé ngay shop để thử nhé...', 
    status: 'done' 
  },
  { 
    time: '18:00', 
    page: 'Spa & Beauty Center', 
    avatar: 'SB', 
    avatarBg: '#dcfce7', 
    avatarColor: '#15803d', 
    snippet: '✨ [AI soạn] Liệu trình phục hồi da chuyên sâu bằng thảo dược giúp da căng bóng chỉ từ 199k vào khung giờ vàng...', 
    status: 'live' 
  },
  { 
    time: '21:00', 
    page: 'Du Lịch Việt Nam', 
    avatar: 'DL', 
    avatarBg: '#e0f2fe', 
    avatarColor: '#0369a1', 
    snippet: '✈️ [AI soạn] Khám phá Top 5 địa danh check-in cực hot không thể bỏ lỡ tại Đà Nẵng mùa hè này...', 
    status: 'queued' 
  },
];

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero__inner">
        <p className="eyebrow">Trợ lý AI Marketing Facebook</p>
        <h1 className="hero__title">
          Đăng đúng giờ.
          <br />
          <span>Không cần ngồi canh.</span>
        </h1>
        <p className="hero__subtitle">
          MarqOps tự động hoá việc tạo nội dung bằng AI, lên lịch thông minh và tự động đăng bài lên hàng loạt fanpage Facebook cùng lúc.
        </p>

        <div className="hero__actions">
          <a href="#pricing" className="btn btn-primary">Dùng thử miễn phí</a>
          <a href="#how-it-works" className="btn btn-ghost">Xem cách hoạt động</a>
        </div>

        {/* Signature element: Live Scheduler Feed */}
        <div className="timeline-card" aria-label="Lịch đăng bài tự động trong ngày">
          <div className="timeline-card__header">
            <div className="timeline-card__header-left">
              <span className="timeline-card__header-dot" />
              <h3>Bảng tin lập lịch đăng bài tự động</h3>
            </div>
            <span className="timeline-card__header-badge">Live Pipeline</span>
          </div>

          <div className="timeline-list">
            {queue.map((item) => (
              <div className="timeline-item" key={item.time}>
                <div className="timeline-item__left">
                  <span className={`timeline-dot timeline-dot--${item.status}`} />
                  <span className="timeline-time">{item.time}</span>
                  
                  <div className="timeline-avatar" style={{ backgroundColor: item.avatarBg, color: item.avatarColor }}>
                    {item.avatar}
                  </div>

                  <div className="timeline-details">
                    <h4 className="timeline-page">{item.page}</h4>
                    <p className="timeline-snippet">{item.snippet}</p>
                  </div>
                </div>

                <span className={`timeline-badge timeline-badge--${item.status}`}>
                  {item.status === 'done' && 'Đã đăng'}
                  {item.status === 'live' && 'Đang đăng...'}
                  {item.status === 'queued' && 'Chờ đăng'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
