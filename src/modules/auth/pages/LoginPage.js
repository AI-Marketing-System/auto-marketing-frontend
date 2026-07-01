import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';
import '../styles/auth-feedback.css';
import Brand from '../../../public-site/components/Brand';
import SocialButton from '../components/SocialButton';
import InputField from '../components/InputField';
import { API_BASE_URL } from '../../../config/env';
import { authApi } from '../api/authApi';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [responseBody, setResponseBody] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await authApi.login({ email, password }, API_BASE_URL);
      if (response?.data?.accessToken) {
        localStorage.setItem('marqops.authLab.accessToken', response.data.accessToken);
      }
      if (response?.data?.refreshToken) {
        localStorage.setItem('marqops.authLab.refreshToken', response.data.refreshToken);
      }
      setResponseBody(response);
      setFeedback({
        kind: 'success',
        title: 'Đăng nhập thành công',
        message: response?.message || 'Backend trả về token hợp lệ.',
      });
      navigate('/dashboard');
    } catch (error) {
      setResponseBody({
        success: false,
        message: error.message,
        status: error.status,
        body: error.body,
      });
      setFeedback({ kind: 'error', title: 'Đăng nhập thất bại', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFacebookLogin = () => {
    console.log('Facebook login clicked');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo & Brand Name */}
        <Brand className="login-header" textClassName="brand-name" />

        {/* Form Title */}
        <h1 className="login-title">Đăng nhập tài khoản</h1>

        {/* Social Facebook Login */}
        <SocialButton onClick={handleFacebookLogin}>Đăng nhập với Facebook</SocialButton>

        {/* Divider */}
        <div className="divider">Hoặc</div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {/* Email Field */}
          <InputField
            label="Email"
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password Field */}
          <InputField
            label="Mật khẩu"
            id="password"
            name="password"
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Remember me & Forgot password */}
          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                className="remember-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Giữ đăng nhập</span>
            </label>
            <Link to="/forgot-password" className="forgot-password-link">
              Quên mật khẩu?
            </Link>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-submit">
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {feedback ? (
          <div className={`auth-feedback auth-feedback--${feedback.kind}`}>
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
                <span className="auth-pill">/api/v1/auth/login</span>
              </div>
            </div>
            <pre>{JSON.stringify(responseBody, null, 2)}</pre>
          </div>
        ) : null}

        {/* Footer Signup Link */}
        <div className="login-footer">
          Chưa có tài khoản?
          <Link to="/register" className="signup-link">
            Đăng ký
          </Link>
          <span style={{ margin: '0 8px' }}>·</span>
          <Link to="/auth-lab" className="signup-link">
            Auth Lab
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
