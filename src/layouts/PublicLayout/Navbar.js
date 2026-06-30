import "./Navbar.css";

function Navbar() {
    return (
        <header className="navbar">
            <div className="logo">
                Auto Marketing
            </div>

            <nav>
                <a href="/">Tính năng</a>
                <a href="/">Bảng giá</a>
                <a href="/">Blog</a>
            </nav>

            <div>
                <button>Đăng nhập</button>
            </div>
        </header>
    );
}

export default Navbar;