import { useState } from "react";
import "../styles/LoginPage.css";
import Brand from "../components/Brand";
import SocialButton from "../components/SocialButton";
import InputField from "../components/InputField";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Login submitted with:", { email, password, rememberMe });
    };

    const handleFacebookLogin = () => {
        console.log("Facebook login clicked");
    };

    return (
        <div className="login-container">
            <div className="login-card">
                {/* Logo & Brand Name */}
                <Brand className="login-header" textClassName="brand-name" />

                {/* Form Title */}
                <h1 className="login-title">Đăng nhập tài khoản</h1>

                {/* Social Facebook Login */}
                <SocialButton onClick={handleFacebookLogin}>
                    Đăng nhập với Facebook
                </SocialButton>

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
                        <a href="/forgot-password" className="forgot-password-link">
                            Quên mật khẩu?
                        </a>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="btn-submit">
                        Đăng nhập
                    </button>
                </form>

                {/* Footer Signup Link */}
                <div className="login-footer">
                    Chưa có tài khoản?
                    <a href="/register" className="signup-link">
                        Đăng ký
                    </a>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
