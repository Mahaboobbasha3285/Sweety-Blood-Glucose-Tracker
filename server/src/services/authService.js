import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

const SALT_ROUNDS = 12;

export async function registerUser(input) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409, 'EMAIL_IN_USE');
  }
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash },
    select: { id: true, name: true, email: true, createdAt: true }
  });
  return user;
}

export async function authenticateUser(input) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const passwordMatches = user ? await bcrypt.compare(input.password, user.passwordHash) : false;
  if (!passwordMatches) {
    throw new AppError('Email or password is incorrect.', 401, 'INVALID_CREDENTIALS');
  }
  const token = jwt.sign({}, env.JWT_SECRET, { subject: user.id, expiresIn: env.JWT_EXPIRES_IN });
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt }
  };
}

export async function getPublicUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, createdAt: true }
  });
  if (!user) {
    throw new AppError('User account could not be found.', 401, 'USER_NOT_FOUND');
  }
  return user;
}
