import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { generateAccessToken, generateRefreshToken } from './jwtService.js';

export const registerUser = async (email, password, name) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      provider: 'email',
    },
    select: {
      id: true,
      email: true,
      name: true,
      provider: true,
      createdAt: true,
    },
  });

  return user;
};

export const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.password) {
    throw new Error('Account registered via OAuth. Please use OAuth to login.');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    provider: user.provider,
    createdAt: user.createdAt,
  };
};

export const createJWTToken = async (userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  // Store refresh token in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  await prisma.session.create({
    data: {
      userId,
      token: refreshToken,
      expiresAt,
      type: 'jwt',
    },
  });

  return {
    accessToken,
    refreshToken,
  };
};

export const createSession = async (userId) => {
  // Session is handled by express-session middleware
  // This function just ensures session data is consistent
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      provider: true,
      createdAt: true,
    },
  });

  return user;
};

export const logout = async (userId, sessionId = null) => {
  // Delete all JWT sessions for the user
  await prisma.session.deleteMany({
    where: {
      userId,
      type: 'jwt',
    },
  });

  return { success: true };
};

export const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      provider: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

