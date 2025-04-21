import axios from 'axios';
import { JWT_CONFIG } from '../config';
import api from './instance';

const API_URL = '/qr/schedules/';

// Hàm trợ giúp tạo header với token JWT
const createAuthHeader = (token?: string) => {
  const authToken = token || localStorage.getItem(JWT_CONFIG.tokenStorageName);
  return {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  };
};

// Lấy danh sách lịch học từ API QR
export const getSchedulesFromQR = async (token: string) => {
  try {
    console.log('Đang lấy lịch học từ API QR...', token ? 'Có token' : 'Không có token');
    
    // Sử dụng instance API đã được cấu hình
    const response = await api.get('/api/qr/schedules/');
    console.log('Lấy lịch học từ API QR thành công - RAW DATA:', JSON.stringify(response.data));
    
    // Kiểm tra cấu trúc dữ liệu
    if (Array.isArray(response.data)) {
      console.log('Dữ liệu là mảng với', response.data.length, 'phần tử');
      if (response.data.length > 0) {
        console.log('Mẫu phần tử đầu tiên:', JSON.stringify(response.data[0]));
        
        // Kiểm tra các trường cần thiết
        const firstItem = response.data[0];
        console.log('class_name có tồn tại?', !!firstItem.class_name);
        console.log('day_of_week hoặc weekday?', !!firstItem.day_of_week || !!firstItem.weekday);
        console.log('start_time hoặc time_start?', !!firstItem.start_time || !!firstItem.time_start);
      }
      
      // Lọc dữ liệu theo ngày hiện tại và trạng thái active
      const currentDayOfWeek = new Date().getDay();
      const filteredData = response.data.filter((item: any) => {
        const dayOfWeek = item.day_of_week ?? item.weekday ?? (typeof item.day === 'number' ? item.day : -1);
        const isActive = item.is_active !== false; // Coi null/undefined là active
        return dayOfWeek === currentDayOfWeek && isActive;
      });
      
      console.log(`Đã lọc ${filteredData.length}/${response.data.length} lịch học cho ngày hiện tại và active`);
      
      // Nếu không có dữ liệu sau khi lọc, sử dụng tất cả dữ liệu
      if (filteredData.length === 0) {
        console.log('Không có lịch học nào cho ngày hiện tại, trả về tất cả lịch học');
        return response.data;
      }
      
      return filteredData;
    } else {
      console.log('Dữ liệu không phải là mảng, tạo dữ liệu mẫu');
      // Tạo dữ liệu mẫu
      return createMockSchedules();
    }
  } catch (error) {
    console.error('Lỗi khi lấy lịch học từ API QR:', error);
    // Tạo dữ liệu mẫu khi có lỗi
    return createMockSchedules();
  }
};

// Hàm tạo dữ liệu mẫu khi API không khả dụng
const createMockSchedules = () => {
  const today = new Date();
  const currentDay = today.getDay();
  
  return [
    {
      id: 1,
      class_name: { id: 101, class_name: 'Lập trình web nâng cao' },
      course_name: { id: 201, object_name: 'Công nghệ web' },
      room: 'A101',
      start_date: new Date(today.getTime() + 86400000).toISOString(), // Ngày mai
      end_date: new Date(today.getTime() + 7776000000).toISOString(), // 90 ngày sau
      start_time: '08:00',
      end_time: '10:00',
      day_of_week: currentDay,
      teacher: { id: 301, user: { id: 401, name: 'Nguyễn Văn A' } },
      is_active: true
    },
    {
      id: 2,
      class_name: { id: 102, class_name: 'Cơ sở dữ liệu' },
      course_name: { id: 202, object_name: 'Hệ quản trị CSDL' },
      room: 'B203',
      start_date: new Date(today.getTime() + 172800000).toISOString(), // 2 ngày sau
      end_date: new Date(today.getTime() + 7862400000).toISOString(), // 91 ngày sau
      start_time: '13:00',
      end_time: '15:00',
      day_of_week: currentDay, // Hôm nay
      teacher: { id: 302, user: { id: 402, name: 'Trần Thị B' } },
      is_active: true
    }
  ];
};

// Lấy danh sách lịch học
export const getSchedules = async (token: string) => {
  const response = await api.get(`${API_URL}/schedules/`);
  return response.data;
};

// Lấy lịch học theo ID
export const getScheduleById = async (token: string, scheduleId: number) => {
  const response = await api.get(`${API_URL}/schedules/${scheduleId}/`);
  return response.data;
};

