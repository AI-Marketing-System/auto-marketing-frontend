import { useEffect, useState } from 'react';
import Brand from '../../../public-site/components/Brand';
import { API_BASE_URL, APP_NAME } from '../../../config/env';
import { authApi } from '../api/authApi';
import '../styles/auth-feedback.css';
import '../styles/AuthApiLabPage.css';

const TAB_CONFIG = {
  register: {
    label: 'Register',
    method: 'POST',
    endpoint: '/api/v1/auth/register',
  },
  login: {
    label: 'Login',
    method: 'POST',
    endpoint: '/api/v1/auth/login',
  },
  forgot: {
    label: 'Forgot Password',
    method: 'POST',
    endpoint: '/api/v1/auth/forgot-password',
  },
  reset: {
    label: 'Reset Password',
    method: 'POST',
    endpoint: '/api/v1/auth/reset-password',
  },
};

const DEFAULT_FORMS = {
  register: { fullName: '', email: '', password: '' },
  login: { email: '', password: '', rememberMe: true },
  forgot: { email: '' },
  reset: { token: '', newPassword: '' },
};

const STORAGE_KEY = 'marqops.authLab.apiBaseUrl';
const TOKEN_KEYS = {
  accessToken: 'marqops.authLab.accessToken',
  refreshToken: 'marqops.authLab.refreshToken',
};

