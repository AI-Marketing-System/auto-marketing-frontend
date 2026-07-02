import { useState } from "react";
import "../styles/ForgotPasswordPage.css";
import Brand from "../../../public-site/components/Brand";
import InputField from "../components/InputField";

function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Forgot password request submitted for email:", email);
        // Mock success transition for team backend development
        setIsSubmitted(true);
    };

    return (
        <div className="forgot-container">
            <div className="forgot-card">
                {/* Logo & Brand Name */}
                <Brand className="forgot-header" textClassName="brand-name" />

                {isSubmitted ? (
                    <div className="forgot-success-state">
                        <div className="success-icon-wrapper">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2" fill="#f0fdf4" />
                                <path d="M8 12.5L11 15.5L16 9.5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h2 className="forgot-title">Kiểm tra email của bạn</h2>
                        <p className="forgot-subtitle">
                            Chúng tôi đã gửi liên kết đặt lại mật khẩu đến <strong>{email}</strong>. Vui lòng kiểm tra hộp thư của bạn.
                        </p>
                        <button
                            type="button"
                            className="btn-submit"
                            onClick={() => setIsSubmitted(false)}
                        >
                            Gửi lại yêu cầu
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Form Title */}
                        <h1 className="forgot-title">Quên mật khẩu?</h1>
                        <p className="forgot-subtitle">
                            Nhập địa chỉ email đăng ký của bạn. Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
                        </p>

                        {/* Forgot Password Form */}
                        <form className="forgot-form" onSubmit={handleSubmit}>
                            {/* Email Field */}
                            <InputField
                                label="Email đăng ký"
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Nhập email của bạn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            {/* Submit Button */}
                            <button type="submit" className="btn-submit">
                                Gửi yêu cầu đặt lại mật khẩu
                            </button>
                        </form>
                    </>
                )}

                {/* Footer Back Link */}
                <div className="forgot-footer">
                    Có thắc mắc hoặc muốn quay lại?
                    <a href="/login" className="back-login-link">
                        Đăng nhập
                    </a>
                </div>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
