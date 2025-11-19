import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  principal: string | null;
  name: string | null;
  profilePicture?: string | null;
  email?: string | null;
  balance?: string | null;
  icpBalance?: string | null;
  ckbtcAddress?: string | null;
  ckbtcBalance?: string | null;
  seiAddress?: string | null;
  isAdmin?: boolean;
}

const initialState: UserState = {
  principal: null,
  name: null,
  profilePicture: null,
  email: null,
  balance: null,
  icpBalance: null,
  ckbtcAddress: null,
  ckbtcBalance: null,
  seiAddress: null,
  isAdmin: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ principal: string; name: string | null; profilePicture?: string | null; email?: string | null; balance?: string | null }>) {
      state.principal = action.payload.principal;
      state.name = action.payload.name;
      state.profilePicture = action.payload.profilePicture || null;
      state.email = action.payload.email || null;
      state.balance = action.payload.balance || null;
    },
    clearUser(state) {
      state.principal = null;
      state.name = null;
      state.profilePicture = null;
      state.email = null;
      state.balance = null;
      state.icpBalance = null;
      state.ckbtcAddress = null;
      state.ckbtcBalance = null;
      state.seiAddress = null;
      state.isAdmin = false;
    },
    setUserName(state, action: PayloadAction<string | null>) {
      state.name = action.payload;
    },
    setProfilePicture(state, action: PayloadAction<string | null>) {
      state.profilePicture = action.payload;
    },
    setIcpBalance(state, action: PayloadAction<string | null>) {
      state.icpBalance = action.payload;
    },
    setCkbtcAddress(state, action: PayloadAction<string | null>) {
      state.ckbtcAddress = action.payload;
    },
    setCkbtcBalance(state, action: PayloadAction<string | null>) {
      state.ckbtcBalance = action.payload;
    },
    setSeiAddress(state, action: PayloadAction<string | null>) {
      state.seiAddress = action.payload;
    },
    setEmail(state, action: PayloadAction<string | null>) {
      state.email = action.payload;
    },
    setBalance(state, action: PayloadAction<string | null>) {
      state.balance = action.payload;
    },
    setAdmin(state, action: PayloadAction<boolean>) {
      state.isAdmin = action.payload;
    },
  },
});

export const { 
  setUser, 
  clearUser, 
  setUserName, 
  setProfilePicture,
  setEmail,
  setBalance,
  setIcpBalance,
  setCkbtcAddress,
  setCkbtcBalance,
  setSeiAddress,
  setAdmin
} = userSlice.actions;
export default userSlice.reducer; 