// Lấy QR code cho lịch học
export const getScheduleQR = async (token: string, scheduleId: number) => {
  const response = await api.get(`/api/qr/generate/${scheduleId}/`);
  return response.data;
};

// Lấy lịch học của giáo viên
export const getTeacherSchedules = async (token: string) => {
  // Danh sách các đường dẫn API có thể cho lịch học giáo viên
  const possibleEndpoints = [
    `${API_URL}/schedules/teacher/`,
    `${API_URL}/my_schedules/`,
    `/api/teacher/schedules/`,
    `${API_URL}/teacher/schedules/`,
    `/api/schedules/teacher/`,
    `/api/teacher-schedules/`,
    `${API_URL}/teachers/schedules/`
  ];

  // Dữ liệu mẫu an toàn để sử dụng khi tất cả API đều thất bại
  const fallbackData = [
    {
      id: 1,
      class_name: { id: 101, class_name: 'Lập trình web nâng cao' },
      course_name: { id: 201, object_name: 'Công nghệ web' },
      room: 'A201',
      start_date: new Date(Date.now() + 86400000).toISOString(),
      end_date: new Date(Date.now() + 7776000000).toISOString(),
      start_time: '13:00',
      end_time: '15:00',
      day_of_week: new Date().getDay() + 1,
      teacher: { id: 301, user: { id: 401, name: 'Nguyễn Văn A' } }
    }
  ];

  // Thử từng endpoint cho đến khi tìm thấy một endpoint hoạt động
  for (const endpoint of possibleEndpoints) {
    try {
      console.log(`Đang thử lấy lịch học giáo viên từ endpoint: ${endpoint}`);
      const response = await api.get(endpoint);
      if (response.status === 200) {
        console.log(`Tìm thấy API lịch học giáo viên thành công tại: ${endpoint}`);
        return response.data;
      }
    } catch (error) {
      // Tiếp tục thử endpoint tiếp theo
      continue;
    }
  }

  // Nếu không có endpoint nào hoạt động, log lỗi và trả về dữ liệu mẫu
  console.error('Không thể tìm thấy API lịch học giáo viên nào hoạt động.');
  console.log('Sử dụng dữ liệu mẫu cho lịch học giáo viên...');
  return fallbackData;
};

// Lấy lịch học của sinh viên
export const getStudentSchedules = async (token?: string) => {
  try {
    console.log('Đang thử lấy lịch học từ API QR...');
    const response = await api.get('/api/qr/schedules/');
    console.log('Lấy lịch học từ API QR thành công', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy lịch học từ API QR, thử API dự phòng:', error);
    
    try {
      console.log('Đang thử lấy lịch học từ API my_classes...');
      const response = await api.get('/api/school/students/my_classes/');
      console.log('Lấy lịch học từ API my_classes thành công');
      return response.data;
    } catch (fallbackError) {
      console.error('Tất cả API lịch học đều thất bại:', fallbackError);
      
      // Dữ liệu mẫu an toàn để sử dụng khi tất cả API đều thất bại
      const today = new Date();
      const mockData = [
        {
          id: 1,
          class_name: { id: 101, class_name: 'Lập trình web nâng cao' },
          course_name: { id: 201, object_name: 'Công nghệ web' },
          room: 'A101',
          start_date: new Date(today.getTime() + 86400000).toISOString(),
          end_date: new Date(today.getTime() + 7776000000).toISOString(),
          start_time: '08:00',
          end_time: '10:00',
          day_of_week: today.getDay(),
          teacher: { id: 301, user: { id: 401, name: 'Nguyễn Văn A' } }
        },
        {
          id: 2,
          class_name: { id: 102, class_name: 'Cơ sở dữ liệu' },
          course_name: { id: 202, object_name: 'Hệ quản trị CSDL' },
          room: 'B203',
          start_date: new Date(today.getTime() + 172800000).toISOString(),
          end_date: new Date(today.getTime() + 7862400000).toISOString(),
          start_time: '13:00',
          end_time: '15:00',
          day_of_week: (today.getDay() + 1) % 7,
          teacher: { id: 302, user: { id: 402, name: 'Trần Thị B' } }
        }
      ];
      
      console.log('Sử dụng dữ liệu mẫu cho lịch học...', mockData);
      return mockData;
    }
  }
}; 