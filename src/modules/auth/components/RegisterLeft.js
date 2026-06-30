import React from "react";
import Brand from "./Brand";

function RegisterLeft() {
    return (
        <div className="register-left">
            <Brand className="register-brand" textClassName="register-brand-name" />

            <h2 className="register-left-title">
                Tạo tài khoản và đăng bài viết đầu tiên chỉ trong vài phút
            </h2>

            <ul className="register-features">
                <li className="feature-item">
                    <svg className="feature-check-icon" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l5-5z" clipRule="evenodd" />
                    </svg>
                    <span>2 tuần sử dụng miễn phí tất cả tính năng</span>
                </li>
                <li className="feature-item">
                    <svg className="feature-check-icon" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l5-5z" clipRule="evenodd" />
                    </svg>
                    <span>Kết nối 3 Fanpage Facebook hoặc tài khoản Instagram</span>
                </li>
                <li className="feature-item">
                    <svg className="feature-check-icon" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l5-5z" clipRule="evenodd" />
                    </svg>
                    <span>Lập kế hoạch tự động đăng bài cho nhiều tài khoản cùng lúc</span>
                </li>
                <li className="feature-item">
                    <svg className="feature-check-icon" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l5-5z" clipRule="evenodd" />
                    </svg>
                    <span>Gợi ý bài đăng từ PostLab</span>
                </li>
                <li className="feature-item">
                    <svg className="feature-check-icon" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l5-5z" clipRule="evenodd" />
                    </svg>
                    <span>Tìm lại những bài viết chất lượng trong quá khứ</span>
                </li>
                <li className="feature-item">
                    <svg className="feature-check-icon" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l5-5z" clipRule="evenodd" />
                    </svg>
                    <span>Viết bài bất kì lúc nào, tự động đăng bài lên nhiều nơi</span>
                </li>
            </ul>

            <div className="register-left-footer">
                Hãy để PostLab giúp bạn giảm bớt 80% thời gian quản lý nhàm chán. Tự động hoá social media marketing ngay hôm nay.
            </div>
        </div>
    );
}

export default RegisterLeft;
