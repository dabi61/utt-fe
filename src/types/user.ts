export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone_number?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'M' | 'F' | 'O';
  avatar_url?: string;
  bio?: string;
  is_active?: boolean;
  date_joined?: string;
  role?: string;
  student_info?: {
    student_code: string;
    classes_count: number;
  };
  teacher_info?: {
    teacher_code: string;
    classes_count: number;
  };
} 