import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import * as classApi from '../../api/classApi';
import { Class } from '../../types';

interface ClassState {
  classes: Class[];
  currentClass: Class | null;
  loading: boolean;
  error: string | null;
}

const initialState: ClassState = {
  classes: [],
  currentClass: null,
  loading: false,
  error: null
};

// Async thunks
export const fetchClasses = createAsyncThunk(
  'class/fetchClasses',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await classApi.getClasses(token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Không thể lấy danh sách lớp học');
    }
  }
);

export const fetchClassById = createAsyncThunk(
  'class/fetchClassById',
  async ({ token, classId }: { token: string; classId: number }, { rejectWithValue }) => {
    try {
      const response = await classApi.getClassById(token, classId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Không thể lấy thông tin lớp học');
    }
  }
);

export const fetchTeacherClasses = createAsyncThunk(
  'class/fetchTeacherClasses',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await classApi.getTeacherClasses(token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Không thể lấy danh sách lớp học của giáo viên');
    }
  }
);

export const fetchStudentClasses = createAsyncThunk(
  'class/fetchStudentClasses',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await classApi.getStudentClasses(token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Không thể lấy danh sách lớp học của sinh viên');
    }
  }
);

export const addStudentToClass = createAsyncThunk(
  'class/addStudentToClass',
  async ({ token, classId, studentId }: { token: string; classId: number; studentId: number }, { rejectWithValue }) => {
    try {
      const response = await classApi.addStudentToClass(token, classId, studentId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Không thể thêm sinh viên vào lớp');
    }
  }
);

export const addTeacherToClass = createAsyncThunk(
  'class/addTeacherToClass',
  async ({ token, classId, teacherId }: { token: string; classId: number; teacherId: number }, { rejectWithValue }) => {
    try {
      const response = await classApi.addTeacherToClass(token, classId, teacherId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Không thể thêm giáo viên vào lớp');
    }
  }
);

// Slice
const classSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {
    clearClassError: (state) => {
      state.error = null;
    },
    resetClass: (state) => {
      state.classes = [];
      state.currentClass = null;
      state.loading = false;
      state.error = null;
    },
    setCurrentClass: (state, action: PayloadAction<Class>) => {
      state.currentClass = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all classes
      .addCase(fetchClasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.classes = action.payload;
        state.loading = false;
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch class by id
      .addCase(fetchClassById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClassById.fulfilled, (state, action) => {
        state.currentClass = action.payload;
        state.loading = false;
      })
      .addCase(fetchClassById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch teacher classes
      .addCase(fetchTeacherClasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeacherClasses.fulfilled, (state, action) => {
        state.classes = action.payload;
        state.loading = false;
      })
      .addCase(fetchTeacherClasses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch student classes
      .addCase(fetchStudentClasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentClasses.fulfilled, (state, action) => {
        state.classes = action.payload;
        state.loading = false;
      })
      .addCase(fetchStudentClasses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Add student to class
      .addCase(addStudentToClass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addStudentToClass.fulfilled, (state, action) => {
        if (state.currentClass && state.currentClass.id === action.payload.id) {
          state.currentClass = action.payload;
        }
        const index = state.classes.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.classes[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(addStudentToClass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Add teacher to class
      .addCase(addTeacherToClass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTeacherToClass.fulfilled, (state, action) => {
        if (state.currentClass && state.currentClass.id === action.payload.id) {
          state.currentClass = action.payload;
        }
        const index = state.classes.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.classes[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(addTeacherToClass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearClassError, resetClass, setCurrentClass } = classSlice.actions;

export const selectClassState = (state: RootState) => state.classes;
export const selectClasses = (state: RootState) => state.classes.classes;
export const selectCurrentClass = (state: RootState) => state.classes.currentClass;

export default classSlice.reducer;