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
  getAvailableOAuthProviders,
} from '../controllers/authController.js';
import { validateRegister, validateLogin, handleValidationErrors } from '../utils/validators.js';
import { verifyAny } from '../middleware/authMiddleware.js';
import { authLimiter, registerLimiter } from '../middleware/rateLimiter.js';
import { checkGoogleConfig, checkFacebookConfig, checkGitHubConfig } from '../middleware/oauthMiddleware.js';

const router = express.Router();

// Registration
router.post('/register', registerLimiter, validateRegister, handleValidationErrors, register);

// Login endpoints
router.post('/login', authLimiter, validateLogin, handleValidationErrors, login); // Returns both JWT and session
router.post('/login/jwt', authLimiter, validateLogin, handleValidationErrors, loginJWT); // JWT only
router.post('/login/session', authLimiter, validateLogin, handleValidationErrors, loginSession); // Session only

// OAuth - Google (only if configured)
router.get('/google', checkGoogleConfig, googleAuth);
router.get('/google/callback', checkGoogleConfig, googleCallback);
router.get('/google/callback/session', checkGoogleConfig, googleCallbackSession);

// OAuth - Facebook (only if configured)
router.get('/facebook', checkFacebookConfig, facebookAuth);
router.get('/facebook/callback', checkFacebookConfig, facebookCallback);
router.get('/facebook/callback/session', checkFacebookConfig, facebookCallbackSession);

// OAuth - GitHub (only if configured)
router.get('/github', checkGitHubConfig, githubAuth);
router.get('/github/callback', checkGitHubConfig, githubCallback);
router.get('/github/callback/session', checkGitHubConfig, githubCallbackSession);

// Logout
router.post('/logout', verifyAny, logoutHandler);

// Get current user
router.get('/me', verifyAny, getMe);

// Get available OAuth providers
router.get('/oauth/providers', getAvailableOAuthProviders);

export default router;