function AuthApiLabPage() {
  const [activeTab, setActiveTab] = useState('register');
  const [apiBaseUrl, setApiBaseUrl] = useState(
    () => localStorage.getItem(STORAGE_KEY) || API_BASE_URL
  );
  const [formData, setFormData] = useState(DEFAULT_FORMS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [responseState, setResponseState] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, apiBaseUrl);
  }, [apiBaseUrl]);

  const selectedConfig = TAB_CONFIG[activeTab];

  const savedTokens = {
    accessToken: localStorage.getItem(TOKEN_KEYS.accessToken) || 'Chưa có',
    refreshToken: localStorage.getItem(TOKEN_KEYS.refreshToken) || 'Chưa có',
  };

  const handleFieldChange = (tab, field, value) => {
    setFormData((current) => ({
      ...current,
      [tab]: {
        ...current[tab],
        [field]: value,
      },
    }));
  };

  const persistTokens = (responseBody) => {
    const responseData = responseBody?.data || {};
    if (responseData.accessToken) {
      localStorage.setItem(TOKEN_KEYS.accessToken, responseData.accessToken);
    }
    if (responseData.refreshToken) {
      localStorage.setItem(TOKEN_KEYS.refreshToken, responseData.refreshToken);
    }
  };

  const callEndpoint = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      let responseBody;

      if (activeTab === 'register') {
        responseBody = await authApi.register(formData.register, apiBaseUrl);
      } else if (activeTab === 'login') {
        responseBody = await authApi.login(
          {
            email: formData.login.email,
            password: formData.login.password,
          },
          apiBaseUrl
        );
      } else if (activeTab === 'forgot') {
        responseBody = await authApi.forgotPassword(formData.forgot, apiBaseUrl);
      } else {
        responseBody = await authApi.resetPassword(formData.reset, apiBaseUrl);
      }

      persistTokens(responseBody);
      setResponseState(responseBody);
      setFeedback({
        kind: 'success',
        title: `${selectedConfig.label} thành công`,
        message: responseBody?.message || 'API trả về thành công.',
      });
    } catch (error) {
      setResponseState({
        success: false,
        message: error.message,
        status: error.status,
        body: error.body,
      });
      setFeedback({
        kind: 'error',
        title: `${selectedConfig.label} thất bại`,
        message: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderActiveForm = () => {
    if (activeTab === 'register') {
      return (
        <div className="auth-lab-field-grid">
          <label className="auth-lab-field">
            <span className="auth-lab-label">Họ và tên</span>
            <input
              className="auth-lab-input"
              value={formData.register.fullName}
              onChange={(e) => handleFieldChange('register', 'fullName', e.target.value)}
              placeholder="Nguyễn Văn A"
            />
          </label>
          <label className="auth-lab-field">
            <span className="auth-lab-label">Email</span>
            <input
              className="auth-lab-input"
              type="email"
              value={formData.register.email}
              onChange={(e) => handleFieldChange('register', 'email', e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label className="auth-lab-field" style={{ gridColumn: '1 / -1' }}>
            <span className="auth-lab-label">Mật khẩu</span>
            <input
              className="auth-lab-input"
              type="password"
              value={formData.register.password}
              onChange={(e) => handleFieldChange('register', 'password', e.target.value)}
              placeholder="Password123"
            />
          </label>
        </div>
      );
    }

    if (activeTab === 'login') {
      return (
        <div className="auth-lab-field-grid">
          <label className="auth-lab-field">
            <span className="auth-lab-label">Email</span>
            <input
              className="auth-lab-input"
              type="email"
              value={formData.login.email}
              onChange={(e) => handleFieldChange('login', 'email', e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label className="auth-lab-field">
            <span className="auth-lab-label">Mật khẩu</span>
            <input
              className="auth-lab-input"
              type="password"
              value={formData.login.password}
              onChange={(e) => handleFieldChange('login', 'password', e.target.value)}
              placeholder="Password123"
            />
          </label>
          <label className="auth-lab-field" style={{ gridColumn: '1 / -1' }}>
            <span className="auth-lab-label">Ghi nhớ đăng nhập</span>
            <input
              type="checkbox"
              checked={formData.login.rememberMe}
              onChange={(e) => handleFieldChange('login', 'rememberMe', e.target.checked)}
            />
          </label>
        </div>
      );
    }

    if (activeTab === 'forgot') {
      return (
        <div className="auth-lab-field-grid">
          <label className="auth-lab-field" style={{ gridColumn: '1 / -1' }}>
            <span className="auth-lab-label">Email</span>
            <input
              className="auth-lab-input"
              type="email"
              value={formData.forgot.email}
              onChange={(e) => handleFieldChange('forgot', 'email', e.target.value)}
              placeholder="you@example.com"
            />
          </label>
        </div>
      );
    }

    return (
      <div className="auth-lab-field-grid">
        <label className="auth-lab-field" style={{ gridColumn: '1 / -1' }}>
          <span className="auth-lab-label">Reset token</span>
          <input
            className="auth-lab-input"
            value={formData.reset.token}
            onChange={(e) => handleFieldChange('reset', 'token', e.target.value)}
            placeholder="Token từ email hoặc từ backend"
          />
        </label>
        <label className="auth-lab-field" style={{ gridColumn: '1 / -1' }}>
          <span className="auth-lab-label">Mật khẩu mới</span>
          <input
            className="auth-lab-input"
            type="password"
            value={formData.reset.newPassword}
            onChange={(e) => handleFieldChange('reset', 'newPassword', e.target.value)}
            placeholder="NewPassword123"
          />
        </label>
      </div>
    );
  };

  return (
    <div className="auth-lab-page">
      <div className="auth-lab-shell">
        <section className="auth-lab-hero">
          <div className="auth-lab-brand">
            <Brand className="login-header" textClassName="brand-name" />
          </div>
          <p className="auth-section-label">Frontend / Auth API Lab</p>
          <h1 className="auth-lab-title">Test nhanh API Authentication của backend</h1>
          <p className="auth-lab-subtitle">
            Đây là màn hình test thủ công cho team. Bạn có thể đổi base URL, chuyển tab theo từng
            user story, gọi API trực tiếp và xem response ngay trên màn hình.
          </p>

          <div className="auth-lab-badges">
            <span className="auth-lab-badge">API base: {apiBaseUrl}</span>
            <span className="auth-lab-badge">Backend: Spring Boot</span>
            <span className="auth-lab-badge">App: {APP_NAME}</span>
          </div>

          <div className="auth-lab-grid">
            <div className="auth-lab-card">
              <h3 className="auth-lab-card__title">Quy ước chia module</h3>
              <p className="auth-lab-card__text">
                Mỗi nhóm chỉ thêm file trong module của mình: api, pages, styles, components. Không
                sửa chéo route hoặc service dùng chung nếu chưa chốt contract.
              </p>
            </div>
            <div className="auth-lab-card">
              <h3 className="auth-lab-card__title">Quy ước env</h3>
              <p className="auth-lab-card__text">
                Đổi `REACT_APP_API_BASE_URL` trong `.env` để trỏ sang backend local, docker hoặc
                staging. Không hardcode host trong page.
              </p>
            </div>
            <div className="auth-lab-card">
              <h3 className="auth-lab-card__title">Luồng test</h3>
              <p className="auth-lab-card__text">
                Register tạo user, Login lấy token, Forgot Password tạo reset token, Reset Password
                đổi mật khẩu rồi test lại Login.
              </p>
            </div>
            <div className="auth-lab-card">
              <h3 className="auth-lab-card__title">Tái sử dụng</h3>
              <p className="auth-lab-card__text">
                Form login/register/forgot vẫn dùng riêng cho UX, nhưng toàn bộ call API đi qua một
                layer chung để tránh lặp logic.
              </p>
            </div>
          </div>
        </section>

        <section className="auth-lab-panel">
          <div className="auth-lab-toolbar">
            <label className="auth-lab-field" style={{ flex: '1 1 100%' }}>
              <span className="auth-lab-label">Backend base URL</span>
              <input
                className="auth-lab-input"
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
                placeholder="http://localhost:8080/api/v1"
              />
            </label>
          </div>

          <div className="auth-lab-tabs">
            {Object.entries(TAB_CONFIG).map(([key, config]) => (
              <button
                key={key}
                type="button"
                className={`auth-lab-tab ${activeTab === key ? 'active' : ''}`}
                onClick={() => setActiveTab(key)}
              >
                {config.label}
              </button>
            ))}
          </div>

          <form className="auth-lab-form" onSubmit={callEndpoint}>
            {renderActiveForm()}

            {feedback ? (
              <div className={`auth-feedback auth-feedback--${feedback.kind}`}>
                <div className="auth-feedback__title">{feedback.title}</div>
                <div>{feedback.message}</div>
              </div>
            ) : null}

            <div className="auth-lab-actions">
              <button
                className="auth-lab-button auth-lab-button--primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang gửi...' : `Gọi ${selectedConfig.label}`}
              </button>
              <button
                className="auth-lab-button auth-lab-button--secondary"
                type="button"
                onClick={() => setFormData(DEFAULT_FORMS)}
              >
                Reset form
              </button>
            </div>
          </form>

          <div className="auth-lab-section">
            <p className="auth-section-label">API endpoint</p>
            <div className="auth-lab-link-list">
              <div className="auth-lab-link-item">
                <strong>{selectedConfig.method}</strong>
                <span>{selectedConfig.endpoint}</span>
              </div>
              <div className="auth-lab-link-item">
                <strong>Base</strong>
                <span>{apiBaseUrl}</span>
              </div>
            </div>
          </div>

          <div className="auth-lab-section">
            <p className="auth-section-label">Saved tokens</p>
            <div className="auth-lab-saved-tokens">
              <div className="auth-lab-token-box">
                <div className="auth-lab-token-box__label">Access token</div>
                <div className="auth-lab-token-box__value">{savedTokens.accessToken}</div>
              </div>
              <div className="auth-lab-token-box">
                <div className="auth-lab-token-box__label">Refresh token</div>
                <div className="auth-lab-token-box__value">{savedTokens.refreshToken}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-lab-hero" style={{ gridColumn: '1 / -1' }}>
          <div className="auth-response-panel">
            <div className="auth-response-panel__header">
              <div>
                <p className="auth-section-label" style={{ marginBottom: 4 }}>
                  Response viewer
                </p>
                <h2 className="auth-response-panel__title">Backend trả về gì thì hiện ở đây</h2>
              </div>
              <div className="auth-response-panel__meta">
                <span className="auth-pill">{selectedConfig.method}</span>
                <span className="auth-pill">{selectedConfig.endpoint}</span>
              </div>
            </div>

            {responseState ? (
              <pre>{JSON.stringify(responseState, null, 2)}</pre>
            ) : (
              <div className="auth-empty-state">
                Chưa có response nào. Chọn tab ở phía trên và gọi API để kiểm tra request/response
                ngay tại frontend.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AuthApiLabPage;
