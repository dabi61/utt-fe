// Kiểu dữ liệu cho người dùng
export interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  groups: { id: number; name: string }[];
}

// Kiểu dữ liệu cho thông tin Profile
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar?: string;
  user_type?: string;
}

// Kiểu dữ liệu cho nhóm người dùng
export interface Group {
  id: number;
  name: string;
}

// Kiểu dữ liệu cho sinh viên
export interface Student {
  id: number;
  user: User;
  student_code: string;
}

// Kiểu dữ liệu cho giáo viên
export interface Teacher {
  id: number;
  user: User;
  teacher_code: string;
}

// Kiểu dữ liệu cho lớp học
export interface Class {
  id: number;
  class_name: string;
  course_id: number;
  schedule_ids: number[];
  teacher_ids: number[];
  student_ids: number[];
  created_at: string;
  updated_at: string;
}

// Kiểu dữ liệu cho phòng học
export interface Classroom {
  id: number;
  classroom_code: string;
  class_name: string;
  latitude?: number;
  longitude?: number;
}

// Kiểu dữ liệu cho môn học
export interface Object {
  id: number;
  object_code: string;
  object_name: string;
}

// Kiểu dữ liệu cho ngày trong tuần
export interface Weekday {
  id: number;
  day: string;
}

// Kiểu dữ liệu cho lịch học
export interface Schedule {
  id: number;
  class_name: { id: number; class_name: string };
  course_name: { id: number; object_name: string };
  room: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  day_of_week: number;
  teacher: { id: number; user: { id: number; name: string } };
}

// Kiểu dữ liệu cho điểm danh
export interface Attendance {
  id: number;
  student: { id: number; user: { id: number; name: string } };
  schedule_id: number;
  is_present: boolean;
  is_late: boolean;
  minutes_late?: number;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  device_info?: string;
}

// Kiểu dữ liệu cho thông tin xác thực
export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Kiểu dữ liệu cho thông tin đăng nhập
export interface LoginCredentials {
  email: string;
  password: string;
}

// Kiểu dữ liệu cho thông tin đăng ký
export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  re_password: string;
}

// Enum cho vai trò người dùng
export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
  GUEST = 'guest'
} 