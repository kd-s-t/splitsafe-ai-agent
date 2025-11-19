export interface TransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: unknown;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  amount?: string;
  onDone?: () => Promise<void>;
  isLoading?: boolean;
}
