import axios from 'axios';
import api from './instance';
import { JWT_CONFIG } from '../config';
import { UserProfile } from '../types/user';

// API URL Djoser
const AUTH_URL = '/auth';
const USER_ENDPOINT = `${AUTH_URL}/users/me/`;
const EXTENDED_USER_ENDPOINT = '/api/user-info/';
const USERS_ENDPOINT = '/api/users/';

// Lấy thông tin người dùng mở rộng (bao gồm role và thông tin bổ sung)
export const getUserExtendedInfo = async (): Promise<UserProfile | null> => {
  try {
    const response = await api.get<UserProfile>(EXTENDED_USER_ENDPOINT);
    return response.data;
  } catch (error: any) {
    console.error('Lỗi khi gọi API user-info:', error);
    // Fallback to basic user info
    return getUserProfile();
  }
};

// Lấy thông tin người dùng từ Djoser API (thông tin cơ bản)
export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const response = await api.get<UserProfile>(USER_ENDPOINT);
    
    // Djoser API không cung cấp trường role, nên phải thêm vào
    const userData = response.data;
    
    // Thiết lập vai trò dựa vào email hoặc các thông tin khác
    // Đây chỉ là logic tạm thời, có thể cần điều chỉnh tùy theo hệ thống thực tế
    if (userData.email?.includes('admin')) {
      userData.role = 'admin';
    } else if (userData.email?.includes('teacher')) {
      userData.role = 'teacher';
    } else {
      userData.role = 'student';
    }
    
    return userData;
  } catch (error: any) {
    console.error('Lỗi khi gọi API user:', error);
    return null;
  }
};

// Lấy thông tin chi tiết người dùng từ API mới
export const getUserDetails = async (): Promise<UserProfile | null> => {
  try {
    const response = await api.get<UserProfile>(`${USERS_ENDPOINT}me/`);
    return response.data;
  } catch (error: any) {
    console.error('Lỗi khi gọi API user details:', error);
    return null;
  }
};

// Sử dụng hàm tổng hợp để lấy thông tin người dùng đầy đủ nhất có thể
export const getUserInfo = async (): Promise<UserProfile | null> => {
  try {
    // Thử lấy thông tin từ API mới
    const userDetails = await getUserDetails();
    if (userDetails) return userDetails;
    
    // Nếu thất bại, thử từ API mở rộng
    const extendedInfo = await getUserExtendedInfo();
    if (extendedInfo) return extendedInfo;
    
    // Cuối cùng, thử từ API cơ bản
    return getUserProfile();
  } catch (error) {
    console.error('Không thể lấy thông tin người dùng:', error);
    return null;
  }
};

// Cập nhật thông tin người dùng
export const updateProfile = async (userData: Partial<UserProfile>) => {
  try {
    const response = await api.patch(`${USERS_ENDPOINT}update-profile/`, userData);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Tải lên avatar
export const uploadAvatar = async (file: File) => {
  try {
    console.log('Bắt đầu quá trình tải lên avatar:', file.name, file.type, file.size);
    
    // Tạo FormData để gửi file
    const formData = new FormData();
    formData.append('avatar', file);
    
    // In ra formData để kiểm tra
    for (const pair of formData.entries()) {
      console.log('FormData chứa:', pair[0], pair[1]);
    }
    
    // QUAN TRỌNG: KHÔNG đặt 'Content-Type' trong headers
    const response = await api.post(`${USERS_ENDPOINT}upload-avatar/`, formData);
    
    console.log('Phản hồi từ server:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Lỗi khi tải lên avatar:', error);
    console.error('Chi tiết lỗi:', error.response?.data || error.message);
    throw error;
  }
};

// Xóa avatar
export const removeAvatar = async () => {
  try {
    const response = await api.delete(`${USERS_ENDPOINT}remove-avatar/`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Thay đổi mật khẩu
export const changePassword = async (passwords: { current_password: string; new_password: string; re_new_password?: string }) => {
  try {
    const response = await api.post(`${AUTH_URL}/users/set_password/`, passwords);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Sử dụng API mới để thay đổi mật khẩu
export const changePasswordProfile = async (passwords: { old_password: string; new_password: string }) => {
  try {
    const response = await api.post(`${USERS_ENDPOINT}change-password/`, passwords);
    return response.data;
  } catch (error: any) {
    // Nếu API mới thất bại, thử API cũ
    try {
      return await changePassword({
        current_password: passwords.old_password,
        new_password: passwords.new_password
      });
    } catch (fallbackError) {
      throw fallbackError;
    }
  }
};

// Lấy danh sách nhóm người dùng (nếu cần)
export const getUserGroups = async () => {
  try {
    const response = await api.get(`${AUTH_URL}/groups/`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
}; 