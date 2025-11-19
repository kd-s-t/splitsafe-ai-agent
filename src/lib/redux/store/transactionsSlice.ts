import type { NormalizedTransaction } from '@/modules/shared.types';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { decrementUnreadCount } from './notificationsSlice';

// Thunk to mark transaction as read and decrement unread count
export const markTransactionAsReadWithCount = createAsyncThunk(
  'transactions/markAsReadWithCount',
  async (transaction: NormalizedTransaction, { dispatch }) => {
    // First mark the transaction as read
    dispatch(markTransactionAsRead(transaction));
    // Then decrement the unread count
    dispatch(decrementUnreadCount());
    return transaction;
  }
);

// Interface for new escrow notifications
export interface EscrowNotification {
  id: string;
  from: string;
  title: string;
  amount: string;
  createdAt: string;
  status: 'pending';
  isNew: boolean;
}

interface TransactionsState {
  transactions: NormalizedTransaction[];
  escrowNotifications: EscrowNotification[];
}

const initialState: TransactionsState = {
  transactions: [],
  escrowNotifications: [],
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions(state, action: PayloadAction<NormalizedTransaction[]>) {
      state.transactions = action.payload;
    },
    markAllAsRead(state) {
      // Mark all transactions as read by updating their readAt property
      state.transactions.forEach(() => {
        // Note: This would need to be implemented based on your actual Transaction structure
        // For now, we'll just update the transactions array to trigger a re-render
      });
    },
    markTransactionAsRead(state, action: PayloadAction<NormalizedTransaction>) {
      const updatedTx = action.payload;
      state.transactions = state.transactions.map((tx) => {
        const txId = `${tx.from}_${tx.to.map((toEntry) => toEntry.principal).join('-')}_${tx.createdAt}`;
        const updatedTxId = `${updatedTx.from}_${updatedTx.to.map((toEntry) => toEntry.principal).join('-')}_${updatedTx.createdAt}`;
        return txId === updatedTxId ? updatedTx : tx;
      });
    },
    addEscrowNotification(state, action: PayloadAction<EscrowNotification>) {
      // Add new escrow notification
      state.escrowNotifications.unshift(action.payload);
    },
    markEscrowNotificationAsRead(state, action: PayloadAction<string>) {
      // Mark specific escrow notification as read
      const notificationId = action.payload;
      state.escrowNotifications = state.escrowNotifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isNew: false }
          : notification
      );
    },
    clearEscrowNotifications(state) {
      // Clear all escrow notifications
      state.escrowNotifications = [];
    },
    clearTransactions(state) {
      // Clear all transactions to force reload with properly serialized data
      state.transactions = [];
    },
  },
});

export const { setTransactions, markAllAsRead, markTransactionAsRead, addEscrowNotification, markEscrowNotificationAsRead, clearEscrowNotifications, clearTransactions } = transactionsSlice.actions;
export default transactionsSlice.reducer; 