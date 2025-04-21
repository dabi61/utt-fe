import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  CircularProgress,
  useTheme,
  alpha,
  LinearProgress,
  Stack,
  IconButton
} from '@mui/material';
import {
  PeopleOutlined as PeopleIcon,
  SchoolOutlined as SchoolIcon,
  CalendarMonthOutlined as CalendarIcon,
  AssignmentOutlined as AssignmentIcon,
  EventNoteOutlined as EventNoteIcon,
  AccessTimeOutlined as TimeIcon,
  LocationOnOutlined as LocationIcon,
  BookOutlined as BookIcon,
  CheckCircleOutline as CheckIcon,
  ErrorOutline as ErrorIcon,
  GroupOutlined as ClassIcon,
  NotificationsOutlined as NotificationIcon,
  TrendingUpOutlined as TrendingUpIcon,
  RefreshOutlined as RefreshIcon,
  ArrowForwardOutlined as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { selectAuth } from '../../store/slices/authSlice';
import * as scheduleApi from '../../api/scheduleApi';
import * as classApi from '../../api/classApi';
import * as attendanceApi from '../../api/attendanceApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Định nghĩa interface dữ liệu
interface ClassData {
  id: number;
  class_code: string;
  class_name: string;
  students_count: number;
  teachers_count: number;
}

interface ScheduleData {
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

interface AttendanceData {
  id: number;
  schedule: number;
  status: string;
  check_in_time: string | null;
  date: string;
}

const DashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector(selectAuth);
  
  // State để lưu trữ dữ liệu
  const [loading, setLoading] = useState({
    classes: false,
    schedules: false,
    attendance: false,
  });
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [attendance, setAttendance] = useState<AttendanceData[]>([]);
  const [stats, setStats] = useState({
    totalClasses: 0,
    upcomingSchedules: 0,
    attendanceRate: 0,
    completedCourses: 0
  });

  // Thêm state kiểm tra trạng thái API
  const [apiStatus, setApiStatus] = useState({
    classes: { online: true, message: '' },
    schedules: { online: true, message: '' },
    attendance: { online: true, message: '' }
  });

  // Kiểm tra trạng thái kết nối API
  const isAllOnline = useMemo(() => {
    return apiStatus.classes.online && apiStatus.schedules.online && apiStatus.attendance.online;
  }, [apiStatus]);

  // Hàm lấy danh sách lớp học theo vai trò người dùng
  const fetchClasses = async () => {
    try {
      setLoading(prev => ({ ...prev, classes: true }));
      
      let response;
      try {
        if (user?.role === 'teacher') {
          response = await classApi.getTeacherClasses(token || '');
        } else {
          response = await classApi.getStudentClasses(token || '');
        }
        
        setClasses(response || []);
        setStats(prev => ({ ...prev, totalClasses: response?.length || 0 }));
        setApiStatus(prev => ({
          ...prev,
          classes: { online: true, message: '' }
        }));
      } catch (error) {
        console.error('Lỗi kết nối API lớp học:', error);
        setApiStatus(prev => ({
          ...prev,
          classes: { 
            online: false, 
            message: 'Không thể kết nối đến server. Vui lòng thử lại sau.' 
          }
        }));
        
        // Dữ liệu mẫu nếu API không khả dụng
        const mockClasses: ClassData[] = [
          { id: 1, class_code: 'CS101', class_name: 'Nhập môn lập trình', students_count: 30, teachers_count: 2 },
          { id: 2, class_code: 'CS201', class_name: 'Cấu trúc dữ liệu', students_count: 25, teachers_count: 1 },
          { id: 3, class_code: 'CS301', class_name: 'Database', students_count: 28, teachers_count: 2 }
        ];
        setClasses(mockClasses);
        setStats(prev => ({ ...prev, totalClasses: mockClasses.length }));
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách lớp học:', error);
    } finally {
      setLoading(prev => ({ ...prev, classes: false }));
    }
  };

  // Hàm lấy lịch học theo vai trò người dùng
  const fetchSchedules = async () => {
    try {
      setLoading(prev => ({ ...prev, schedules: true }));
      
      try {
        let response;
        if (user?.role === 'teacher') {
          response = await scheduleApi.getTeacherSchedules(token || '');
        } else {
          // Thử API schedules trước
          console.log('Thử lấy lịch học từ API QR...');
          try {
            response = await scheduleApi.getSchedulesFromQR(token || '');
            console.log('Lấy dữ liệu thành công từ API QR:', response);
          } catch (qrError) {
            console.error('Lỗi khi lấy từ API QR, thử dùng API thường:', qrError);
            response = await scheduleApi.getStudentSchedules(token || '');
          }
        }
        
        if (response && Array.isArray(response) && response.length > 0) {
          console.log('Dữ liệu lịch học hợp lệ:', response.length, 'phần tử');
          setSchedules(response);
          
          // Tính số lịch học sắp tới
          const now = new Date();
          const upcoming = response?.filter((schedule: ScheduleData) => {
            const scheduleDate = new Date(schedule.start_date);
            return scheduleDate > now;
          });
          
          setStats(prev => ({ ...prev, upcomingSchedules: upcoming?.length || 0 }));
          setApiStatus(prev => ({
            ...prev,
            schedules: { online: true, message: '' }
          }));
        } else {
          console.log('API trả về dữ liệu không hợp lệ hoặc rỗng:', response);
          throw new Error('Không có dữ liệu lịch học hoặc dữ liệu không hợp lệ');
        }
      } catch (apiError) {
        console.error('Lỗi kết nối API lịch học:', apiError);
        setApiStatus(prev => ({
          ...prev,
          schedules: { 
            online: false, 
            message: 'Không thể kết nối đến server hoặc không có dữ liệu. Đang sử dụng dữ liệu mẫu.' 
          }
        }));
        
        // Dữ liệu mẫu nếu API không khả dụng
        const today = new Date();
        const weekdays = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
        const currentDayNumber = today.getDay();
        
        const mockSchedules: ScheduleData[] = [
          {
            id: 1,
            class_name: { id: 101, class_name: 'Lập trình web nâng cao' },
            course_name: { id: 201, object_name: 'Công nghệ web' },
            room: 'A101',
            start_date: new Date(today.getTime() + 86400000).toISOString(), // Ngày mai
            end_date: new Date(today.getTime() + 7776000000).toISOString(), // 90 ngày sau
            start_time: '08:00',
            end_time: '10:00',
            day_of_week: currentDayNumber,
            teacher: { id: 301, user: { id: 401, name: 'Nguyễn Văn A' } }
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
            day_of_week: (currentDayNumber + 1) % 7,
            teacher: { id: 302, user: { id: 402, name: 'Trần Thị B' } }
          },
          {
            id: 3,
            class_name: { id: 103, class_name: 'Trí tuệ nhân tạo' },
            course_name: { id: 203, object_name: 'AI và machine learning' },
            room: 'C305',
            start_date: new Date(today.getTime() + 259200000).toISOString(), // 3 ngày sau
            end_date: new Date(today.getTime() + 7948800000).toISOString(), // 92 ngày sau
            start_time: '15:00',
            end_time: '17:00',
            day_of_week: (currentDayNumber + 2) % 7,
            teacher: { id: 303, user: { id: 403, name: 'Lê Văn C' } }
          }
        ];
        
        setSchedules(mockSchedules);
        setStats(prev => ({ ...prev, upcomingSchedules: mockSchedules.length }));
      }
    } catch (error) {
      console.error('Lỗi tổng thể khi lấy lịch học:', error);
    } finally {
      setLoading(prev => ({ ...prev, schedules: false }));
    }
  };

  // Lấy thông tin điểm danh
  const fetchAttendance = async () => {
    try {
      setLoading(prev => ({ ...prev, attendance: true }));
      
      try {
        // Sử dụng API thực tế để lấy dữ liệu điểm danh
        const response = await attendanceApi.getAttendances(token || '');
        
        // Xác thực định dạng dữ liệu trả về và xử lý nếu cần
        const fetchedAttendance = Array.isArray(response) ? response : [];
        
        setAttendance(fetchedAttendance);
        
        // Tính tỷ lệ điểm danh
        const presentCount = fetchedAttendance.filter(a => a.status === 'present').length;
        const attendanceRate = fetchedAttendance.length > 0 
          ? (presentCount / fetchedAttendance.length) * 100 
          : 0;
        
        setStats(prev => ({ 
          ...prev, 
          attendanceRate: Math.round(attendanceRate),
          completedCourses: fetchedAttendance.length > 0 
            ? Math.min(Math.floor(fetchedAttendance.length / 4), 5) // Tạm tính số khóa học dựa trên số lượng điểm danh
            : 0
        }));
        
        setApiStatus(prev => ({
          ...prev,
          attendance: { online: true, message: '' }
        }));
      } catch (error) {
        console.error('API điểm danh không khả dụng, sử dụng dữ liệu mẫu:', error);
        setApiStatus(prev => ({
          ...prev,
          attendance: { 
            online: false, 
            message: 'Không thể kết nối đến server. Vui lòng thử lại sau.' 
          }
        }));
        
        // Sử dụng dữ liệu mẫu nếu API không khả dụng
        const mockAttendance: AttendanceData[] = [
          { id: 1, schedule: 1, status: 'present', check_in_time: '08:05:00', date: '2023-09-01' },
          { id: 2, schedule: 2, status: 'present', check_in_time: '13:02:00', date: '2023-09-02' },
          { id: 3, schedule: 3, status: 'absent', check_in_time: null, date: '2023-09-03' },
          { id: 4, schedule: 4, status: 'present', check_in_time: '08:10:00', date: '2023-09-04' },
        ];
        
        setAttendance(mockAttendance);
        
        // Tính tỷ lệ điểm danh từ dữ liệu mẫu
        const presentCount = mockAttendance.filter(a => a.status === 'present').length;
        const attendanceRate = (presentCount / mockAttendance.length) * 100;
        
        setStats(prev => ({ 
          ...prev, 
          attendanceRate: Math.round(attendanceRate),
          completedCourses: 2 // Giả định số khóa học đã hoàn thành
        }));
      }
    } catch (error) {
      console.error('Lỗi khi lấy điểm danh:', error);
    } finally {
      setLoading(prev => ({ ...prev, attendance: false }));
    }
  };

  // Chạy các hàm lấy dữ liệu khi component mount
  useEffect(() => {
    if (token) {
      fetchClasses();
      fetchSchedules();
      fetchAttendance();
    }
  }, [token, user]);

  // Lấy tên ngày trong tuần
  const getDayName = (day: number) => {
    const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    return days[day % 7];
  };

  // Lấy lịch học sắp tới gần nhất
  const getUpcomingSchedules = () => {
    const now = new Date();
    return schedules
      .filter(schedule => new Date(schedule.start_date) >= now)
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .slice(0, 3);
  };

  // Lấy điểm danh gần đây nhất
  const getRecentAttendance = () => {
    return attendance
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  // Format ngày giờ
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
    } catch (e) {
      return dateString;
    }
  };

  // Tạo màu ngẫu nhiên từ theme
  const getRandomColor = (index: number) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.info.main
    ];
    return colors[index % colors.length];
  };

  return (
    <Container maxWidth="lg">
      {!isAllOnline && (
        <Box mb={3} p={2} sx={{ 
          bgcolor: alpha(theme.palette.warning.main, 0.1),
          borderRadius: 2,
          border: `1px solid ${theme.palette.warning.main}`
        }}>
          <Typography sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: theme.palette.warning.dark,
            fontWeight: 'bold'
          }}>
            <ErrorIcon sx={{ mr: 1 }} />
            Một số dữ liệu hiển thị có thể không cập nhật do lỗi kết nối server
          </Typography>
        </Box>
      )}
      
      {/* Hero section */}
      <Paper 
        elevation={0}
        sx={{ 
          mb: 4, 
          p: 3, 
          borderRadius: 4,
          background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '-30%', 
            right: '-10%', 
            width: '300px', 
            height: '300px', 
            borderRadius: '50%', 
            background: alpha('#fff', 0.05),
            zIndex: 0
          }} 
        />
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: '-20%', 
            left: '10%', 
            width: '200px', 
            height: '200px', 
            borderRadius: '50%', 
            background: alpha('#fff', 0.05),
            zIndex: 0
          }} 
        />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" fontWeight={700} color="white" gutterBottom>
                Xin chào, {user?.name || 'Học viên'}!
              </Typography>
              <Typography variant="subtitle1" color="white" sx={{ opacity: 0.85, mb: 2 }}>
                {format(new Date(), "EEEE, dd MMMM yyyy", { locale: vi })}
              </Typography>
              <Typography variant="body1" color="white" sx={{ opacity: 0.85, mb: 3 }}>
                Chào mừng bạn đến với hệ thống quản lý UTT School. Đây là trang tổng quan giúp bạn theo dõi lịch học, điểm danh và các thông tin quan trọng.
              </Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  fontWeight: 'bold', 
                  borderRadius: 2,
                  px: 3 
                }}
                onClick={() => navigate('/schedule')}
              >
                Xem lịch học
              </Button>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box 
                sx={{ 
                  width: '100%',
                  height: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Box 
                  component="img"
                  src="/assets/calendar-illustration.png"
                  alt="Calendar Illustration"
                  sx={{ 
                    maxWidth: '80%',
                    maxHeight: '80%',
                    display: 'block',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0px 5px 15px rgba(0,0,0,0.2))'
                  }}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    // Fallback nếu hình ảnh không tồn tại
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Dashboard stats */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight={600}>
            Tổng quan
          </Typography>
          <IconButton 
            onClick={() => {
              fetchClasses();
              fetchSchedules();
              fetchAttendance();
            }}
            size="small"
            sx={{ color: theme.palette.primary.main }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                height: '100%',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                borderRadius: 3,
                transition: 'all 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                }
              }}
              onClick={() => navigate('/classes')}
            >
              <CardContent>
                <Stack spacing={1}>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1), 
                      color: theme.palette.primary.main,
                      width: 48,
                      height: 48
                    }}
                  >
                    <ClassIcon />
                  </Avatar>
                  
                  <Typography variant="body2" color="text.secondary">
                    Lớp học
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                    <Typography variant="h4" component="div" fontWeight="bold" color={theme.palette.primary.main}>
                      {loading.classes ? (
                        <Box sx={{ width: '60px', mt: 1 }}>
                          <LinearProgress />
                        </Box>
                      ) : stats.totalClasses}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      lớp
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <PeopleIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                    {classes.reduce((sum, c) => sum + c.students_count, 0)} sinh viên
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                height: '100%',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                borderRadius: 3,
                transition: 'all 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                }
              }}
              onClick={() => navigate('/schedule')}
            >
              <CardContent>
                <Stack spacing={1}>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.secondary.main, 0.1), 
                      color: theme.palette.secondary.main,
                      width: 48,
                      height: 48
                    }}
                  >
                    <CalendarIcon />
                  </Avatar>
                  
                  <Typography variant="body2" color="text.secondary">
                    Lịch sắp tới
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                    <Typography variant="h4" component="div" fontWeight="bold" color={theme.palette.secondary.main}>
                      {loading.schedules ? (
                        <Box sx={{ width: '60px', mt: 1 }}>
                          <LinearProgress />
                        </Box>
                      ) : stats.upcomingSchedules}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      buổi
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimeIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                    {getUpcomingSchedules()[0]?.start_date 
                      ? `Gần nhất: ${formatDate(getUpcomingSchedules()[0].start_date)}`
                      : 'Không có lịch sắp tới'}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                height: '100%',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                borderRadius: 3,
                transition: 'all 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                }
              }}
              onClick={() => navigate('/attendance')}
            >
              <CardContent>
                <Stack spacing={1}>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.success.main, 0.1), 
                      color: theme.palette.success.main,
                      width: 48,
                      height: 48
                    }}
                  >
                    <AssignmentIcon />
                  </Avatar>
                  
                  <Typography variant="body2" color="text.secondary">
                    Điểm danh
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                    <Typography variant="h4" component="div" fontWeight="bold" color={theme.palette.success.main}>
                      {loading.attendance ? (
                        <Box sx={{ width: '60px', mt: 1 }}>
                          <LinearProgress />
                        </Box>
                      ) : `${stats.attendanceRate}%`}
                    </Typography>
                  </Box>

                  <Box sx={{ width: '100%', mt: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.attendanceRate} 
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette.success.main, 0.2),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: theme.palette.success.main
                        }
                      }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                height: '100%',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                borderRadius: 3,
                transition: 'all 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                }
              }}
              onClick={() => navigate('/classes')}
            >
              <CardContent>
                <Stack spacing={1}>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.warning.main, 0.1), 
                      color: theme.palette.warning.main,
                      width: 48,
                      height: 48
                    }}
                  >
                    <BookIcon />
                  </Avatar>
                  
                  <Typography variant="body2" color="text.secondary">
                    Khóa học
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                    <Typography variant="h4" component="div" fontWeight="bold" color={theme.palette.warning.main}>
                      {loading.attendance ? (
                        <Box sx={{ width: '60px', mt: 1 }}>
                          <LinearProgress />
                        </Box>
                      ) : stats.completedCourses}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      hoàn thành
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                    Hoàn thành tốt
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Nội dung chính */}
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={7} lg={8}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 3,
              boxShadow: '0 2px 15px rgba(0,0,0,0.06)',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              px: 3, 
              py: 2, 
              bgcolor: alpha(theme.palette.primary.main, 0.03), 
              borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <Box display="flex" alignItems="center">
                <CalendarIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6" fontWeight="600">
                  Lịch học sắp tới
                </Typography>
              </Box>
              <Button 
                variant="outlined"
                size="small" 
                color="primary" 
                onClick={() => navigate('/schedule')}
                endIcon={<ArrowForwardIcon />}
                sx={{ fontWeight: 'bold', borderRadius: 2 }}
              >
                Xem tất cả
              </Button>
            </Box>
            
            {loading.schedules ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : getUpcomingSchedules().length > 0 ? (
              <List sx={{ p: 0 }}>
                {getUpcomingSchedules().map((schedule, index) => (
                  <React.Fragment key={schedule.id}>
                    <ListItem 
                      sx={{ 
                        px: 3, 
                        py: 2.5,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.02),
                        }
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        width: '100%' 
                      }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: getRandomColor(index),
                            width: 50,
                            height: 50,
                            mr: 2
                          }}
                        >
                          <EventNoteIcon />
                        </Avatar>
                        
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="subtitle1" fontWeight="600">
                              {schedule.course_name.object_name}
                            </Typography>
                            <Chip 
                              label={formatDate(schedule.start_date)} 
                              size="small"
                              sx={{ 
                                ml: 2,
                                bgcolor: alpha(theme.palette.primary.main, 0.1), 
                                color: theme.palette.primary.main,
                                fontWeight: 'bold',
                                borderRadius: 2
                              }} 
                            />
                          </Box>
                          
                          <Grid container spacing={1} mt={0.5}>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TimeIcon sx={{ mr: 0.5, fontSize: '0.9rem', color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {schedule.start_time} - {schedule.end_time}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarIcon sx={{ mr: 0.5, fontSize: '0.9rem', color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {getDayName(schedule.day_of_week)}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocationIcon sx={{ mr: 0.5, fontSize: '0.9rem', color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  Phòng {schedule.room}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PeopleIcon sx={{ mr: 0.5, fontSize: '0.9rem', color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  Lớp: {schedule.class_name.class_name}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <SchoolIcon sx={{ mr: 0.5, fontSize: '0.9rem', color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              GV: {schedule.teacher.user.name}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </ListItem>
                    {index < getUpcomingSchedules().length - 1 && <Divider sx={{ opacity: 0.5 }} />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <CalendarIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.2), mb: 2 }} />
                <Typography variant="body1" color="textSecondary">
                  Không có lịch học sắp tới
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Bạn đã hoàn thành tất cả lịch học hoặc chưa được phân lịch
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
        
        <Grid item xs={12} md={5} lg={4}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 3,
              boxShadow: '0 2px 15px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ 
              px: 3, 
              py: 2, 
              bgcolor: alpha(theme.palette.secondary.main, 0.03), 
              borderBottom: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <Box display="flex" alignItems="center">
                <AssignmentIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                <Typography variant="h6" fontWeight="600">
                  Điểm danh gần đây
                </Typography>
              </Box>
              <Button 
                variant="outlined"
                size="small" 
                color="secondary" 
                onClick={() => navigate('/attendance')}
                endIcon={<ArrowForwardIcon />}
                sx={{ fontWeight: 'bold', borderRadius: 2 }}
              >
                Xem tất cả
              </Button>
            </Box>
            
            {loading.attendance ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : getRecentAttendance().length > 0 ? (
              <List sx={{ p: 0, flexGrow: 1 }}>
                {getRecentAttendance().map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem 
                      sx={{ 
                        px: 3, 
                        py: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.secondary.main, 0.02),
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: item.status === 'present' 
                              ? alpha(theme.palette.success.main, 0.1) 
                              : alpha(theme.palette.error.main, 0.1),
                            color: item.status === 'present' 
                              ? theme.palette.success.main 
                              : theme.palette.error.main,
                            mr: 2,
                            width: 44,
                            height: 44
                          }}
                        >
                          {item.status === 'present' ? <CheckIcon /> : <ErrorIcon />}
                        </Avatar>
                        
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="subtitle1" fontWeight="600">
                              {item.status === 'present' ? 'Có mặt' : 'Vắng mặt'}
                            </Typography>
                            <Chip 
                              label={item.status === 'present' ? 'Có mặt' : 'Vắng mặt'} 
                              color={item.status === 'present' ? 'success' : 'error'}
                              size="small"
                              sx={{ borderRadius: 2 }}
                            />
                          </Box>
                          
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Ngày: {formatDate(item.date)}
                            </Typography>
                            {item.check_in_time && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Thời gian điểm danh: {item.check_in_time}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </ListItem>
                    {index < getRecentAttendance().length - 1 && <Divider sx={{ opacity: 0.5 }} />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <AssignmentIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.2), mb: 2 }} />
                <Typography variant="body1" color="textSecondary">
                  Không có dữ liệu điểm danh
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Bạn chưa có lịch sử điểm danh nào
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Thông tin lớp học */}
      <Grid container spacing={3} mt={3}>
        <Grid item xs={12}>
          <Card 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 2px 15px rgba(0,0,0,0.06)',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              px: 3, 
              py: 2, 
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <Box display="flex" alignItems="center">
                <SchoolIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6" fontWeight="600">
                  Lớp học của bạn
                </Typography>
              </Box>
              <Button 
                variant="outlined"
                size="small" 
                color="primary" 
                onClick={() => navigate('/classes')}
                endIcon={<ArrowForwardIcon />}
                sx={{ fontWeight: 'bold', borderRadius: 2 }}
              >
                Xem tất cả
              </Button>
            </Box>
            
            {loading.classes ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : classes.length > 0 ? (
              <Grid container spacing={0}>
                {classes.slice(0, 3).map((classItem, index) => (
                  <Grid item xs={12} md={4} key={classItem.id}>
                    <Box 
                      sx={{ 
                        p: 3, 
                        borderRight: { xs: 'none', md: index < 2 ? `1px solid ${alpha(theme.palette.divider, 0.5)}` : 'none' },
                        borderBottom: { xs: index < 2 ? `1px solid ${alpha(theme.palette.divider, 0.5)}` : 'none', md: 'none' },
                        height: '100%',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.02),
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: getRandomColor(index), 
                            width: 40, 
                            height: 40,
                            mr: 2 
                          }}
                        >
                          <ClassIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="600">
                            {classItem.class_name}
                          </Typography>
                          <Chip 
                            label={classItem.class_code} 
                            size="small"
                            sx={{ 
                              mt: 0.5,
                              bgcolor: alpha(theme.palette.success.main, 0.1), 
                              color: theme.palette.success.main,
                              fontWeight: 'bold',
                              borderRadius: 1
                            }} 
                          />
                        </Box>
                      </Box>
                      
                      <Box sx={{ ml: 7 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <PeopleIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem', color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {classItem.students_count} sinh viên
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <SchoolIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem', color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {classItem.teachers_count} giáo viên
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <SchoolIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.2), mb: 2 }} />
                <Typography variant="body1" color="textSecondary">
                  Bạn chưa tham gia lớp học nào
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Liên hệ quản trị viên để được phân lớp
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Thông báo - có thể thêm sau */}
    </Container>
  );
};

export default DashboardPage; 