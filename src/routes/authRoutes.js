import express from 'express';
import {
  register,
  login,
  loginJWT,
  loginSession,
  logoutHandler,
  getMe,
  googleAuth,
  googleCallback,
  googleCallbackSession,
  facebookAuth,
  facebookCallback,
  facebookCallbackSession,
  githubAuth,
  githubCallback,
  githubCallbackSession,
} from '../controllers/authController.js';
import { validateRegister, validateLogin, handleValidationErrors } from '../utils/validators.js';
import { verifyAny } from '../middleware/authMiddleware.js';
import { authLimiter, registerLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Registration
router.post('/register', registerLimiter, validateRegister, handleValidationErrors, register);

// Login endpoints
router.post('/login', authLimiter, validateLogin, handleValidationErrors, login); // Returns both JWT and session
router.post('/login/jwt', authLimiter, validateLogin, handleValidationErrors, loginJWT); // JWT only
router.post('/login/session', authLimiter, validateLogin, handleValidationErrors, loginSession); // Session only

// OAuth - Google
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/google/callback/session', googleCallbackSession);

// OAuth - Facebook
router.get('/facebook', facebookAuth);
router.get('/facebook/callback', facebookCallback);
router.get('/facebook/callback/session', facebookCallbackSession);

// OAuth - GitHub
router.get('/github', githubAuth);
router.get('/github/callback', githubCallback);
router.get('/github/callback/session', githubCallbackSession);

// Logout
router.post('/logout', verifyAny, logoutHandler);

// Get current user
router.get('/me', verifyAny, getMe);

export default router;

