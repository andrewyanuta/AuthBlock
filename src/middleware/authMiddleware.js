import { verifyAccessToken } from '../services/jwtService.js';
import { getUserById } from '../services/authService.js';

export const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please include a Bearer token in the Authorization header.',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = verifyAccessToken(token);
    const user = await getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = user;
    req.authType = 'jwt';
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid or expired token',
    });
  }
};

export const verifySession = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    req.authType = 'session';
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Not authenticated. Please log in.',
  });
};

export const verifyAny = async (req, res, next) => {
  // Try JWT first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = verifyAccessToken(token);
      const user = await getUserById(decoded.userId);
      
      if (user) {
        req.user = user;
        req.authType = 'jwt';
        return next();
      }
    } catch (error) {
      // Fall through to session check
    }
  }

  // Try session
  if (req.isAuthenticated && req.isAuthenticated()) {
    req.user = req.user || req.session?.passport?.user;
    req.authType = 'session';
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Not authenticated. Please provide a valid token or log in.',
  });
};

