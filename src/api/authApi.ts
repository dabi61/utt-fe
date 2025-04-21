import axios from 'axios';
import { AUTH_API_URL, REQUEST_TIMEOUT, JWT_CONFIG } from '../config';

// Tạo một instance axios với URL cơ sở
const api = axios.create({
  baseURL: AUTH_API_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header nếu có
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(JWT_CONFIG.tokenStorageName);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interface định nghĩa cho các tham số
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  name: string;
  role?: string;
}

interface PasswordChangeData {
  old_password: string;
  new_password: string;
}

interface PasswordResetData {
  token: string;
  new_password: string;
}

// Hàm trợ giúp tạo header với token JWT
const createAuthHeader = (token?: string) => {
  const authToken = token || localStorage.getItem(JWT_CONFIG.tokenStorageName);
  return {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  };
};

// Các phương thức API xác thực
export const authApi = {
  // Đăng nhập
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/jwt/create/', credentials);
    return response.data;
  },

  // Đăng ký
  register: async (userData: RegisterData) => {
    const response = await api.post('/users/', userData);
    return response.data;
  },

  // Làm mới token
  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/jwt/refresh/', { refresh: refreshToken });
    return response.data;
  },

  // Lấy thông tin người dùng hiện tại
  getCurrentUser: async () => {
    // Lấy token từ localStorage
    const token = localStorage.getItem(JWT_CONFIG.tokenStorageName);
    
    if (!token) {
      throw new Error('Không tìm thấy token xác thực');
    }
    
    try {
      const response = await api.get('/users/me/', createAuthHeader(token));
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Đổi mật khẩu
  changePassword: async (passwordData: PasswordChangeData) => {
    const token = localStorage.getItem(JWT_CONFIG.tokenStorageName);
    if (!token) {
      throw new Error('Không tìm thấy token xác thực');
    }
    const response = await api.post('/users/set_password/', passwordData, createAuthHeader(token));
    return response.data;
  },

  // Quên mật khẩu
  forgotPassword: async (email: string) => {
    const response = await api.post('/users/reset_password/', { email });
    return response.data;
  },

  // Đặt lại mật khẩu
  resetPassword: async (resetData: PasswordResetData) => {
    const response = await api.post('/users/reset_password_confirm/', resetData);
    return response.data;
  },

  // Kiểm tra token
  verifyToken: async (token: string) => {
    const response = await api.post('/jwt/verify/', { token });
    return response.data;
  },
};

export default api; 