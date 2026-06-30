import { useState } from "react";
import "../styles/RegisterPage.css";
import RegisterLeft from "../components/RegisterLeft";
import SocialButton from "../components/SocialButton";
import InputField from "../components/InputField";
import CaptchaMockup from "../components/CaptchaMockup";

function RegisterPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Register submitted with:", { fullName, email, password });
    };

    const handleFacebookSignup = () => {
        console.log("Facebook signup clicked");
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
                    <SocialButton onClick={handleFacebookSignup}>
                        Đăng nhập với Facebook
                    </SocialButton>

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
                            Tạo tài khoản
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="register-footer">
                        Đã có tài khoản?
                        <a href="/login" className="login-link">
                            Đăng nhập
                        </a>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default RegisterPage;
