// Import and re-export shared types for backward compatibility
import type { DialogProps, EscrowType, FormProps, Milestone, Recipient } from '../shared.types';
export type { DialogProps, EscrowType, FormProps, Milestone, Recipient };

export interface TransactionSummaryProps {
  btcAmount: string;
  recipients: Recipient[];
  isLoading: boolean;
  handleInitiateEscrow: () => void;
  showDialog: boolean;
  setShowDialog: (open: boolean) => void;
  newTxId: string | null;
  isEditMode?: boolean;
}

export interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: string;
  onDone: () => void;
  depositAddress?: string;
  isLoading?: boolean;
}

export interface TransactionFormProps {
  title: string;
  setTitle: (title: string) => void;
  btcAmount: string;
  setBtcAmount: (btcAmount: string) => void;
  recipients: Recipient[];
  setRecipients: (recipients: Recipient[]) => void;
  handleAddRecipient: () => void;
  handleRemoveRecipient: (idx: number) => void;
  handleRecipientChange: (
    idx: number,
    field: keyof Recipient,
    value: string | number
  ) => void;
}


export interface EscrowTypeSelectorProps {
  onSelectType: (type: EscrowType) => void;
}

export interface EscrowFormProps {
  form: import('react-hook-form').UseFormReturn<import('@/validation/escrow').EscrowFormData>;
  escrowType?: EscrowType;
}

// Re-export with different name to avoid conflict
export type { FormProps as SharedFormProps } from '../shared.types';

export interface MilestoneFormProps {
  title: string;
  setTitle: (title: string) => void;
  btcAmount: string;
  setBtcAmount: (btcAmount: string) => void;
  recipients: Recipient[];
  setRecipients: (recipients: Recipient[]) => void;
  handleAddRecipient: () => void;
  handleRemoveRecipient: (idx: number) => void;
  handleRecipientChange: (
    idx: number,
    field: keyof Recipient,
    value: string | number
  ) => void;
  milestones: Milestone[];
  setMilestones: (milestones: Milestone[]) => void;
  handleAddMilestone: () => void;
  handleRemoveMilestone: (idx: number) => void;
  handleMilestoneChange: (
    idx: number,
    field: keyof Milestone,
    value: string | number
  ) => void;
}


export interface SummaryProps {
  formData: {
    btcAmount: string;
    recipients: Recipient[];
    title?: string;
    tokenType?: 'btc' | 'sei';
    seiAmount?: string;
    useSeiAcceleration?: boolean;
  };
  isLoading: boolean;
  onSubmit: () => void;
}

export interface AiGeneratedSetup {
  title: string;
  recipients: Recipient[];
  milestones?: Milestone[];
}

export interface AIAssistantProps {
  onSetupComplete: (setup: AiGeneratedSetup) => void;
  onClose: () => void;
}
