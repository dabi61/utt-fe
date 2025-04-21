import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box, useTheme } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../store/hooks';
import { fetchCurrentUser } from '../../store/slices/authSlice';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

/**
 * Component bảo vệ các route cần xác thực
 * @param children Component con được bảo vệ
 * @param requiredRole Vai trò cần thiết để truy cập (tuỳ chọn)
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Nếu đã có xác thực nhưng không có thông tin người dùng, thử lấy lại
    if (isAuthenticated && !user) {
      console.log('Đã xác thực nhưng không có thông tin người dùng, thử lấy lại...');
      dispatch(fetchCurrentUser());
    }
  }, [isAuthenticated, user, dispatch]);

  // Kiểm tra vai trò
  const hasRequiredRole = () => {
    if (!requiredRole || !user) return true;
    return user.role === requiredRole;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          bgcolor: theme.palette.background.default,
        }}
      >
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Lưu lại đường dẫn hiện tại để điều hướng sau khi đăng nhập
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!hasRequiredRole()) {
    // Điều hướng đến trang không có quyền truy cập
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard; 