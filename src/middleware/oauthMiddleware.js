import { createErrorResponse } from '../utils/helpers.js';
import { isGoogleConfigured, isFacebookConfigured, isGitHubConfigured } from '../utils/oauthConfig.js';

export const checkGoogleConfig = (req, res, next) => {
  if (!isGoogleConfigured()) {
    return res.status(503).json(
      createErrorResponse(
        'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment variables.',
        503
      )
    );
  }
  next();
};

export const checkFacebookConfig = (req, res, next) => {
  if (!isFacebookConfigured()) {
    return res.status(503).json(
      createErrorResponse(
        'Facebook OAuth is not configured. Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in your environment variables.',
        503
      )
    );
  }
  next();
};

export const checkGitHubConfig = (req, res, next) => {
  if (!isGitHubConfigured()) {
    return res.status(503).json(
      createErrorResponse(
        'GitHub OAuth is not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in your environment variables.',
        503
      )
    );
  }
  next();
};

