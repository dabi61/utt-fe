import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import * as scheduleApi from '../../api/scheduleApi';
import { Schedule } from '../../types';

interface ScheduleState {
  schedules: Schedule[];
  currentSchedule: Schedule | null;
  qrCode: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ScheduleState = {
  schedules: [],
  currentSchedule: null,
  qrCode: null,
  loading: false,
  error: null
};

// Async thunks
export const fetchSchedules = createAsyncThunk(
  'schedule/fetchSchedules',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await scheduleApi.getSchedules(token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Không thể lấy danh sách lịch học');
    }
  }
);

export const fetchScheduleById = createAsyncThunk(
  'schedule/fetchScheduleById',
  async ({ token, scheduleId }: { token: string; scheduleId: number }, { rejectWithValue }) => {
    try {
      const response = await scheduleApi.getScheduleById(token, scheduleId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Không thể lấy thông tin lịch học');
    }
  }
);

export const fetchScheduleQR = createAsyncThunk(
  'schedule/fetchScheduleQR',
  async ({ token, scheduleId }: { token: string; scheduleId: number }, { rejectWithValue }) => {
    try {
      const response = await scheduleApi.getScheduleQR(token, scheduleId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Không thể lấy mã QR cho lịch học');
    }
  }
);

export const fetchTeacherSchedules = createAsyncThunk(
  'schedule/fetchTeacherSchedules',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await scheduleApi.getTeacherSchedules(token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Không thể lấy lịch dạy của giáo viên');
    }
  }
);

export const fetchStudentSchedules = createAsyncThunk(
  'schedule/fetchStudentSchedules',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await scheduleApi.getStudentSchedules(token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Không thể lấy lịch học của sinh viên');
    }
  }
);

// Slice
const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    clearScheduleError: (state) => {
      state.error = null;
    },
    resetSchedule: (state) => {
      state.schedules = [];
      state.currentSchedule = null;
      state.qrCode = null;
      state.loading = false;
      state.error = null;
    },
    setCurrentSchedule: (state, action: PayloadAction<Schedule>) => {
      state.currentSchedule = action.payload;
    },
    clearQRCode: (state) => {
      state.qrCode = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all schedules
      .addCase(fetchSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.schedules = action.payload;
        state.loading = false;
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch schedule by id
      .addCase(fetchScheduleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScheduleById.fulfilled, (state, action) => {
        state.currentSchedule = action.payload;
        state.loading = false;
      })
      .addCase(fetchScheduleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch schedule QR
      .addCase(fetchScheduleQR.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScheduleQR.fulfilled, (state, action) => {
        state.qrCode = action.payload.qr_code;
        state.loading = false;
      })
      .addCase(fetchScheduleQR.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch teacher schedules
      .addCase(fetchTeacherSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeacherSchedules.fulfilled, (state, action) => {
        state.schedules = action.payload;
        state.loading = false;
      })
      .addCase(fetchTeacherSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch student schedules
      .addCase(fetchStudentSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentSchedules.fulfilled, (state, action) => {
        state.schedules = action.payload;
        state.loading = false;
      })
      .addCase(fetchStudentSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearScheduleError, resetSchedule, setCurrentSchedule, clearQRCode } = scheduleSlice.actions;

export const selectScheduleState = (state: RootState) => state.schedule;
export const selectSchedules = (state: RootState) => state.schedule.schedules;
export const selectCurrentSchedule = (state: RootState) => state.schedule.currentSchedule;
export const selectQRCode = (state: RootState) => state.schedule.qrCode;

export default scheduleSlice.reducer; 