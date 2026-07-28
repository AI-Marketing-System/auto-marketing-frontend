import { Link } from 'react-router-dom';

function ErrorPage({ title, message, status }) {
  return (
    <div className="error-page">
      <div className="error-card">
        <h1 className="error-code">{status}</h1>
        <h2 className="error-title">{title}</h2>
        <p className="error-message">{message}</p>
        <Link to="/dashboard" className="btn-home">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default ErrorPage;
