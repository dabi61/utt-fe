// API URL cơ sở cho ứng dụng
export const API_URL = '/api';

// Auth API URL
export const AUTH_API_URL = '/auth';

// JWT config
export const JWT_CONFIG = {
  tokenStorageName: 'token',
  userStorageName: 'user',
  refreshInterval: 30 * 60 * 1000, // Refresh token sau mỗi 30 phút (tăng từ 10 phút)
};

// Thiết lập timeout mặc định cho các request API
export const REQUEST_TIMEOUT = 30000; // 30 giây