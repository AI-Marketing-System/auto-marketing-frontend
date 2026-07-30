import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../../config/env';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const confirmPayment = async () => {
      const searchParams = new URLSearchParams(location.search);
      const status = searchParams.get('status');
      const cancel = searchParams.get('cancel');
      const orderCode = searchParams.get('orderCode');

      // Nếu đang chạy Local (không có webhook thật) hoặc webhook chưa kịp chạy
      // Frontend sẽ chủ động gọi API confirmPayment bằng orderCode (transactionId)
      if (status === 'PAID' && cancel === 'false' && orderCode) {
        try {
          const token = localStorage.getItem('marqops.authLab.accessToken');
          await fetch(`${API_BASE_URL}/subscriptions/${orderCode}/confirm`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        } catch (error) {
          console.error("Lỗi khi gọi API confirm payment:", error);
        }
      }

      // Xong thì đưa về dashboard
      navigate('/dashboard?payment_success=true', { replace: true });
    };

    // Vẫn delay 1.5s để có cảm giác "Đang xử lý"
    const timer = setTimeout(() => {
      confirmPayment();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [location, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <h2 style={{ color: '#10b981', marginBottom: '12px' }}>Thanh toán thành công!</h2>
      <p style={{ color: '#64748b' }}>Hệ thống đang xác nhận giao dịch. Vui lòng đợi trong giây lát...</p>
      <div style={{ marginTop: '20px', width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
