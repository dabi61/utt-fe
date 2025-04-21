import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectAuth } from '../../store/slices/authSlice';
import { 
  fetchAttendanceRecords, 
  fetchAttendanceBySchedule, 
  fetchStudentAttendances,
  markAttendance,
  updateAttendanceRecord,
  selectAttendanceState,
  selectAttendanceRecords
} from '../../store/slices/attendanceSlice';
import { 
  fetchSchedules, 
  fetchTeacherSchedules, 
  fetchStudentSchedules,
  selectSchedules
} from '../../store/slices/scheduleSlice';

const AttendancePage = () => {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector(selectAuth);
  const { loading, error } = useAppSelector(selectAttendanceState);
  const attendanceRecords = useAppSelector(selectAttendanceRecords);
  const schedules = useAppSelector(selectSchedules);
  
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | ''>('');
  const [openMarkDialog, setOpenMarkDialog] = useState(false);
  const [markingStudentId, setMarkingStudentId] = useState<number | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<'present' | 'late' | 'absent'>('present');
  const [lateMinutes, setLateMinutes] = useState<number>(0);
  
  useEffect(() => {
    if (token && user) {
      // Xác định vai trò người dùng (giáo viên hay sinh viên) để lấy lịch học phù hợp
      const isTeacher = user.groups.some(group => group.name === 'Teacher');
      const isStudent = user.groups.some(group => group.name === 'Student');
      
      if (isTeacher) {
        dispatch(fetchTeacherSchedules(token));
      } else if (isStudent) {
        dispatch(fetchStudentSchedules(token));
      } else {
        // Nếu là admin hoặc vai trò khác
        dispatch(fetchSchedules(token));
      }
    }
  }, [dispatch, token, user]);
  
  useEffect(() => {
    if (token && selectedScheduleId) {
      dispatch(fetchAttendanceBySchedule({ token, scheduleId: selectedScheduleId as number }));
    }
  }, [dispatch, token, selectedScheduleId]);
  
  const handleScheduleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedScheduleId(event.target.value as number);
  };
  
  const handleOpenMarkDialog = (studentId: number) => {
    setMarkingStudentId(studentId);
    setOpenMarkDialog(true);
  };
  
  const handleCloseMarkDialog = () => {
    setOpenMarkDialog(false);
    setMarkingStudentId(null);
    setAttendanceStatus('present');
    setLateMinutes(0);
  };
  
  const handleMarkAttendance = () => {
    if (token && selectedScheduleId && markingStudentId) {
      const attendanceData = {
        student_id: markingStudentId,
        schedule_id: selectedScheduleId as number,
        is_present: attendanceStatus !== 'absent',
        is_late: attendanceStatus === 'late',
        minutes_late: attendanceStatus === 'late' ? lateMinutes : 0
      };
      
      dispatch(markAttendance({ token, attendanceData }));
      handleCloseMarkDialog();
    }
  };
  
  const handleUpdateAttendance = (attendanceId: number, newStatus: 'present' | 'late' | 'absent') => {
    if (token) {
      const attendanceData = {
        is_present: newStatus !== 'absent',
        is_late: newStatus === 'late',
        minutes_late: newStatus === 'late' ? 5 : 0 // Giá trị mặc định cho trường hợp sửa nhanh
      };
      
      dispatch(updateAttendanceRecord({ token, attendanceId, attendanceData }));
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Quản lý điểm danh
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="schedule-select-label">Chọn lịch học</InputLabel>
              <Select
                labelId="schedule-select-label"
                id="schedule-select"
                value={selectedScheduleId}
                label="Chọn lịch học"
                onChange={handleScheduleChange}
              >
                <MenuItem value="">
                  <em>Chọn lịch học</em>
                </MenuItem>
                {schedules.map((schedule) => (
                  <MenuItem key={schedule.id} value={schedule.id}>
                    {schedule.course_name.object_name} - {schedule.class_name.class_name} - {new Date(schedule.start_date).toLocaleDateString()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              variant="contained" 
              color="primary"
              disabled={!selectedScheduleId || loading}
              onClick={() => {
                if (token && selectedScheduleId) {
                  dispatch(fetchAttendanceBySchedule({ token, scheduleId: selectedScheduleId as number }));
                }
              }}
            >
              Xem điểm danh
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {selectedScheduleId && (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Sinh viên</TableCell>
                    <TableCell>Thời gian điểm danh</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceRecords.length > 0 ? (
                    attendanceRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.id}</TableCell>
                        <TableCell>{record.student.user.name}</TableCell>
                        <TableCell>{new Date(record.timestamp).toLocaleString()}</TableCell>
                        <TableCell>
                          {!record.is_present ? (
                            <Chip label="Vắng mặt" color="error" />
                          ) : record.is_late ? (
                            <Chip label={`Trễ ${record.minutes_late} phút`} color="warning" />
                          ) : (
                            <Chip label="Có mặt" color="success" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="primary"
                              onClick={() => handleUpdateAttendance(record.id, 'present')}
                            >
                              Có mặt
                            </Button>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="warning"
                              onClick={() => handleUpdateAttendance(record.id, 'late')}
                            >
                              Trễ
                            </Button>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="error"
                              onClick={() => handleUpdateAttendance(record.id, 'absent')}
                            >
                              Vắng
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Không có dữ liệu điểm danh
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
      
      {/* Dialog để thêm điểm danh mới */}
      <Dialog open={openMarkDialog} onClose={handleCloseMarkDialog}>
        <DialogTitle>Điểm danh sinh viên</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Chọn trạng thái điểm danh cho sinh viên
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="attendance-status-label">Trạng thái</InputLabel>
            <Select
              labelId="attendance-status-label"
              id="attendance-status"
              value={attendanceStatus}
              label="Trạng thái"
              onChange={(e) => setAttendanceStatus(e.target.value as 'present' | 'late' | 'absent')}
            >
              <MenuItem value="present">Có mặt</MenuItem>
              <MenuItem value="late">Trễ</MenuItem>
              <MenuItem value="absent">Vắng mặt</MenuItem>
            </Select>
          </FormControl>
          
          {attendanceStatus === 'late' && (
            <TextField
              margin="dense"
              id="late-minutes"
              label="Số phút trễ"
              type="number"
              fullWidth
              value={lateMinutes}
              onChange={(e) => setLateMinutes(Number(e.target.value))}
              InputProps={{ inputProps: { min: 1 } }}
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMarkDialog}>Hủy</Button>
          <Button onClick={handleMarkAttendance} color="primary">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AttendancePage; 