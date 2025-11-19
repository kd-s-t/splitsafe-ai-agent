import { getUnreadCount } from '@/lib/internal/icp';
import { Principal } from '@dfinity/principal';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

// Async thunk to fetch unread count from Motoko backend
export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (principal: Principal, { rejectWithValue }) => {
    try {
      const count = await getUnreadCount(principal);
      return count;
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      return rejectWithValue('Failed to fetch unread count');
    }
  }
);

interface NotificationsState {
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: NotificationsState = {
  unreadCount: 0,
  isLoading: false,
  error: null,
  lastFetched: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Manually set unread count (for fallback scenarios)
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
      state.error = null;
    },
    // Increment unread count (when new notification arrives)
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    // Decrement unread count (when notification is read)
    decrementUnreadCount: (state) => {
      if (state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
    },
    // Reset unread count
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
      state.error = null;
    },
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.unreadCount = action.payload;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setUnreadCount,
  incrementUnreadCount,
  decrementUnreadCount,
  resetUnreadCount,
  clearError,
} = notificationsSlice.actions;

// Selectors
export const selectUnreadCount = (state: RootState) => state.notifications.unreadCount;
export const selectNotificationsLoading = (state: RootState) => state.notifications.isLoading;
export const selectNotificationsError = (state: RootState) => state.notifications.error;
export const selectLastFetched = (state: RootState) => state.notifications.lastFetched;

export default notificationsSlice.reducer;
