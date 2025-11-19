import { escrowFormSchema } from "@/validation/escrow";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export type FormData = z.infer<typeof escrowFormSchema>;

export interface MilestoneFormProps {
  form: UseFormReturn<FormData>;
}

export interface Milestone {
  id: string;
  title: string;
  allocation: number; // Total allocation amount
  coin: string; // Coin type (e.g., "ckbtc", "icp", "sei")
  recipients: MilestoneRecipient[];
  startDate: number; // Start date timestamp
  endDate: number; // End date timestamp
  createdAt: number; // When milestone was created
  frequency: string; // Milestone frequency (e.g., "day-1", "day-15", etc.)
  duration: number; // Duration in months
  contractFile?: string; // Contract file content or reference (optional)
}

export interface PhoneNumber {
  country: string; // Country code like "+63"
  number: string;  // Phone number like "9606075119"
}

export interface MilestoneRecipient {
  id: string;
  name: string;
  principal: string;
  email?: string; // Optional email address
  phone?: PhoneNumber; // Optional phone number
  billingAddress?: string; // Optional billing address
  share: number; // Share amount
  approvedAt?: number; // When approved (null if not approved)
  declinedAt?: number; // When declined (null if not declined)
}

export type MilestoneFrequency = string; // e.g., "day-1", "day-15", etc.

export interface MilestoneFormData {
  title: string;
  btcAmount: string;
  startDate: string;
  milestones: Milestone[];
  useSeiAcceleration: boolean;
}
