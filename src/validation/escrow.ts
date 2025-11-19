
import { z } from "zod";
import { isValidICPPrincipal } from "./common";

// Phone number interface
export interface PhoneNumber {
  country: string; // Country code like "+63"
  number: string;  // Phone number like "9606075119"
}

// Define milestone types based on ICP schema
export interface MilestoneRecipientRequest {
  id: string;
  name: string;
  principal: string;
  share: number; // Share amount
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
  recipientSignedAt?: number; // When this recipient signed the contract
  signedContractFile?: string; // The signed contract file uploaded by recipient
  signedContractAt?: number; // When the signed contract was uploaded
  clientApprovedSignedContractAt?: number; // When the client approved the signed contract
  proofOfWorkDescription?: string; // Rich text description of work accomplished
  proofOfWorkScreenshots?: string[]; // Array of file hashes/URLs for screenshots
  proofOfWorkFiles?: string[]; // Array of file hashes/URLs for additional files
  proofOfWorkSubmittedAt?: number; // When proof of work was submitted
}

export type MilestoneFrequency = string; // e.g., "day-1", "day-15", etc.

export interface Milestone {
  id: string;
  title: string;
  allocation: number; // Total allocation amount
  coin: string; // Coin type (e.g., "ckbtc", "icp", "sei")
  recipients: MilestoneRecipientRequest[]; // Use MilestoneRecipientRequest for creation
  startDate: number; // Start date timestamp
  endDate: number; // End date timestamp
  createdAt: number; // When milestone was created
  releasedDate?: number; // When milestone was released
  frequency: MilestoneFrequency; // Weekly, monthly, or yearly
  duration: number; // Duration in months
  completedAt?: number; // When milestone was completed/finished
  contractFile?: string; // Contract file content or reference (optional)
}

// Define the form data type explicitly
export interface EscrowFormData {
  title: string;
  btcAmount: string;
  recipients: Array<{
    id: string;
    name: string;
    principal: string;
    email?: string;
    phone?: PhoneNumber;
    billingAddress?: string;
    percentage: number;
  }>;
  useSeiAcceleration: boolean;
  isMilestone: boolean;
  milestones: Milestone[];  // Array of milestones
  startDate?: string;
  contractSigningPeriod?: number; // Contract signing period in days
}


// Enhanced validation to detect wrong address types
const validateAddressType = (address: string, expectedType: 'ICP' | 'BTC'): boolean => {
  const trimmed = address.trim();

  if (expectedType === 'ICP') {
    // If someone enters a BTC address in ICP field, it should be invalid
    if (trimmed.startsWith('1') || trimmed.startsWith('3') || trimmed.startsWith('bc1')) {
      return false;
    }
    return isValidICPPrincipal(trimmed);
  } else if (expectedType === 'BTC') {
    // Bitcoin address validation - basic format check
    if (trimmed.includes('-') && trimmed.length > 20) {
      return false;
    }
    // Basic Bitcoin address format validation (starts with 1, 3, or bc1)
    const bitcoinRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/;
    return bitcoinRegex.test(trimmed);
  }

  return false;
};

// Phone number validation schema
const phoneNumberSchema = z.object({
  country: z.string().min(1, "Country code is required").regex(/^\+\d{1,4}$/, "Country code must start with + and be 1-4 digits"),
  number: z.string().min(1, "Phone number is required").regex(/^\d{7,15}$/, "Phone number must be 7-15 digits")
}).optional();

// Simplified recipient schema for basic escrow (only required fields)
const basicRecipientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Recipient name is required").max(50, "Name must be less than 50 characters"),
  principal: z.string()
    .min(1, "ICP Principal ID is required")
    .refine((val) => validateAddressType(val, 'ICP'), "Please enter a valid ICP Principal ID (not a Bitcoin address)"),
  percentage: z.coerce.number().min(0, "Percentage must be at least 0").max(100, "Percentage cannot exceed 100")
});

// Full recipient schema for milestone escrow (includes optional fields)
const recipientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Recipient name is required").max(50, "Name must be less than 50 characters"),
  principal: z.string()
    .min(1, "ICP Principal ID is required")
    .refine((val) => validateAddressType(val, 'ICP'), "Please enter a valid ICP Principal ID (not a Bitcoin address)"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  phone: phoneNumberSchema,
  billingAddress: z.string().max(200, "Billing address must be less than 200 characters").optional().or(z.literal("")),
  percentage: z.coerce.number().min(0, "Percentage must be at least 0").max(100, "Percentage cannot exceed 100")
});


