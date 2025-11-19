import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EscrowState {
  isLoading: boolean;
  newTxId: string | null;
  editTxId: string | null;
}

const initialState: EscrowState = {
  isLoading: false,
  newTxId: null,
  editTxId: null,
};

const escrowSlice = createSlice({
  name: 'escrow',
  initialState,
  reducers: {
    setIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setNewTxId(state, action: PayloadAction<string | null>) {
      state.newTxId = action.payload;
    },
    setEditTxId(state, action: PayloadAction<string | null>) {
      state.editTxId = action.payload;
    },
    resetEscrowForm(state) {
      state.isLoading = false;
      state.newTxId = null;
      state.editTxId = null;
    },
  },
});

export const {
  setIsLoading,
  setNewTxId,
  setEditTxId,
  resetEscrowForm,
} = escrowSlice.actions;

export default escrowSlice.reducer; 