import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../styles/Header.css';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout('/api/v1');
    navigate('/login', { replace: true });
  };

  return (
    <header className="header">
      <div className="container header__inner">
        <a href="#top" className="header__logo">
          <span className="header__logo-dot" />
          MarqOps
        </a>

        <nav className="header__nav">
          <a href="#features">Tính năng</a>
          <a href="#how-it-works">Cách hoạt động</a>
          <a href="#cta">Bảng giá</a>
        </nav>

        <div className="header__actions">
          {isAuthenticated ? (
            <>
              <span className="header__user">{user?.fullName || user?.email}</span>
              <button className="btn btn-ghost header__login" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="header__login">
                Đăng nhập
              </a>
              <a href="#pricing" className="btn btn-primary header__cta">
                Dùng thử miễn phí
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
