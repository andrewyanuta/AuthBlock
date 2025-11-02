import prisma from '../config/database.js';
import { generateAccessToken, generateRefreshToken } from './jwtService.js';

export const handleOAuthCallback = async (user, createSession = false) => {
  if (!user) {
    throw new Error('OAuth authentication failed');
  }

  if (createSession) {
    // Return user for session-based auth
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        createdAt: user.createdAt,
      },
    };
  } else {
    // Generate JWT tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
        type: 'jwt',
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }
};

