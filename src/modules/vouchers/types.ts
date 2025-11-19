// Vouchers module types

export interface Voucher {
  code: string
  amount: number
  description: string
  expiredAt: Date
}

export interface AddUpdateVoucherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'add' | 'update';
  voucher?: Voucher;
}


// VouchersListProps interface - currently no props needed
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface VouchersListProps {
  // Add any props if needed in the future
}

export type VoucherDialogMode = 'add' | 'update';

export interface VoucherFormData {
  nickname: string;
  principalId: string;
}
