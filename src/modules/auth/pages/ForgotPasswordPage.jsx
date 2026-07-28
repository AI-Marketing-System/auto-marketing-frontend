import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/ForgotPasswordPage.css';
import '../styles/auth-feedback.css';
import Brand from '../../../public-site/components/Brand';
import InputField from '../components/InputField';
import { API_BASE_URL } from '../../../config/env';
import { authApi } from '../api/authApi';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popup, setPopup] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await authApi.forgotPassword({ email }, API_BASE_URL);
      setPopup({
        kind: 'success',
        title: 'Kiểm tra email của bạn',
        message: response?.message || `Chúng tôi đã gửi liên kết đặt lại mật khẩu đến ${email}. Vui lòng kiểm tra hộp thư.`,
      });
    } catch (error) {
      setPopup({
        kind: 'error',
        title: 'Gửi thất bại',
        message: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        {/* Logo & Brand Name */}
        <Brand className="forgot-header" textClassName="brand-name" />

        {/* Form Title */}
        <h1 className="forgot-title">Quên mật khẩu?</h1>
        <p className="forgot-subtitle">
          Nhập địa chỉ email đăng ký của bạn. Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
        </p>

        {/* Forgot Password Form */}
        <form className="forgot-form" onSubmit={handleSubmit}>
          {/* Email Field */}
          <InputField
            label="Email đăng ký"
            id="email"
            name="email"
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Submit Button */}
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu đặt lại mật khẩu'}
          </button>
        </form>

        {/* Popup Modal */}
        {popup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <div className={`popup-icon ${popup.kind}`}>
                {popup.kind === 'success' ? (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2" fill="#f0fdf4" />
                    <path d="M8 12.5L11 15.5L16 9.5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" fill="#fef2f2" />
                    <path d="M15 9L9 15M9 9L15 15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <h2 className="popup-title">{popup.title}</h2>
              <p className="popup-message">{popup.message}</p>
              <button
                type="button"
                className={`btn-submit popup-btn popup-btn-${popup.kind}`}
                onClick={() => {
                  setPopup(null);
                  if (popup.kind === 'success') {
                    setEmail('');
                  }
                }}
              >
                Đã hiểu
              </button>
            </div>
          </div>
        )}

        {/* Footer Back Link */}
        <div className="forgot-footer">
          Có thắc mắc hoặc muốn quay lại?
          <Link to="/login" className="back-login-link">
            Đăng nhập
          </Link>
          <span style={{ margin: '0 8px' }}>·</span>
          <Link to="/auth-lab" className="back-login-link">
            Auth Lab
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
