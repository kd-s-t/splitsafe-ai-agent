import { z } from 'zod';

export const feedbackSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters')
        .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),

    email: z
        .string()
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Must be a valid email address'),

    rating: z
        .number()
        .min(1, 'Rating is required')
        .max(5, 'Rating must be between 1 and 5')
        .int('Rating must be a whole number'),

    message: z
        .string()
        .min(1, 'Message is required')
        .min(10, 'Message must be at least 10 characters')
        .max(1000, 'Message must be less than 1000 characters')
        .regex(/^[a-zA-Z0-9\s.,!?@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]*$/, 'Message contains invalid characters'),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;
