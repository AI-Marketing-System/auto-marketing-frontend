import React from "react";

function SocialButton({ onClick, children }) {
    return (
        <button
            type="button"
            className="social-login-btn btn-facebook"
            onClick={onClick}
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="#1877f2" />
                <path d="M14.73 12H12.65V18.84H9.82V12H8.48V9.61H9.82V8.12C9.82 6.78 10.51 4.7 13.3 4.7L15.39 4.71V7.03H13.88C13.58 7.03 13.16 7.18 13.16 7.82V9.62H15.35L14.73 12Z" fill="white" />
            </svg>
            {children}
        </button>
    );
}

export default SocialButton;
