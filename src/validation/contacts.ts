import { z } from 'zod';
import { isValidICPPrincipal } from './common';

// Contact form validation schema
export const contactFormSchema = z.object({
  nickname: z
    .string()
    .min(1, 'Nickname is required')
    .max(50, 'Nickname must be less than 50 characters')
    .trim(),
  principalId: z
    .string()
    .min(1, 'Principal ID is required')
    .refine(
      (value) => isValidICPPrincipal(value),
      'Please enter a valid Principal ID'
    ),
});

// Type inference from schema
export type ContactFormData = z.infer<typeof contactFormSchema>;

// Validation functions
export const validateContactForm = (data: unknown) => {
  return contactFormSchema.safeParse(data);
};

export const validateContactFormAsync = async (data: unknown) => {
  return contactFormSchema.safeParseAsync(data);
};
