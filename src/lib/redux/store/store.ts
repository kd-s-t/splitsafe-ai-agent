import { configureStore, createSlice } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import escrowReducer from './escrowSlice';
import notificationsReducer from './notificationsSlice';
import transactionsReducer from './transactionsSlice';
import userReducer from './userSlice';
import withdrawReducer from './withdrawSlice';
import dialogReducer from './dialogSlice';
import sessionReducer from './sessionSlice';

const initialLayoutState = {
  activePage: 'dashboard',
  title: '',
  subtitle: '',
  transactionStatus: '',
  isWithdrawConfirmed: false,
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState: initialLayoutState,
  reducers: {
    setActivePage(state, action) {
      state.activePage = action.payload;
    },
    setTitle(state, action) {
      state.title = action.payload;
    },
    setSubtitle(state, action) {
      state.subtitle = action.payload;
    },
    setTransactionStatus(state, action) {
      state.transactionStatus = action.payload;
    },
    setWithdrawConfirmed(state, action) {
      state.isWithdrawConfirmed = action.payload;
    },
  },
});

export const { setActivePage, setTitle, setSubtitle, setTransactionStatus } = layoutSlice.actions;
export const layoutReducer = layoutSlice.reducer;

export const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    user: userReducer,
    escrow: escrowReducer,
    withdraw: withdrawReducer,
    layout: layoutReducer,
    notifications: notificationsReducer,
    dialog: dialogReducer,
    session: sessionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>(); 