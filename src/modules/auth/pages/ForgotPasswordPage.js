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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [responseBody, setResponseBody] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await authApi.forgotPassword({ email }, API_BASE_URL);
      setIsSubmitted(true);
      setResponseBody(response);
      setFeedback({
        kind: 'success',
        title: 'Yêu cầu đã gửi',
        message: response?.message || 'Kiểm tra email nếu tài khoản tồn tại.',
      });
    } catch (error) {
      setResponseBody({
        success: false,
        message: error.message,
        status: error.status,
        body: error.body,
      });
      setFeedback({ kind: 'error', title: 'Gửi thất bại', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        {/* Logo & Brand Name */}
        <Brand className="forgot-header" textClassName="brand-name" />

        {isSubmitted ? (
          <div className="forgot-success-state">
            <div className="success-icon-wrapper">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2" fill="#f0fdf4" />
                <path
                  d="M8 12.5L11 15.5L16 9.5"
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="forgot-title">Kiểm tra email của bạn</h2>
            <p className="forgot-subtitle">
              Chúng tôi đã gửi liên kết đặt lại mật khẩu đến <strong>{email}</strong>. Vui lòng kiểm
              tra hộp thư của bạn.
            </p>
            <button
              type="button"
              className="btn-submit"
              onClick={() => {
                setIsSubmitted(false);
                setFeedback(null);
                setResponseBody(null);
              }}
            >
              Gửi lại yêu cầu
            </button>
          </div>
        ) : (
          <>
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
              <button type="submit" className="btn-submit">
                {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu đặt lại mật khẩu'}
              </button>
            </form>
          </>
        )}

        {feedback ? (
          <div
            className={`auth-feedback auth-feedback--${feedback.kind}`}
            style={{ marginTop: 18 }}
          >
            <div className="auth-feedback__title">{feedback.title}</div>
            <div>{feedback.message}</div>
          </div>
        ) : null}

        {responseBody ? (
          <div className="auth-response-panel" style={{ marginTop: 18 }}>
            <div className="auth-response-panel__header">
              <h2 className="auth-response-panel__title">Response</h2>
              <div className="auth-response-panel__meta">
                <span className="auth-pill">POST</span>
                <span className="auth-pill">/api/v1/auth/forgot-password</span>
              </div>
            </div>
            <pre>{JSON.stringify(responseBody, null, 2)}</pre>
          </div>
        ) : null}

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
