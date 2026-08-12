import { useEffect, useState } from "react";
import "../styles/Pricing.css";

export default function Pricing() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/v1/plans")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Không thể tải bảng giá từ máy chủ.");
        }
        return res.json();
      })
      .then((resJson) => {
        if (resJson && resJson.success && Array.isArray(resJson.data)) {
          // Sắp xếp các gói theo giá tăng dần
          const sortedPlans = [...resJson.data].sort((a, b) => a.price - b.price);
          setPlans(sortedPlans);
        } else {
          throw new Error("Dữ liệu phản hồi không hợp lệ từ máy chủ.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy thông tin gói dịch vụ:", err);
        setError(err.message || "Không thể kết nối đến máy chủ.");
        setLoading(false);
      });
  }, []);

  const formatPrice = (price) => {
    if (price === 0) return "Miễn phí";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price).replace("₫", "đ");
  };

  return (
    <section className="pricing" id="pricing">
      <div className="container pricing__inner">
        <div className="pricing__header">
          <p className="eyebrow">Bảng giá</p>
          <h2 className="pricing__title">Chọn gói dịch vụ phù hợp</h2>
          <p className="pricing__subtitle">
            Giá cả minh bạch, không phí ẩn. Phù hợp cho cả cá nhân và doanh nghiệp.
          </p>
        </div>

        {loading && (
          <div className="pricing__loading">
            <p>Đang tải bảng giá dịch vụ...</p>
          </div>
        )}

        {error && (
          <div className="pricing__error">
            <p style={{ fontWeight: "bold" }}>Lỗi: {error}</p>
            <p style={{ fontSize: "13px", marginTop: "8px" }}>
              Vui lòng đảm bảo rằng ứng dụng backend đang chạy bình thường tại cổng 8080.
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="pricing__grid">
            {plans.map((plan) => {
              // Highlight gói Pro làm gói phổ biến nhất
              const isPopular = plan.name.toLowerCase() === "pro";
              return (
                <div
                  key={plan.id}
                  className={`pricing-card ${isPopular ? "pricing-card--popular" : ""}`}
                >
                  {isPopular && (
                    <div className="pricing-card__badge">Phổ biến nhất</div>
                  )}
                  <h3 className="pricing-card__name">{plan.name}</h3>
                  <p className="pricing-card__desc">{plan.description}</p>
                  
                  <div className="pricing-card__price-box">
                    <span className="pricing-card__price">
                      {formatPrice(plan.price)}
                    </span>
                    {plan.price > 0 && (
                      <span className="pricing-card__period">
                        / {plan.billingCycleDays} ngày
                      </span>
                    )}
                  </div>

                  <ul className="pricing-card__features">
                    <li className="pricing-card__feature">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Tối đa: <strong>{plan.maxWorkspaces}</strong> workspace</span>
                    </li>
                    <li className="pricing-card__feature">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Tối đa: <strong>{plan.maxSocialAccounts}</strong> tài khoản MXH</span>
                    </li>
                    <li className="pricing-card__feature">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Giới hạn: <strong>{plan.aiTokenLimit.toLocaleString()}</strong> từ khóa AI</span>
                    </li>
                  </ul>

                  <a
                    href={`/register?plan=${plan.id}`}
                    className={`btn ${isPopular ? "btn-primary" : "btn-ghost"} pricing-card__btn`}
                  >
                    Bắt đầu ngay
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
