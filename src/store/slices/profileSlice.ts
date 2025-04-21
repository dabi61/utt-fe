import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import * as userApi from '../../api/userApi';
import { UserProfile } from '../../types';

interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null
};

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUserProfile',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await userApi.getUserProfile(token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Không thể lấy thông tin hồ sơ');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'profile/updateUserProfile',
  async ({ token, userData }: { token: string; userData: any }, { rejectWithValue }) => {
    try {
      const response = await userApi.updateUserInfo(token, userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Không thể cập nhật thông tin hồ sơ');
    }
  }
);

export const changeUserPassword = createAsyncThunk(
  'profile/changeUserPassword',
  async ({ token, passwords }: { token: string; passwords: { current_password: string; new_password: string; re_new_password: string } }, { rejectWithValue }) => {
    try {
      const response = await userApi.changePassword(token, passwords);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Không thể thay đổi mật khẩu');
    }
  }
);

// Slice
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    resetProfile: (state) => {
      state.profile = null;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profile = { ...state.profile, ...action.payload };
        state.loading = false;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Change user password
      .addCase(changeUserPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearProfileError, resetProfile } = profileSlice.actions;

export const selectProfile = (state: RootState) => state.profile;

export default profileSlice.reducer; 