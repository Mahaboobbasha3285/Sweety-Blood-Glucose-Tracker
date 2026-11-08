import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must contain at least 2 characters.').max(100),
  email: z.string().trim().email('Please enter a valid email address.').max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(8, 'Password must contain at least 8 characters.').max(72, 'Password must be 72 characters or fewer.')
});

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address.').transform((value) => value.toLowerCase()),
  password: z.string().min(1, 'Password is required.').max(72)
});
