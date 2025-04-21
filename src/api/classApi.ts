import axios from 'axios';
import { JWT_CONFIG } from '../config';

const API_URL = '/api/school';

// Hàm trợ giúp tạo header với token JWT
const createAuthHeader = (token?: string) => {
  const authToken = token || localStorage.getItem(JWT_CONFIG.tokenStorageName);
  return {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  };
};

// Lấy danh sách lớp học
export const getClasses = async (token: string) => {
  const response = await axios.get(`${API_URL}/classes/`, createAuthHeader(token));
  return response.data;
};

// Lấy thông tin một lớp học cụ thể
export const getClassById = async (token: string, classId: number) => {
  const response = await axios.get(`${API_URL}/classes/${classId}/`, createAuthHeader(token));
  return response.data;
};

// Lấy danh sách lớp học của giáo viên
export const getTeacherClasses = async (token: string) => {
  const response = await axios.get(`${API_URL}/teachers/my_classes/`, createAuthHeader(token));
  return response.data;
};

// Lấy danh sách lớp học của sinh viên
export const getStudentClasses = async (token: string) => {
  const response = await axios.get(`${API_URL}/students/my_classes/`, createAuthHeader(token));
  return response.data;
};

// Thêm sinh viên vào lớp học
export const addStudentToClass = async (token: string, classId: number, studentId: number) => {
  const response = await axios.post(
    `${API_URL}/classes/${classId}/add_student/`,
    { student_id: studentId },
    createAuthHeader(token)
  );
  return response.data;
};

// Thêm giáo viên vào lớp học
export const addTeacherToClass = async (token: string, classId: number, teacherId: number) => {
  const response = await axios.post(
    `${API_URL}/classes/${classId}/add_teacher/`,
    { teacher_id: teacherId },
    createAuthHeader(token)
  );
  return response.data;
}; 