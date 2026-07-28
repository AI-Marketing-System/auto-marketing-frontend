import React from "react";

function CaptchaMockup() {
    return (
        <div className="captcha-container">
            <span className="captcha-text">
                Vui lòng xác nhận bạn không phải robot bằng cách click vào ô dưới đây:
            </span>
            <div className="captcha-box">
                <div className="captcha-success">
                    <div className="captcha-check-circle">✓</div>
                    <span>Thành công!</span>
                </div>
                <div className="captcha-info">
                    <div className="captcha-cloudflare-logo">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" fill="#f97316" />
                        </svg>
                        <span>CLOUDFLARE</span>
                    </div>
                    <a href="/privacy" className="captcha-privacy-link">Quyền riêng tư - Điều khoản</a>
                </div>
            </div>
        </div>
    );
}

export default CaptchaMockup;
