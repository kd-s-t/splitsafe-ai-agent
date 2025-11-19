import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WithdrawState {
  isConfirmed: boolean;
  amount: string | null;
  destination: string | null;
  status: string | null;
  transactionHash: string | null;
}

const initialState: WithdrawState = {
  isConfirmed: false,
  amount: null,
  destination: null,
  status: null,
  transactionHash: null,
};

const withdrawSlice = createSlice({
  name: 'withdraw',
  initialState,
  reducers: {
    setWithdraw(state, action: PayloadAction<WithdrawState>) {
      state.isConfirmed = action.payload.isConfirmed;
      state.amount = action.payload.amount;
      state.destination = action.payload.destination;
      state.status = action.payload.status;
      state.transactionHash = action.payload.transactionHash;
    },
    setWithdrawConfirmClose(state, action: PayloadAction<boolean>) {
      state.isConfirmed = action.payload;
    },
  },
});

export const { 
  setWithdraw, 
  setWithdrawConfirmClose
} = withdrawSlice.actions;
export default withdrawSlice.reducer; 