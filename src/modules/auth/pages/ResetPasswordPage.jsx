import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import '../styles/ResetPasswordPage.css';
import '../styles/auth-feedback.css';
import Brand from '../../../public-site/components/Brand';
import InputField from '../components/InputField';
import { API_BASE_URL } from '../../../config/env';
import { authApi } from '../api/authApi';
import { useAuth } from '../../../context/AuthContext';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const { setTokens } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setFeedback({ kind: 'error', title: 'Lỗi xác nhận', message: 'Mật khẩu xác nhận không khớp.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await authApi.forgotPassword({ newPassword: password, confirmPassword: confirmPassword, token: tokenFromUrl }, API_BASE_URL);
      
      // Xóa token ở Frontend để đảm bảo UX sạch sẽ
      setTokens(null, null);

      setIsSubmitted(true);

      setFeedback({
        kind: 'success',
        title: 'Đặt lại thành công',
        message: response?.message || 'Mật khẩu của bạn đã được cập nhật thành công.',
      });
    } catch (error) {

      setFeedback({ kind: 'error', title: 'Thất bại', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        {/* Logo & Brand Name */}
        <Brand className="reset-header" textClassName="brand-name" />

        {isSubmitted ? (
          <div className="reset-success-state">
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
            <h2 className="reset-title">Đặt lại mật khẩu thành công</h2>
            <p className="reset-subtitle">
              Mật khẩu của bạn đã được thay đổi. Bạn có thể đăng nhập bằng mật khẩu mới.
            </p>
            <Link to="/login" style={{ textDecoration: 'none', width: '100%' }}>
              <button type="button" className="btn-submit">
                Đăng nhập ngay
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Form Title */}
            <h1 className="reset-title">Đặt lại mật khẩu</h1>
            <p className="reset-subtitle">
              Vui lòng nhập mật khẩu mới để tiếp tục.
            </p>

            {/* Reset Password Form */}
            <form className="reset-form" onSubmit={handleSubmit}>


              <InputField
                label="Mật khẩu mới"
                id="password"
                name="password"
                type="password"
                placeholder="Nhập mật khẩu mới"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <InputField
                label="Xác nhận mật khẩu mới"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />



              {/* Submit Button */}
              <button type="submit" className="btn-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
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



        {/* Footer Back Link */}
        <div className="reset-footer">
          Quay lại trang
          <Link to="/login" className="back-login-link">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
