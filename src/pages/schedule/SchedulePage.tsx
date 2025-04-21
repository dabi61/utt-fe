import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Grid, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Divider,
  Button,
  Alert
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getSchedulesFromQR, getStudentSchedules } from '../../api/scheduleApi';
import { styled } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RoomIcon from '@mui/icons-material/Room';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { UserRole } from '../../types';

// Các ngày trong tuần 
const WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

// Styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
}));

const ClassCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

interface AttendanceChipProps {
  attended: boolean;
}

const AttendanceChip = styled(Chip)<AttendanceChipProps>(({ theme, attended }) => ({
  backgroundColor: attended ? theme.palette.success.light : theme.palette.error.light,
  color: theme.palette.common.white,
  fontWeight: 'bold',
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
}));

interface Schedule {
  id: number | string;
  class_name: any; // Có thể là object hoặc string
  course_name?: {
    id: number;
    object_name: string;
  };
  room?: string;
  start_time?: string;
  end_time?: string;
  day_of_week?: number;
  is_active?: boolean;
  teacher?: {
    id: number;
    user?: {
      id: number;
      name: string;
    };
  };
  teacher_name?: string;
  subject?: string;
  attendance_history?: { date: string; attended: boolean }[];
  qr_code?: string;
}

// Lấy tên ngày trong tuần hiện tại
const getCurrentDayName = () => {
  return format(new Date(), 'EEEE', { locale: vi });
};

