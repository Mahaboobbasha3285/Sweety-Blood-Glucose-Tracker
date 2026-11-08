import { registerSchema, loginSchema } from '../validators/auth.js';
import { registerUser, authenticateUser, getPublicUser } from '../services/authService.js';
import { env } from '../config/env.js';

function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/'
  };
}

export async function register(req, res) {
  const input = registerSchema.parse(req.body);
  const user = await registerUser(input);
  return res.status(201).json({ user });
}

export async function login(req, res) {
  const input = loginSchema.parse(req.body);
  const result = await authenticateUser(input);
  res.cookie(env.COOKIE_NAME, result.token, cookieOptions());
  return res.json({ user: result.user });
}

export async function me(req, res) {
  const user = await getPublicUser(req.user.id);
  return res.json({ user });
}

export function logout(_req, res) {
  res.clearCookie(env.COOKIE_NAME, { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
  return res.json({ message: 'Logged out successfully.' });
}
