import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../../config/env';
import '../styles/SubscriptionModule.css';

export default function UpgradeModal({ isOpen, onClose, onUpgradeSuccess, currentSubscription }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [checkoutIsTrial, setCheckoutIsTrial] = useState(false);
  const [checkoutIsRenew, setCheckoutIsRenew] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("QR");
  const [paymentTx, setPaymentTx] = useState(null);
  const [confirming, setConfirming] = useState(false);

  // States quản lý cập nhật địa chỉ lập hóa đơn ở FE
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [billingName, setBillingName] = useState('Kiệt Nguyễn Gia');
  const [billingStreet, setBillingStreet] = useState('Ngũ Hành Sơn, Đà Nẵng');
  const [billingCityZip, setBillingCityZip] = useState('Đà Nẵng 550000 VN');

  const token = localStorage.getItem('marqops.authLab.accessToken');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setPaymentTx(null);
    setCheckoutPlan(null);
    setCheckoutIsRenew(false);

    fetch(`${API_BASE_URL}/plans`)
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson && resJson.success && Array.isArray(resJson.data)) {
          const sortedPlans = [...resJson.data].sort((a, b) => a.price - b.price);
          setPlans(sortedPlans);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi tải plans:', err);
        setLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const getPlanFeatures = (planName) => {
    const name = planName.toLowerCase();
    if (name === 'starter') {
      return [
        'Tối đa 5 Workspace quản lý chiến dịch',
        'Kết nối 3 tài khoản mạng xã hội đồng thời',
        '5,000 từ khóa AI tạo content hàng tháng',
        'Hỗ trợ qua Email trong 24h',
      ];
    } else if (name === 'pro') {
      return [
        'Phản hồi AI thông minh hơn, nhanh hơn',
        'Tối đa 15 Workspace làm việc nhóm',
        'Kết nối 10 tài khoản mạng xã hội đa nền tảng',
        '50,000 từ khóa AI và phân tích đối thủ',
        'Thêm bộ nhớ ngữ cảnh thương hiệu nâng cao',
      ];
    } else if (name === 'business') {
      return [
        'Tất cả tính năng cao cấp của gói Pro',
        'Tối đa 99 Workspace cho doanh nghiệp lớn',
        'Không giới hạn tài khoản mạng xã hội',
        '500,000 từ khóa AI tạo nội dung tự động',
        'Hỗ trợ kỹ thuật 24/7 ưu tiên riêng biệt',
      ];
    }
    return ['Tính năng cơ bản của hệ thống'];
  };

  const handleGoToCheckout = (plan, isTrial, isRenew = false) => {
    if (!token) {
      alert('Vui lòng đăng nhập để thực hiện giao dịch.');
      return;
    }
    setCheckoutPlan(plan);
    setCheckoutIsTrial(isTrial);
    setCheckoutIsRenew(isRenew);
  };

  const handleRegisterSubscription = async () => {
    const payload = {
      planId: checkoutPlan.id,
      trial: checkoutIsTrial,
    };

    if (!checkoutIsTrial) {
      payload.paymentMethod = paymentMethod;
    }

    try {
      const url = checkoutIsRenew
        ? `${API_BASE_URL}/subscriptions/${currentSubscription.id}`
        : `${API_BASE_URL}/subscriptions`;
      const method = checkoutIsRenew ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(checkoutIsRenew ? { paymentMethod } : payload),
      });

      const resJson = await response.json();

      if (!response.ok) {
        throw new Error(resJson.message || 'Giao dịch thất bại.');
      }

      if (checkoutIsTrial) {
        alert(`Kích hoạt thành công gói dùng thử ${checkoutPlan.name} trong 14 ngày!`);
        onUpgradeSuccess();
        onClose();
      } else {
        if (resJson.data && resJson.data.paymentUrl) {
          window.location.href = resJson.data.paymentUrl;
        } else {
          setPaymentTx({
            transactionId: resJson.data.id,
            amount: checkoutPlan.price,
            planName: checkoutPlan.name,
          });
        }
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleConfirmPayment = async () => {
    if (!paymentTx) return;
    setConfirming(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/subscriptions/${paymentTx.transactionId}/confirm`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const resJson = await response.json();

      if (!response.ok) {
        throw new Error(resJson.message || 'Xác nhận thanh toán thất bại.');
      }

      alert(`Thanh toán thành công! Gói ${paymentTx.planName} của bạn đã được kích hoạt.`);
      onUpgradeSuccess();
      onClose();
    } catch (error) {
      alert(error.message);
    } finally {
      setConfirming(false);
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="modal-overlay">
      <div className="upgrade-modal-card">
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>

        {/* PHÂN CẢNH 1: BẢNG GIÁ (CHỌN GÓI DỊCH VỤ) */}
        {!checkoutPlan && (
          <>
            <h2 className="modal-title">Nâng cấp gói dịch vụ</h2>
            <p className="modal-subtitle">
              Mở rộng giới hạn, tiếp cận AI thông minh hơn để bứt phá chiến dịch của bạn.
            </p>

            {loading ? (
              <div className="modal-loading">Đang tải danh sách gói...</div>
            ) : (
              <div className="plans-grid">
                {plans.map((plan) => {
                  const isActive =
                    currentSubscription && currentSubscription.planName === plan.name;
                  const isFree = plan.price === 0;
                  const isStarter = plan.name.toLowerCase() === 'starter';
                  const isLowerPlan =
                    currentSubscription && currentSubscription.planPrice > plan.price;

                  return (
                    <div
                      key={plan.id}
                      className={`plan-card-item ${isActive ? 'active-plan' : ''}`}
                    >
                      {isStarter && !currentSubscription?.isTrial && (
                        <div className="starter-badge">🎁 CÓ GÓI DÙNG THỬ</div>
                      )}
                      <h3 className="plan-name-txt">{plan.name}</h3>
                      <div className="plan-price-txt">{formatPrice(plan.price)}</div>
                      <p className="plan-desc-txt">{plan.description}</p>

                      <div className="plan-btn-container">
                        {isActive ? (
                          isFree ? (
                            <button className="upgrade-btn disabled-btn" disabled>
                              Gói mặc định
                            </button>
                          ) : currentSubscription.isTrial ? (
                            <button
                              className="upgrade-btn buy-btn"
                              onClick={() => handleGoToCheckout(plan, false, false)}
                            >
                              Nâng cấp gói
                            </button>
                          ) : (
                            <button
                              className="upgrade-btn buy-btn"
                              onClick={() => handleGoToCheckout(plan, false, true)}
                            >
                              Gia hạn gói
                            </button>
                          )
                        ) : isFree ? (
                          <button className="upgrade-btn disabled-btn" disabled>
                            Gói mặc định
                          </button>
                        ) : isLowerPlan ? (
                          <button className="upgrade-btn disabled-btn" disabled>
                            Gói thấp hơn
                          </button>
                        ) : (
                          <div className="plan-actions-stack">
                            {isStarter && !currentSubscription?.isTrial && (
                              <button
                                className="upgrade-btn trial-btn"
                                onClick={() => handleGoToCheckout(plan, true)}
                              >
                                Dùng thử 14 ngày
                              </button>
                            )}
                            <button
                              className="upgrade-btn buy-btn"
                              onClick={() => handleGoToCheckout(plan, false)}
                            >
                              Nâng cấp gói
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* PHÂN CẢNH 2: MÀN HÌNH ĐỊNH CẤU HÌNH GÓI ĐĂNG KÝ (2 CỘT CHATGPT PLUS STYLE) */}
        {checkoutPlan && !paymentTx && (
          <div className="checkout-split-container">
            <div className="checkout-back-header" onClick={() => setCheckoutPlan(null)}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              <span>Định cấu hình gói đăng ký của bạn</span>
            </div>

            <div className="checkout-split-layout">
              <div className="checkout-left-col">
                <div className="checkout-section-box">
                  <h4 className="checkout-section-title">Phương thức thanh toán</h4>

                  {checkoutIsTrial ? (
                    <div className="trial-payment-hint">
                      🎁 Gói dùng thử 14 ngày hoàn toàn miễn phí ($0). Không yêu cầu phương thức
                      thanh toán.
                    </div>
                  ) : (
                    <>
                      <div className="payment-options-grid">
                        <div
                          className={`payment-opt-card ${paymentMethod === "QR" ? "selected" : ""}`}
                          onClick={() => setPaymentMethod("QR")}
                        >
                          <span className="pay-opt-icon">📷</span>
                          <span className="pay-opt-label">Mã VietQR</span>
                        </div>
                        <div
                          className={`payment-opt-card ${paymentMethod === "MOMO" ? "selected" : ""}`}
                          onClick={() => setPaymentMethod("MOMO")}
                        >
                          <span className="pay-opt-icon">📱</span>
                          <span className="pay-opt-label">Ví MoMo</span>
                        </div>
                        <div
                          className={`payment-opt-card ${paymentMethod === 'VNPAY' ? 'selected' : ''}`}
                          onClick={() => setPaymentMethod('VNPAY')}
                        >
                          <span className="pay-opt-icon">🏦</span>
                          <span className="pay-opt-label">Cổng VNPAY</span>
                        </div>
                        <div
                          className={`payment-opt-card ${paymentMethod === 'STRIPE' ? 'selected' : ''}`}
                          onClick={() => setPaymentMethod('STRIPE')}
                        >
                          <span className="pay-opt-icon">💳</span>
                          <span className="pay-opt-label">Thẻ Stripe</span>
                        </div>
                      </div>

                      {paymentMethod === "QR" && (
                        <div className="payment-detail-card">
                          <span className="vietqr-logo-mini">VietQR</span>
                          <div className="momo-detail-info">
                            <strong>Chuyển khoản nhanh qua VietQR</strong>
                            <span>Quét mã QR từ mọi ứng dụng ngân hàng di động</span>
                          </div>
                        </div>
                      )}

                      {paymentMethod === "MOMO" && (
                        <div className="payment-detail-card">
                          <span className="momo-logo-mini">MoMo</span>
                          <div className="momo-detail-info">
                            <strong>Ví điện tử MoMo cá nhân</strong>
                            <span>Thanh toán quét mã QR cực nhanh và an toàn</span>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'VNPAY' && (
                        <div className="payment-detail-card">
                          <span className="vnpay-logo-mini">VNPAY</span>
                          <div className="momo-detail-info">
                            <strong>Cổng thanh toán điện tử VNPAY</strong>
                            <span>Quét QR từ hơn 40 ứng dụng Mobile Banking ngân hàng</span>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'STRIPE' && (
                        <div className="payment-detail-card">
                          <span className="visa-logo-mini">STRIPE</span>
                          <div className="momo-detail-info">
                            <strong>Thẻ tín dụng Quốc tế qua cổng Stripe</strong>
                            <span>Hỗ trợ thẻ Visa, MasterCard, JCB bảo mật cao</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {!checkoutIsTrial && paymentMethod === 'STRIPE' && (
                  <div className="checkout-section-box">
                    <h4 className="checkout-section-title">Địa chỉ lập hóa đơn</h4>
                    {isEditingAddress ? (
                      <div className="billing-address-edit-form">
                        <input
                          type="text"
                          className="billing-edit-input"
                          value={billingName}
                          onChange={(e) => setBillingName(e.target.value)}
                          placeholder="Họ và tên"
                        />
                        <input
                          type="text"
                          className="billing-edit-input"
                          value={billingStreet}
                          onChange={(e) => setBillingStreet(e.target.value)}
                          placeholder="Địa chỉ nhà / Đường phố"
                        />
                        <input
                          type="text"
                          className="billing-edit-input"
                          value={billingCityZip}
                          onChange={(e) => setBillingCityZip(e.target.value)}
                          placeholder="Thành phố, Tỉnh, Mã Zip"
                        />
                        <div className="billing-edit-actions">
                          <button
                            className="btn-save-address"
                            onClick={() => setIsEditingAddress(false)}
                          >
                            Lưu lại
                          </button>
                          <button
                            className="btn-cancel-address"
                            onClick={() => setIsEditingAddress(false)}
                          >
                            Hủy bỏ
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="billing-address-card">
                        <div className="billing-address-details">
                          <strong>{billingName}</strong>
                          <span>{billingStreet}</span>
                          <span>{billingCityZip}</span>
                        </div>
                        <button
                          className="btn-update-address"
                          onClick={() => setIsEditingAddress(true)}
                        >
                          Cập nhật
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="checkout-right-col">
                <div className="order-summary-box">
                  <h3 className="summary-plan-title">Gói {checkoutPlan.name}</h3>

                  <div className="summary-features-label">Các tính năng hàng đầu</div>
                  <ul className="summary-features-list">
                    {getPlanFeatures(checkoutPlan.name).map((feat, idx) => (
                      <li key={idx} className="summary-feat-item">
                        <svg
                          className="feat-bolt-icon"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="price-breakdown-divider"></div>

                  <div className="price-row">
                    <span>Gói đăng ký Hàng tháng</span>
                    <span>
                      {checkoutIsTrial ? formatPrice(0) : formatPrice(checkoutPlan.price * 0.9)}
                    </span>
                  </div>
                  <div className="price-row">
                    <span>Thuế VAT (10%)</span>
                    <span>
                      {checkoutIsTrial ? formatPrice(0) : formatPrice(checkoutPlan.price * 0.1)}
                    </span>
                  </div>

                  <div className="total-divider"></div>

                  <div className="price-row total-row">
                    <span>Đến hạn hôm nay</span>
                    <span className="total-amount-txt">
                      {checkoutIsTrial ? formatPrice(0) : formatPrice(checkoutPlan.price)}
                    </span>
                  </div>

                  <button className="btn-checkout-submit" onClick={handleRegisterSubscription}>
                    {checkoutIsTrial
                      ? 'Kích hoạt dùng thử'
                      : checkoutIsRenew
                        ? 'Xác nhận gia hạn'
                        : 'Đăng ký'}
                  </button>
                </div>

                <p className="checkout-policy-text">
                  Gia hạn hàng tháng cho đến khi hủy. Sẽ tính phí{' '}
                  {checkoutIsTrial
                    ? formatPrice(checkoutPlan.price)
                    : formatPrice(checkoutPlan.price)}
                  /tháng sau khi hết hạn. Hủy bất cứ lúc nào trong phần Cài đặt. Khi đăng ký, bạn
                  đồng ý với Điều khoản sử dụng.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PHÂN CẢNH 3: GIAO DIỆN QUÉT MÃ QR THANH TOÁN */}
        {paymentTx && (
          <div className="payment-qr-container">
            <h2 className="modal-title">Quét mã QR để thanh toán</h2>
            <p className="payment-guide">
              Mã giao dịch: <strong>#{paymentTx.transactionId}</strong>. Vui lòng quét mã QR dưới
              đây bằng ứng dụng MoMo để thanh toán <strong>{formatPrice(paymentTx.amount)}</strong>.
            </p>

            <div className="qr-image-wrapper">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=MoMoPaidDemo_Tx_${paymentTx.transactionId}`}
                alt="QR Code thanh toan MoMo"
                className="qr-img"
              />
              <span className="qr-brand-label">MoMo Scan</span>
            </div>

            <p className="sandbox-hint">
              * Đây là môi trường thử nghiệm (Sandbox). Bạn nhấn vào nút bên dưới để hoàn tất việc
              xác nhận nhận tiền từ cổng thanh toán.
            </p>

            <div className="payment-actions">
              <button
                className="btn-pay-confirm"
                onClick={handleConfirmPayment}
                disabled={confirming}
              >
                {confirming ? 'Đang xác nhận...' : 'Tôi đã thanh toán thành công'}
              </button>
              <button className="btn-pay-cancel" onClick={() => setPaymentTx(null)}>
                Quay lại
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
