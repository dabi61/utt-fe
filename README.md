# UTT School - Hệ thống quản lý trường học

Dự án quản lý trường học với đầy đủ các tính năng dành cho sinh viên, giáo viên và quản trị viên.

## Tính năng

- **Xác thực**: Đăng nhập, đăng ký, phân quyền
- **Hồ sơ người dùng**: Xem và cập nhật thông tin cá nhân
- **Quản lý lớp học**: Xem danh sách lớp, quản lý sinh viên và giáo viên trong lớp
- **Lịch học**: Xem lịch học theo lớp, giáo viên, sinh viên
- **Điểm danh**: Điểm danh sinh viên, xem báo cáo điểm danh
- **QR Code**: Tạo mã QR cho điểm danh

## Cấu trúc dự án

- `src/api`: Các hàm gọi API
- `src/components`: UI components
- `src/pages`: Các trang của ứng dụng
- `src/store`: Redux store và slices
- `src/types`: Định nghĩa các kiểu dữ liệu
- `src/utils`: Các hàm tiện ích
- `src/styles`: CSS và theme

## Cài đặt và chạy dự án

### Yêu cầu

- Node.js (v16+)
- npm hoặc yarn

### Backend (Django)

1. Di chuyển vào thư mục backend
   ```bash
   cd utt-be
   ```

2. Tạo và kích hoạt môi trường ảo
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```

3. Cài đặt dependencies
   ```bash
   pip install -r requirements.txt
   ```

4. Chạy migrations
   ```bash
   cd app
   python manage.py migrate
   ```

5. Khởi động server
   ```bash
   python manage.py runserver
   ```

### Frontend (React + TypeScript)

1. Di chuyển vào thư mục frontend
   ```bash
   cd utt-fe
   ```

2. Cài đặt dependencies
   ```bash
   npm install
   ```

3. Chạy ứng dụng ở chế độ development
   ```bash
   npm run dev
   ```

4. Build ứng dụng cho production
   ```bash
   npm run build
   ```

## API Endpoints

### Xác thực

- `POST /auth/jwt/create/`: Đăng nhập và tạo token
- `POST /auth/users/`: Đăng ký người dùng mới
- `POST /auth/jwt/refresh/`: Làm mới token
- `GET /auth/users/me/`: Lấy thông tin người dùng hiện tại

### Quản lý trường học

- `GET /api/school/classes/`: Lấy danh sách lớp học
- `GET /api/school/classes/{id}/`: Lấy chi tiết lớp học
- `GET /api/core/schedules/`: Lấy danh sách lịch học
- `GET /api/attendance/`: Lấy danh sách điểm danh
- `POST /api/attendance/`: Tạo điểm danh mới
- `PATCH /api/attendance/{id}/`: Cập nhật điểm danh

## Liên hệ

Nếu có vấn đề hoặc đề xuất cải thiện, vui lòng tạo issue trên repo này. 