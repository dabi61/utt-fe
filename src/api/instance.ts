import axios from 'axios';
import { JWT_CONFIG } from '../config';

// Biến để theo dõi trạng thái làm mới token
let isRefreshing = false;
let failedQueue: { resolve: (value: string) => void; reject: (reason?: any) => void }[] = [];
// Theo dõi các endpoint để tránh vòng lặp vô hạn
const REFRESH_ENDPOINT = '/auth/jwt/refresh/';
const USER_ME_ENDPOINT = '/auth/users/me/';
const ENDPOINTS_TO_SKIP_REFRESH = [REFRESH_ENDPOINT, '/auth/jwt/create/'];

// Theo dõi thời gian refresh token gần nhất
let lastRefreshTime = 0;
// Khoảng thời gian tối thiểu giữa các lần gọi refresh token (2 phút)
const REFRESH_DEBOUNCE_TIME = 2 * 60 * 1000;

// Hàm xử lý các request bị fail do token hết hạn
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

// Tạo một instance axios với URL cơ sở
const api = axios.create({
  baseURL: '',
  timeout: 30000,
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
    
    // QUAN TRỌNG: Cho phép axios tự xử lý Content-Type cho multipart/form-data
    if (config.data instanceof FormData) {
      console.log('Đang gửi FormData, xóa Content-Type để browser xử lý');
      // Xóa Content-Type để browser tự thiết lập boundary
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Kiểm tra xem có nên làm mới token hay không
const shouldAttemptRefresh = () => {
  const now = Date.now();
  // Chỉ làm mới nếu đã qua thời gian debounce
  if (now - lastRefreshTime < REFRESH_DEBOUNCE_TIME) {
    return false;
  }
  lastRefreshTime = now;
  return true;
};

// Interceptor để xử lý lỗi response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest.url || '';
    
    // Kiểm tra xem request này có phải là refresh token hay không
    const isRefreshRequest = requestUrl.includes(REFRESH_ENDPOINT);
    const isUserMeRequest = requestUrl.includes(USER_ME_ENDPOINT);
    const shouldSkipRefresh = ENDPOINTS_TO_SKIP_REFRESH.some(endpoint => 
      requestUrl.includes(endpoint));
    
    // Nếu là lỗi refresh token, đăng xuất người dùng
    if (isRefreshRequest && error.response?.status === 401) {
      handleLogout();
      return Promise.reject(error);
    }
    
    // Nếu là lỗi khi lấy thông tin user và không phải 401, đơn giản là bỏ qua
    if (isUserMeRequest && error.response?.status !== 401) {
      return Promise.reject(error);
    }
      
    // Chỉ xử lý lỗi 401 và không phải request refresh token
    if (error.response?.status === 401 && !originalRequest._retry && !shouldSkipRefresh) {
      // Kiểm tra xem có nên thử làm mới token không
      if (!shouldAttemptRefresh()) {
        return Promise.reject(error);
      }
      
      // Đánh dấu request này đã được thử làm mới token
      originalRequest._retry = true;
      
      // Kiểm tra refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        handleLogout();
        return Promise.reject(error);
      }
      
      // Nếu đang làm mới token, thêm request vào hàng đợi
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }
      
      isRefreshing = true;
      
      try {
        // Giới hạn chỉ thử làm mới token một lần
        const tokenResponse = await axios.post('/auth/jwt/refresh/', { refresh: refreshToken });
        
        if (!tokenResponse) {
          throw new Error('Không nhận được phản hồi khi làm mới token');
        }
        
        // Lưu token mới
        const newToken = tokenResponse.data.access;
        localStorage.setItem(JWT_CONFIG.tokenStorageName, newToken);
        if (tokenResponse.data.refresh) {
          localStorage.setItem('refreshToken', tokenResponse.data.refresh);
        }
        
        // Xử lý hàng đợi các request bị fail
        processQueue(null, newToken);
        
        // Cập nhật token và thử lại request ban đầu
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Xử lý hàng đợi với lỗi
        processQueue(refreshError, null);
        // Đăng xuất
        handleLogout();
        return Promise.reject(error);
      } finally {
        // Đảm bảo flag được reset
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

// Hàm đăng xuất
const handleLogout = () => {
  // Xóa token và thông tin người dùng
  localStorage.removeItem(JWT_CONFIG.tokenStorageName);
  localStorage.removeItem(JWT_CONFIG.userStorageName);
  localStorage.removeItem('refreshToken');
  
  // Chuyển hướng đến trang đăng nhập nếu không phải đang ở trang đăng nhập
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
};

export default api; 