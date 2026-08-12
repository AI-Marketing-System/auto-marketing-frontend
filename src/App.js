import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import TokenToast from './modules/subscription/components/TokenToast';

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      {/* Toast thông báo AI token tiêu tốn — hiển thị toàn cục ở mọi trang */}
      <TokenToast />
    </AuthProvider>
  );
}

export default App;
