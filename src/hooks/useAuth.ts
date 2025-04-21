import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  selectAuth, 
  selectIsAuthenticated, 
  selectUser, 
  login, 
  logout, 
  refreshToken, 
  fetchCurrentUser 
} from '../store/slices/authSlice';
import { JWT_CONFIG } from '../config';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';

interface LoginResult {
  success: boolean;
  error?: string;
}

// Biến toàn cục để theo dõi trạng thái
const authState = {
  initialized: false,
  initializing: false,
  lastAuthCheck: 0,
  failedAttempts: 0,
  refreshIntervalId: null as number | null,
  lastRefreshTime: 0, // Theo dõi thời gian refresh gần nhất
  refreshDebounceTime: 5 * 60 * 1000 // 5 phút
};

/**
 * Hook để quản lý xác thực người dùng
 */
export function useAuth() {
  const authState = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  // Đăng nhập
  const handleLogin = async (email: string, password: string) => {
    try {
      const loginResult = await dispatch(login({ email, password })).unwrap();
      return loginResult;
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      throw error;
    }
  };

  // Đăng xuất
  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    authState,
    isAuthenticated: !!authState.token,
    user: authState.user,
    login: handleLogin,
    logout: handleLogout,
    loading: authState.loading,
    error: authState.error
  };
}

export default useAuth; 