const btcAmountSchema = z
  .string()
  .refine((val) => val.trim() !== "", { message: "Please enter an amount to continue." })
  .refine((val) => !isNaN(Number(val)), { message: "Amount must be a number" })
  .refine(
    (val) => {
      const trimmed = val.trim();
      if (/^0+(\.0+)?$/.test(trimmed)) {
        return false;
      }
      return Number(trimmed) > 0;
    },
    { message: "Amount must be greater than zero." }
  )
  .refine((val) => Number(val) <= 10, { message: "Escrow amount exceeds the maximum allowed. Please lower the amount." })
  .refine(
    (val) => {
      const [, decimals] = val.split(".");
      if (!decimals) return true;
      const trimmedDecimals = decimals.replace(/0+$/, "");
      return trimmedDecimals.length <= 8;
    },
    { message: "Bitcoin supports up to 8 decimal places only." }
  )


// Milestone recipient schema
const milestoneRecipientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Recipient name is required").max(50, "Name must be less than 50 characters"),
  principal: z.string()
    .min(1, "ICP Principal ID is required")
    .refine((val) => validateAddressType(val, 'ICP'), "Please enter a valid ICP Principal ID (not a Bitcoin address)"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  phone: phoneNumberSchema,
  billingAddress: z.string().max(200, "Billing address must be less than 200 characters").optional().or(z.literal("")),
  share: z.number().min(0, "Share must be at least 0"),
  approvedAt: z.number().optional(),
  declinedAt: z.number().optional()
});

// Milestone schema based on ICP schema
const milestoneSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Milestone title is required").max(100, "Title must be less than 100 characters"),
  allocation: z.number().min(0.00000001, "Allocation must be greater than 0"),
  coin: z.string().min(1, "Coin type is required"),
  recipients: z.array(milestoneRecipientSchema)
    .min(1, "At least one recipient is required for each milestone")
    .refine((recipients) => {
      const totalShare = recipients.reduce((sum, recipient) => sum + recipient.share, 0);
      return totalShare > 0; // Total share must be greater than 0
    }, "Total share must be greater than 0 for milestone recipients"),
  startDate: z.number().min(0, "Start date must be valid"),
  endDate: z.number().min(0, "End date must be valid"),
  createdAt: z.number().min(0, "Created date must be valid"),
  frequency: z.string().regex(/^day-\d+$/, "Frequency must be in format 'day-X' where X is 1-28"),
  duration: z.number().min(1, "Duration must be at least 1 month").max(120, "Duration cannot exceed 120 months"),
  contractFile: z.string().optional() // Contract file content or reference (optional)
});

// Basic escrow schema (simplified, no optional fields)
export const basicEscrowFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  btcAmount: btcAmountSchema,
  recipients: z.array(basicRecipientSchema).min(1, "At least one recipient is required"),
  useSeiAcceleration: z.boolean().default(true),
}).refine((data) => {
  // Check total percentage
  const totalPercentage = data.recipients.reduce((sum, r) => sum + r.percentage, 0);
  return Math.abs(totalPercentage - 100) < 0.01;
}, "Total percentage must equal 100%");

// Full escrow schema (for milestone escrows with optional fields)
export const escrowFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  btcAmount: btcAmountSchema,
  recipients: z.array(recipientSchema).default([]), // Keep for basic escrow compatibility
  useSeiAcceleration: z.boolean().default(true),
  isMilestone: z.boolean().default(false),
  milestones: z.array(milestoneSchema).default([]),
  startDate: z.string().optional(), // Make startDate optional
  contractSigningPeriod: z.number().min(1, "Contract signing period must be at least 1 day").max(30, "Contract signing period cannot exceed 30 days").optional(),
  contractFile: z.string().optional() // Contract file content or reference (optional)
}).refine((data) => {
  // For milestone escrows, require at least one milestone with recipients
  if (data.isMilestone) {
    return data.milestones.length > 0 && data.milestones.every(milestone => milestone.recipients.length > 0);
  }
  // For basic escrows, require at least one recipient
  return data.recipients.length > 0;
}, "For milestone escrows, add at least one milestone with recipients. For basic escrows, add at least one recipient.")
  .refine((data) => {
    // Only require startDate for milestone escrows
    if (data.isMilestone) {
      return data.startDate && data.startDate.trim().length > 0;
    }
    return true;
  }, "Start date is required when creating milestone escrow");