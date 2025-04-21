import axios from 'axios';
import { JWT_CONFIG } from '../config';

const API_URL = '/api/attendance';

// Hàm trợ giúp tạo header với token JWT
const createAuthHeader = (token?: string) => {
  const authToken = token || localStorage.getItem(JWT_CONFIG.tokenStorageName);
  return {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  };
};

// Lấy danh sách điểm danh
export const getAttendances = async (token: string) => {
  const response = await axios.get(`${API_URL}/`, createAuthHeader(token));
  return response.data;
};

// Lấy danh sách điểm danh cho một lịch học cụ thể
export const getAttendancesForSchedule = async (token: string, scheduleId: number) => {
  const response = await axios.get(`${API_URL}/?schedule_id=${scheduleId}`, createAuthHeader(token));
  return response.data;
};

// Lấy danh sách điểm danh của một sinh viên
export const getStudentAttendances = async (token: string, studentId: number) => {
  const response = await axios.get(`${API_URL}/?student_id=${studentId}`, createAuthHeader(token));
  return response.data;
};

// Tạo điểm danh mới
export const createAttendance = async (token: string, attendanceData: any) => {
  const response = await axios.post(`${API_URL}/`, attendanceData, createAuthHeader(token));
  return response.data;
};

// Cập nhật điểm danh
export const updateAttendance = async (token: string, attendanceId: number, attendanceData: any) => {
  const response = await axios.patch(`${API_URL}/${attendanceId}/`, attendanceData, createAuthHeader(token));
  return response.data;
};

// Điểm danh bằng QR code
export const checkInByQR = async (token: string, qrData: string, locationData: { latitude: number; longitude: number }) => {
  const response = await axios.post(
    `${API_URL}/qr_checkin/`,
    {
      qr_data: qrData,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    },
    createAuthHeader(token)
  );
  return response.data;
}; 