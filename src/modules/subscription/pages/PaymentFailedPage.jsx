import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../../config/env';

export default function PaymentFailedPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Lấy orderCode từ URL query parameters
    const params = new URLSearchParams(location.search);
    const orderCode = params.get('orderCode');
    
    if (orderCode) {
      const token = localStorage.getItem('marqops.authLab.accessToken');
      if (token) {
        // Gọi API để đánh dấu transaction là FAILED
        fetch(`${API_BASE_URL}/subscriptions/${orderCode}/fail`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        }).catch(err => console.error("Error marking payment as failed:", err));
      }
    }

    const timer = setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate, location]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <h2 style={{ color: '#ef4444', marginBottom: '12px' }}>Thanh toán thất bại hoặc đã bị hủy!</h2>
      <p style={{ color: '#64748b' }}>Đang đưa bạn trở về trang chủ...</p>
    </div>
  );
}
