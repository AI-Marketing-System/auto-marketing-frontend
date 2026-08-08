import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../config/env';
import InputField from './InputField';
import '../styles/LoginPage.css';
import '../styles/auth-feedback.css';

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      await auth.login({ email, password }, API_BASE_URL);
      setFeedback({
        kind: 'success',
        title: 'Thêm tài khoản thành công',
        message: 'Đã thêm tài khoản mới vào danh sách.',
      });
      // Clear form
      setEmail('');
      setPassword('');
      if (onSuccess) onSuccess();
      // Delay closing to show success message briefly
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 1000);
    } catch (error) {
      setFeedback({ kind: 'error', title: 'Đăng nhập thất bại', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-modal-overlay" style={overlayStyle}>
      <div className="login-modal-content" style={contentStyle}>
        <button className="login-modal-close" onClick={onClose} style={closeStyle}>&times;</button>
        <h2 className="login-title" style={{ marginTop: 0 }}>Thêm tài khoản</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <InputField
            label="Email"
            id="modal-email"
            name="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <InputField
            label="Mật khẩu"
            id="modal-password"
            name="password"
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-submit">
            {isSubmitting ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>

        {feedback ? (
          <div className={`auth-feedback auth-feedback--${feedback.kind}`} style={{ marginTop: 16 }}>
            <div className="auth-feedback__title">{feedback.title}</div>
            <div>{feedback.message}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999
};

const contentStyle = {
  background: '#ffffff',
  padding: '30px',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
  position: 'relative'
};

const closeStyle = {
  position: 'absolute',
  top: '15px',
  right: '15px',
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: '#64748b'
};
