import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { authApi } from '../../api/authApi';
import { JWT_CONFIG } from '../../config';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  re_password: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Lấy thông tin từ localStorage nếu có
const token = localStorage.getItem(JWT_CONFIG.tokenStorageName);
const user = localStorage.getItem(JWT_CONFIG.userStorageName) 
  ? JSON.parse(localStorage.getItem(JWT_CONFIG.userStorageName)!) 
  : null;

const initialState: AuthState = {
  token: token,
  refreshToken: null,
  user: user,
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

// Thêm hàm kiểm tra token
const isTokenExpired = (token: string): boolean => {
  try {
    // Giải mã phần payload của token (phần giữa của chuỗi JWT)
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Nếu payload không có trường exp, coi như token hết hạn
    if (!payload.exp) return true;
    
    // Kiểm tra thời hạn với thời gian hiện tại (đơn vị giây)
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch (error) {
    // Nếu có lỗi khi giải mã, coi như token hết hạn
    console.error('Lỗi khi kiểm tra token:', error);
    return true;
  }
};

// Thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue, dispatch }) => {
    try {
      const response = await authApi.login(credentials);
      
      // Lưu token vào localStorage
      localStorage.setItem(JWT_CONFIG.tokenStorageName, response.access);
      localStorage.setItem('refreshToken', response.refresh);
      
      // Lấy thông tin người dùng ngay sau khi lưu token
      try {
        // Đợi 1 giây trước khi lấy thông tin người dùng để đảm bảo token đã được lưu
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const userData = await authApi.getCurrentUser();
        
        // Lưu thông tin user vào localStorage
        localStorage.setItem(JWT_CONFIG.userStorageName, JSON.stringify(userData));
        
        return {
          token: response.access,
          refreshToken: response.refresh,
          user: userData
        };
      } catch (userError: any) {
        // Ngay cả khi không lấy được thông tin người dùng, chúng ta vẫn coi việc đăng nhập là thành công
        return {
          token: response.access,
          refreshToken: response.refresh,
          user: null
        };
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Đăng nhập thất bại');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterCredentials, { rejectWithValue }) => {
    try {
      // Chuyển đổi dữ liệu đăng ký sang định dạng API cần
      const registerData = {
        username: userData.email,
        email: userData.email,
        password: userData.password,
        name: userData.name,
      };
      
      const response = await authApi.register(registerData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Đăng ký thất bại');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  // Xóa token và user từ localStorage
  localStorage.removeItem(JWT_CONFIG.tokenStorageName);
  localStorage.removeItem(JWT_CONFIG.userStorageName);
  localStorage.removeItem('refreshToken');
  return true;
});

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const currentRefreshToken = localStorage.getItem('refreshToken');

      if (!currentRefreshToken) {
        // Tự động đăng xuất nếu không có refresh token
        dispatch(logout());
        return rejectWithValue('Không tìm thấy refresh token');
      }
      
      // Kiểm tra nếu refresh token đã hết hạn
      if (isTokenExpired(currentRefreshToken)) {
        console.error('Refresh token đã hết hạn');
        dispatch(logout());
        return rejectWithValue('Refresh token đã hết hạn');
      }

      console.log('Đang làm mới token...');
      const response = await authApi.refreshToken(currentRefreshToken);
      
      // Cập nhật token mới vào localStorage
      localStorage.setItem(JWT_CONFIG.tokenStorageName, response.access);
      
      if (response.refresh) {
        localStorage.setItem('refreshToken', response.refresh);
      }
      
      console.log('Làm mới token thành công');
      return {
        token: response.access,
        refreshToken: response.refresh
      };
    } catch (error: any) {
      // Nếu refresh token thất bại, đăng xuất ngay lập tức
      console.error('Lỗi khi làm mới token:', error.response?.data || error.message);
      dispatch(logout());
      
      return rejectWithValue(error.response?.data?.detail || 'Phiên đăng nhập hết hạn');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem(JWT_CONFIG.tokenStorageName);
      if (!token) {
        return rejectWithValue('Không tìm thấy token xác thực');
      }
      
      // Kiểm tra nếu token đã hết hạn
      if (isTokenExpired(token)) {
        console.log('Token truy cập đã hết hạn, thử làm mới token...');
        try {
          // Thử làm mới token trước khi lấy thông tin người dùng
          await dispatch(refreshToken()).unwrap();
        } catch (refreshError) {
          // Nếu không thể làm mới, trả về lỗi
          return rejectWithValue('Không thể làm mới token');
        }
      }
      
      console.log('Lấy thông tin người dùng hiện tại...');
      const user = await authApi.getCurrentUser();
      
      // Cập nhật thông tin user vào localStorage
      localStorage.setItem(JWT_CONFIG.userStorageName, JSON.stringify(user));
      console.log('Đã lấy thông tin người dùng thành công');
      return user;
    } catch (error: any) {
      console.error('Lỗi khi lấy thông tin người dùng:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.detail || 'Không thể lấy thông tin người dùng');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCredentials: (state, action: PayloadAction<{ token: string; refreshToken: string; user: User | null }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      
      // Lưu vào localStorage
      localStorage.setItem(JWT_CONFIG.tokenStorageName, action.payload.token);
      if (action.payload.user) {
        localStorage.setItem(JWT_CONFIG.userStorageName, JSON.stringify(action.payload.user));
      }
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem(JWT_CONFIG.userStorageName, JSON.stringify(action.payload));
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Refresh token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCredentials, setAuthError, setUser } = authSlice.actions;

// Selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthLoading = (state: RootState) => state.auth.loading;

export default authSlice.reducer; 