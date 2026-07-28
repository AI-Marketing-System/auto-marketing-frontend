import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <header className="navbar">
      <div className="logo">MarqOps</div>

      <nav>
        <Link to="/">Tính năng</Link>
        <Link to="/">Bảng giá</Link>
        <Link to="/">Blog</Link>
        <Link to="/auth-lab">Auth Lab</Link>
      </nav>

      <div>
        <Link to="/login" className="navbar__button">
          Đăng nhập
        </Link>
      </div>
    </header>
  );
}

export default Navbar;
