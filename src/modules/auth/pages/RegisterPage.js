import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/RegisterPage.css';
import '../styles/auth-feedback.css';
import RegisterLeft from '../components/RegisterLeft';
import SocialButton from '../components/SocialButton';
import InputField from '../components/InputField';
import CaptchaMockup from '../components/CaptchaMockup';
import { API_BASE_URL } from '../../../config/env';
import { authApi } from '../api/authApi';

function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [responseBody, setResponseBody] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await authApi.register({ fullName, email, password }, API_BASE_URL);
      if (response?.data?.accessToken) {
        localStorage.setItem('marqops.authLab.accessToken', response.data.accessToken);
      }
      if (response?.data?.refreshToken) {
        localStorage.setItem('marqops.authLab.refreshToken', response.data.refreshToken);
      }
      setResponseBody(response);
      setFeedback({
        kind: 'success',
        title: 'Đăng ký thành công',
        message: response?.message || 'User đã được tạo.',
      });
      navigate('/dashboard');
    } catch (error) {
      setResponseBody({
        success: false,
        message: error.message,
        status: error.status,
        body: error.body,
      });
      setFeedback({ kind: 'error', title: 'Đăng ký thất bại', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFacebookSignup = () => {
    console.log('Facebook signup clicked');
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Column 1 - Brand Info (Left) */}
        <RegisterLeft />

        {/* Column 2 - Register Form (Right) */}
        <div className="register-right">
          <h1 className="register-title">Tạo tài khoản MarqOps</h1>

          {/* Social Facebook Button */}
          <SocialButton onClick={handleFacebookSignup}>Đăng nhập với Facebook</SocialButton>

          {/* Divider */}
          <div className="divider">Hoặc</div>

          {/* Form */}
          <form className="register-form" onSubmit={handleSubmit}>
            {/* Name Field */}
            <InputField
              label="Họ và tên"
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Họ và tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

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

            {/* Cloudflare Mockup */}
            <CaptchaMockup />

            {/* Submit Button */}
            <button type="submit" className="btn-submit">
              {isSubmitting ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </form>

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
                  <span className="auth-pill">/api/v1/auth/register</span>
                </div>
              </div>
              <pre>{JSON.stringify(responseBody, null, 2)}</pre>
            </div>
          ) : null}

          {/* Footer Links */}
          <div className="register-footer">
            Đã có tài khoản?
            <Link to="/login" className="login-link">
              Đăng nhập
            </Link>
            <span style={{ margin: '0 8px' }}>·</span>
            <Link to="/auth-lab" className="login-link">
              Auth Lab
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
