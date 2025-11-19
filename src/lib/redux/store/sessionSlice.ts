import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SessionState {
  token: string | null;
  expiresAt: string | null;
  isLoading: boolean;
}

const initialState: SessionState = {
  token: null,
  expiresAt: null,
  isLoading: false,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<{ token: string; expiresAt: string }>) {
      state.token = action.payload.token;
      state.expiresAt = action.payload.expiresAt;
      state.isLoading = false;
    },
    clearSession(state) {
      state.token = null;
      state.expiresAt = null;
      state.isLoading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setSession, clearSession, setLoading } = sessionSlice.actions;
export default sessionSlice.reducer;

