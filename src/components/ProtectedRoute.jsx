import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="page-loading">Đang kiểm tra đăng nhập...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function AdminRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="page-loading">Đang kiểm tra quyền...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role;
  const roles = user?.roles || [];
  const isAdmin = role === 'ADMIN' || roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
