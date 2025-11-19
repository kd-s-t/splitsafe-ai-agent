import { z } from 'zod';
import { isValidICPPrincipal } from './common';

// Voucher validation schemas
export const voucherCodeSchema = z
  .string()
  .min(1, 'Voucher code is required')
  .min(3, 'Voucher code must be at least 3 characters long')
  .max(50, 'Voucher code must be less than 50 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Voucher code can only contain letters, numbers, underscores, and hyphens')
  .trim();

export const voucherAmountSchema = z
  .number()
  .positive('Amount must be greater than 0')
  .max(10000, 'Maximum amount is 10000 BTC')
  .refine(
    (amount) => {
      const decimalPlaces = (amount.toString().split('.')[1] || '').length;
      return decimalPlaces <= 8;
    },
    'Amount cannot have more than 8 decimal places'
  );

export const voucherDescriptionSchema = z
  .string()
  .max(500, 'Description must be less than 500 characters');

export const voucherExpirationSchema = z
  .date()
  .refine(
    (date) => date > new Date(),
    'Expiration date must be in the future'
  )
  .refine(
    (date) => {
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      return date <= oneYearFromNow;
    },
    'Expiration date cannot be more than 1 year in the future'
  );

// Main voucher form validation schema
export const voucherFormSchema = z.object({
  code: voucherCodeSchema,
  amount: voucherAmountSchema,
  description: voucherDescriptionSchema,
  expiredAt: voucherExpirationSchema,
});

// Voucher redemption schema
export const voucherRedemptionSchema = z.object({
  code: voucherCodeSchema,
});

// Voucher update schema
export const voucherUpdateSchema = z.object({
  description: voucherDescriptionSchema,
  expiredAt: voucherExpirationSchema,
});

// ICP Principal validation schema
export const principalSchema = z
  .string()
  .min(1, 'Principal ID is required')
  .refine(
    (value) => isValidICPPrincipal(value),
    'Please enter a valid Principal ID'
  );

// Type inference from schemas
export type VoucherFormData = z.infer<typeof voucherFormSchema>;
export type VoucherRedemptionData = z.infer<typeof voucherRedemptionSchema>;
export type VoucherUpdateData = z.infer<typeof voucherUpdateSchema>;

// Validation functions
export const validateVoucherForm = (data: unknown) => {
  return voucherFormSchema.safeParse(data);
};

export const validateVoucherFormAsync = async (data: unknown) => {
  return voucherFormSchema.safeParseAsync(data);
};

export const validateVoucherRedemption = (data: unknown) => {
  return voucherRedemptionSchema.safeParse(data);
};

export const validateVoucherUpdate = (data: unknown) => {
  return voucherUpdateSchema.safeParse(data);
};

export const validatePrincipal = (data: unknown) => {
  return principalSchema.safeParse(data);
};

// Utility functions
export const sanitizeVoucherCode = (code: string): string => {
  return code.trim().toUpperCase();
};

export const formatAmount = (amount: number): string => {
  return amount.toFixed(8);
};

export const parseAmount = (amountString: string): number => {
  const parsed = parseFloat(amountString);
  return isNaN(parsed) ? 0 : parsed;
};

export const getDefaultExpirationDate = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() + 30); // 30 days from now
  return date;
};

export const isVoucherExpired = (expiredAt: number): boolean => {
  return expiredAt <= Date.now() / 1000;
};

export const isVoucherRedeemed = (redeemAt: number | null): boolean => {
  return redeemAt !== null && redeemAt > 0;
};

export const getVoucherStatus = (
  expiredAt: number,
  redeemAt: number | null
): 'active' | 'expired' | 'redeemed' => {
  if (isVoucherRedeemed(redeemAt)) {
    return 'redeemed';
  }
  if (isVoucherExpired(expiredAt)) {
    return 'expired';
  }
  return 'active';
};

