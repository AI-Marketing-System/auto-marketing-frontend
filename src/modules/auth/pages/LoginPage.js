import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';
import '../styles/auth-feedback.css';
import Brand from '../../../public-site/components/Brand';
import SocialButton from '../components/SocialButton';
import InputField from '../components/InputField';
import { API_BASE_URL } from '../../../config/env';
import { useAuth } from '../../../context/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    const role = auth.user?.role;
    const roles = auth.user?.roles || [];
    const isAdmin = role === 'ADMIN' || roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');
    navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
  }, [auth.isAuthenticated, auth.user, navigate]);

  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [responseBody, setResponseBody] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    setResponseBody(null);

    try {
      const data = await auth.login({ email, password }, API_BASE_URL);
      setResponseBody(data);
      setFeedback({
        kind: 'success',
        title: 'Đăng nhập thành công',
        message: data?.message || 'Đăng nhập thành công.',
      });
      navigate('/dashboard');
    } catch (error) {
      setResponseBody({
        success: false,
        message: error.message,
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
        <Brand className="login-header" textClassName="brand-name" />
        <h1 className="login-title">Đăng nhập tài khoản</h1>
        <SocialButton onClick={handleFacebookLogin}>Đăng nhập với Facebook</SocialButton>
        <div className="divider">Hoặc</div>
        <form className="login-form" onSubmit={handleSubmit}>
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
          <InputField
            label="Mật khẩu"
            id="password"
            name="password"
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
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
