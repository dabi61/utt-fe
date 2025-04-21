import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingPage from '../pages/common/LoadingPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, error } = useAuth();
  const location = useLocation();
  
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute - loading:', loading);
  console.log('ProtectedRoute - error:', error);

  // Kiểm tra nếu có lỗi liên quan đến token hết hạn
  useEffect(() => {
    if (error) {
      console.error('Lỗi xác thực:', error);
    }
  }, [error]);

  // Nếu đang tải, hiển thị trang loading
  if (loading) {
    return <LoadingPage />;
  }

  // Nếu chưa đăng nhập, chuyển hướng tới trang đăng nhập với thông báo
  if (!isAuthenticated) {
    // Kiểm tra nếu lỗi liên quan đến token
    const hasExpiredToken = error && 
      (error.includes('hết hạn') || 
       error.includes('token') || 
       error.includes('xác thực') ||
       error.includes('unauthorized'));
       
    // Tạo URL với query param thông báo
    const loginPath = hasExpiredToken 
      ? '/login?expired=true' 
      : '/login?unauthorized=true';
      
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Nếu đã đăng nhập, hiển thị trang được bảo vệ
  return <>{children}</>;
};

export default ProtectedRoute; 