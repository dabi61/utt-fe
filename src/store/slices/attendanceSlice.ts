import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import * as attendanceApi from '../../api/attendanceApi';

interface AttendanceRecord {
  id: number;
  student_id: string;
  schedule_id: number;
  is_present: boolean;
  is_late: boolean;
  minutes_late?: number;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  device_info?: string;
}

interface AttendanceState {
  records: AttendanceRecord[];
  currentRecord: AttendanceRecord | null;
  loading: boolean;
  error: string | null;
}

const initialState: AttendanceState = {
  records: [],
  currentRecord: null,
  loading: false,
  error: null
};

// Thunks
export const fetchAttendanceRecords = createAsyncThunk(
  'attendance/fetchRecords',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await attendanceApi.getAttendances(token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Không thể lấy dữ liệu điểm danh');
    }
  }
);

export const fetchAttendanceBySchedule = createAsyncThunk(
  'attendance/fetchBySchedule',
  async ({ token, scheduleId }: { token: string; scheduleId: number }, { rejectWithValue }) => {
    try {
      const response = await attendanceApi.getAttendancesForSchedule(token, scheduleId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Không thể lấy dữ liệu điểm danh cho lịch học');
    }
  }
);

export const fetchStudentAttendances = createAsyncThunk(
  'attendance/fetchStudentAttendances',
  async ({ token, studentId }: { token: string; studentId: number }, { rejectWithValue }) => {
    try {
      const response = await attendanceApi.getStudentAttendances(token, studentId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Không thể lấy dữ liệu điểm danh của sinh viên');
    }
  }
);

export const markAttendance = createAsyncThunk(
  'attendance/mark',
  async ({ token, attendanceData }: { token: string; attendanceData: Partial<AttendanceRecord> }, { rejectWithValue }) => {
    try {
      const response = await attendanceApi.createAttendance(token, attendanceData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Không thể tạo điểm danh');
    }
  }
);

export const updateAttendanceRecord = createAsyncThunk(
  'attendance/update',
  async ({ token, attendanceId, attendanceData }: { token: string; attendanceId: number; attendanceData: Partial<AttendanceRecord> }, { rejectWithValue }) => {
    try {
      const response = await attendanceApi.updateAttendance(token, attendanceId, attendanceData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Không thể cập nhật điểm danh');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearAttendanceError: (state) => {
      state.error = null;
    },
    resetAttendance: (state) => {
      state.records = [];
      state.currentRecord = null;
      state.loading = false;
      state.error = null;
    },
    setCurrentRecord: (state, action: PayloadAction<AttendanceRecord>) => {
      state.currentRecord = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch attendance records
      .addCase(fetchAttendanceRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceRecords.fulfilled, (state, action) => {
        state.records = action.payload;
        state.loading = false;
      })
      .addCase(fetchAttendanceRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch attendance by schedule
      .addCase(fetchAttendanceBySchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceBySchedule.fulfilled, (state, action) => {
        state.records = action.payload;
        state.loading = false;
      })
      .addCase(fetchAttendanceBySchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch student attendances
      .addCase(fetchStudentAttendances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentAttendances.fulfilled, (state, action) => {
        state.records = action.payload;
        state.loading = false;
      })
      .addCase(fetchStudentAttendances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Mark attendance
      .addCase(markAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.records.push(action.payload);
        state.loading = false;
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update attendance
      .addCase(updateAttendanceRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAttendanceRecord.fulfilled, (state, action) => {
        const index = state.records.findIndex(record => record.id === action.payload.id);
        if (index !== -1) {
          state.records[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateAttendanceRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearAttendanceError, resetAttendance, setCurrentRecord } = attendanceSlice.actions;

export const selectAttendanceState = (state: RootState) => state.attendance;
export const selectAttendanceRecords = (state: RootState) => state.attendance.records;
export const selectCurrentRecord = (state: RootState) => state.attendance.currentRecord;

export default attendanceSlice.reducer; 