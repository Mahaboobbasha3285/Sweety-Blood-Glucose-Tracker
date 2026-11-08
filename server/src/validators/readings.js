import { z } from 'zod';
import { isValidDateString } from '../utils/date.js';

export const timeSlots = ['MORNING_FASTING', 'AFTER_BREAKFAST', 'AFTER_LUNCH', 'AFTER_DINNER'];

export const readingSchema = z.object({
  date: z.string().refine(isValidDateString, 'Please enter a valid date.'),
  timeSlot: z.enum(timeSlots, { errorMap: () => ({ message: 'Please select a valid time slot.' }) }),
  value: z.preprocess((value) => value === undefined || value === null ? '' : value, z.union([z.number(), z.string().trim().min(1, 'Please enter a glucose value.')]))
    .transform((value) => typeof value === 'string' ? Number(value) : value)
    .refine(Number.isInteger, 'Value must be a whole number between 40 and 600 mg/dl.')
    .refine((value) => value >= 40 && value <= 600, 'Value must be between 40 and 600 mg/dl.')
});

export const listReadingsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  date: z.string().optional().refine((value) => value === undefined || isValidDateString(value), 'Please enter a valid date.')
});

export const reportDateSchema = z.object({
  date: z.string().refine(isValidDateString, 'Please provide a valid date in YYYY-MM-DD format.')
});

export const readingIdSchema = z.string().uuid('Please provide a valid reading ID.');
