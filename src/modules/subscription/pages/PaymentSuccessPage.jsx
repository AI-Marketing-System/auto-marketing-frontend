import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Đợi 1.5s để webhook từ PayOS có thời gian xử lý ở Backend
    const timer = setTimeout(() => {
      navigate('/dashboard?payment_success=true', { replace: true });
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [navigate]);

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
