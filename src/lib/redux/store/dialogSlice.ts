import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DialogState {
	isChooseEscrowTypeDialogOpen: boolean;
	isFeedbackDialogOpen: boolean;
}

const initialState: DialogState = {
	isChooseEscrowTypeDialogOpen: false,
	isFeedbackDialogOpen: false,
};

const dialogSlice = createSlice({
	name: 'dialog',
	initialState,
	reducers: {
		setIsChooseEscrowTypeDialogOpen(state, action: PayloadAction<boolean>) {
			state.isChooseEscrowTypeDialogOpen = action.payload;
		},
		setIsFeedbackDialogOpen(state, action: PayloadAction<boolean>) {
			console.log('🔍 [Redux] setIsFeedbackDialogOpen called with:', action.payload);
			state.isFeedbackDialogOpen = action.payload;
		},
	},
});

export const {
	setIsChooseEscrowTypeDialogOpen,
	setIsFeedbackDialogOpen,
} = dialogSlice.actions;

export default dialogSlice.reducer; 