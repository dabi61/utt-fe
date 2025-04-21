import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingPage from '../pages/common/LoadingPage';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Nếu đang tải, hiển thị trang loading
  if (loading) {
    return <LoadingPage />;
  }

  // Nếu đã đăng nhập, chuyển hướng tới dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Nếu chưa đăng nhập, hiển thị trang công khai (login, register)
  return <>{children}</>;
};

export default PublicRoute; 