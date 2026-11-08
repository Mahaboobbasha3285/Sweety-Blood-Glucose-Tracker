import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().min(1),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must contain at least 32 characters.'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  COOKIE_NAME: z.string().default('sweety_token'),
  APP_TIMEZONE: z.string().default('Asia/Kolkata').refine((value) => {
    try { Intl.DateTimeFormat('en-US', { timeZone: value }); return true; }
    catch { return false; }
  }, 'APP_TIMEZONE must be a valid IANA timezone.'),
  SEED_DEMO_PASSWORD: z.string().min(8).optional()
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
