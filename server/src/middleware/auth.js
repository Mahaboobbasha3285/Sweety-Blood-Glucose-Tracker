import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

export function requireAuth(req, _res, next) {
  const token = req.cookies?.[env.COOKIE_NAME];
  if (!token) {
    return next(new AppError('Please log in to continue.', 401, 'UNAUTHENTICATED'));
  }
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = { id: payload.sub };
    return next();
  } catch {
    return next(new AppError('Your session has expired. Please log in again.', 401, 'INVALID_SESSION'));
  }
}