const SchedulePage = () => {
  const { authState } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  
  // Hàm chuẩn hóa dữ liệu lịch học
  const normalizeSchedule = (schedule: any): Schedule => {
    console.log('Đang chuẩn hóa dữ liệu lịch học:', schedule);
    
    // Xác định các giá trị mặc định cho các trường có thể thiếu
    const normalizedSchedule = {
      id: schedule.id || schedule._id || Math.random().toString(36).substring(7),
      class_name: schedule.course_name || schedule.course || 'Chưa có môn học',
      room: schedule.room_name || schedule.room || 'Chưa có phòng',
      teacher_name: schedule.teacher_name,
      start_time: schedule.start_time || schedule.time_start || '00:00',
      end_time: schedule.end_time || schedule.time_end || '00:00',
      subject:  typeof schedule.class_name === 'object' 
      ? schedule.class_name?.class_name || 'Chưa có tên lớp'
      : schedule.class_name || 'Chưa có tên lớp',
      day_of_week: schedule.day_of_week !== undefined 
        ? schedule.day_of_week 
        : (schedule.weekday !== undefined ? schedule.weekday : new Date().getDay()),
      is_active: schedule.is_active !== false, // Nếu không có giá trị, coi như là active
      attendance_history: Array.isArray(schedule.attendance_history) 
        ? schedule.attendance_history 
        : []
    };
    
    console.log('Kết quả chuẩn hóa:', normalizedSchedule);
    return normalizedSchedule;
  };

  // Lấy dữ liệu lịch học
  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let scheduleData: any[] = [];
        const token = authState?.token;
        
        if (token) {
          try {
            console.log('Đang lấy dữ liệu từ API QR...');
            // Lịch học từ API QR (đã được lọc theo ngày hiện tại trong API)
            const qrSchedules = await getSchedulesFromQR(token);
            console.log('Dữ liệu từ QR API:', qrSchedules);
            scheduleData = qrSchedules;
          } catch (qrError) {
            console.error('Lỗi khi lấy từ QR API:', qrError);
            
            try {
              // Thử lấy từ API sinh viên nếu lỗi QR API
              console.log('Đang lấy từ API sinh viên...');
              const studentSchedules = await getStudentSchedules();
              console.log('Dữ liệu từ API sinh viên:', studentSchedules);
              scheduleData = studentSchedules;
            } catch (studentError) {
              console.error('Lỗi khi lấy từ API sinh viên:', studentError);
              
              // Nếu cả hai API đều lỗi, tạo dữ liệu giả để demo
              if (scheduleData.length === 0) {
                console.log('Không lấy được dữ liệu từ API, sử dụng dữ liệu mẫu');
                scheduleData = createMockSchedules();
              }
            }
          }
        } else {
          console.log('Không có token, sử dụng dữ liệu mẫu');
          scheduleData = createMockSchedules();
        }
        
        // Chuẩn hóa dữ liệu lịch học
        const normalizedSchedules = Array.isArray(scheduleData) 
          ? scheduleData.map(normalizeSchedule) 
          : [];
          
        console.log(`Đã chuẩn hóa ${normalizedSchedules.length} lịch học`);
        setSchedules(normalizedSchedules);
        
        // Lọc lịch học cho ngày hiện tại
        const currentDayOfWeek = new Date().getDay();
        const currentSchedules = normalizedSchedules.filter(
          (schedule) => schedule.day_of_week === currentDayOfWeek && schedule.is_active
        );
        
        console.log(`Hôm nay (${getCurrentDayName()}) có ${currentSchedules.length} lịch học`);
        setTodaySchedules(currentSchedules);
      } catch (err) {
        console.error('Lỗi khi lấy lịch học:', err);
        setError('Không thể lấy dữ liệu lịch học. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [authState?.token]);

  // Tạo dữ liệu mẫu nếu không có dữ liệu từ API
  const createMockSchedules = (): any[] => {
    const currentDay = new Date().getDay();
    return [
      {
        id: '1',
        class_name: 'Lập trình web',
        room: 'A101',
        teacher_name: 'Nguyễn Văn A',
        start_time: '08:00',
        end_time: '10:00',
        subject: 'Web Development',
        day_of_week: currentDay,
        is_active: true,
        attendance_history: [
          { date: '2023-09-01', attended: true },
          { date: '2023-09-08', attended: false }
        ]
      },
      {
        id: '2',
        class_name: 'Cơ sở dữ liệu',
        room: 'B203',
        teacher_name: 'Trần Thị B',
        start_time: '13:30',
        end_time: '15:30',
        subject: 'Database',
        day_of_week: currentDay,
        is_active: true,
        attendance_history: []
      }
    ];
  };

  // Hiển thị lịch học cho ngày hôm nay
  const renderTodaySchedules = () => {
    if (todaySchedules.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          Không có lịch học nào vào hôm nay ({getCurrentDayName()})
        </Alert>
      );
    }

    return todaySchedules.map((schedule) => (
      <Paper
        key={schedule.id}
        elevation={2}
        sx={{
          p: 2,
          mb: 2,
          borderLeft: '4px solid #1976d2',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 4
          }
        }}
      >
        <Typography variant="h6" color="primary">
          {typeof schedule.class_name === 'object' ? schedule.class_name?.class_name : schedule.class_name}
        </Typography>
        <Typography variant="body1">{schedule.subject || 'Không có thông tin môn học'}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="body2">
            <strong>Phòng:</strong> {schedule.room}
          </Typography>
          <Typography variant="body2">
            <strong>Giáo viên:</strong> {schedule.teacher_name || schedule.teacher?.user?.name || 'Chưa phân công'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="body2">
            <strong>Thời gian:</strong> {schedule.start_time} - {schedule.end_time}
          </Typography>
          {authState?.user?.role === UserRole.STUDENT && (
            <Chip
              label={(schedule.attendance_history?.length || 0) > 0 ? "Đã điểm danh" : "Chưa điểm danh"}
              color={(schedule.attendance_history?.length || 0) > 0 ? "success" : "warning"}
              size="small"
            />
          )}
        </Box>
        
        {/* Hiển thị lịch sử điểm danh */}
        {schedule.attendance_history && schedule.attendance_history.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2">
              <strong>Lịch sử điểm danh:</strong>
            </Typography>
            {renderAttendanceHistory(schedule.attendance_history)}
          </Box>
        )}
        
        {/* Hiển thị mã QR cho giáo viên */}
        {authState?.user?.role === UserRole.TEACHER && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Paper elevation={1} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>
                Mã QR điểm danh
              </Typography>
              <Box sx={{ bgcolor: '#fff', p: 1 }}>
                {/* Giả lập hình ảnh QR */}
                <Box
                  sx={{
                    width: 150,
                    height: 150,
                    bgcolor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  QR: {schedule.id}
                </Box>
              </Box>
            </Paper>
          </Box>
        )}
      </Paper>
    ));
  };

  // Hiển thị lịch sử điểm danh
  const renderAttendanceHistory = (history: { date: string; attended: boolean }[]) => {
    return (
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Ngày học</StyledTableCell>
              <StyledTableCell>Trạng thái</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((status, index) => (
              <TableRow 
                key={`${status.date}-${index}`}
                sx={{ 
                  backgroundColor: status.attended ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'
                }}
              >
                <TableCell>{new Date(status.date).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell>
                  <AttendanceChip 
                    attended={status.attended}
                    label={status.attended ? 'Có mặt' : 'Vắng mặt'} 
                    size="small"
                    data-attended={status.attended.toString()}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Đang tải lịch học...
        </Typography>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Lịch học hôm nay
      </Typography>
      <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
        {getCurrentDayName()}, {format(new Date(), 'dd/MM/yyyy')}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : (
        <Box sx={{ mt: 3 }}>
          {renderTodaySchedules()}
        </Box>
      )}
    </Box>
  );
};

export default SchedulePage; 