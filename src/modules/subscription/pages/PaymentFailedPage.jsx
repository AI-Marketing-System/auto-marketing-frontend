import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PaymentFailedPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <h2 style={{ color: '#ef4444', marginBottom: '12px' }}>Thanh toán thất bại hoặc đã bị hủy!</h2>
      <p style={{ color: '#64748b' }}>Đang đưa bạn trở về trang chủ...</p>
    </div>
  );
}
