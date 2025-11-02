import passport from 'passport';
import { registerUser, loginUser, createJWTToken, createSession, logout, getUserById } from '../services/authService.js';
import { handleOAuthCallback } from '../services/oauthService.js';
import { sanitizeUser, createErrorResponse, createSuccessResponse } from '../utils/helpers.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const user = await registerUser(email, password, name);
    
    return res.status(201).json(
      createSuccessResponse(sanitizeUser(user), 'User registered successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await loginUser(email, password);

    // Create both JWT and session
    const tokens = await createJWTToken(user.id);
    const sessionUser = await createSession(user.id);

    // Set session
    req.login(sessionUser, (err) => {
      if (err) return next(err);
      
      return res.json(
        createSuccessResponse({
          user: sanitizeUser(user),
          ...tokens,
        }, 'Login successful')
      );
    });
  } catch (error) {
    next(error);
  }
};

export const loginJWT = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await loginUser(email, password);
    const tokens = await createJWTToken(user.id);

    return res.json(
      createSuccessResponse({
        user: sanitizeUser(user),
        ...tokens,
      }, 'Login successful (JWT only)')
    );
  } catch (error) {
    next(error);
  }
};

export const loginSession = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await loginUser(email, password);
    const sessionUser = await createSession(user.id);

    req.login(sessionUser, (err) => {
      if (err) return next(err);
      
      return res.json(
        createSuccessResponse({
          user: sanitizeUser(sessionUser),
        }, 'Login successful (Session only)')
      );
    });
  } catch (error) {
    next(error);
  }
};

export const logoutHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.session?.passport?.user;

    if (userId) {
      await logout(userId);
    }

    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((err) => {
        if (err) return next(err);
        res.json(createSuccessResponse(null, 'Logout successful'));
      });
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.session?.passport?.user;
    
    if (!userId) {
      return res.status(401).json(
        createErrorResponse('Not authenticated', 401)
      );
    }

    const user = await getUserById(userId);
    
    if (!user) {
      return res.status(404).json(
        createErrorResponse('User not found', 404)
      );
    }

    return res.json(
      createSuccessResponse(sanitizeUser(user), 'User retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// OAuth handlers
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

export const googleCallback = async (req, res, next) => {
  passport.authenticate('google', async (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json(
        createErrorResponse('OAuth authentication failed', 401)
      );
    }

    try {
      const result = await handleOAuthCallback(user, false); // JWT by default
      return res.json(
        createSuccessResponse(result, 'Google authentication successful')
      );
    } catch (error) {
      next(error);
    }
  })(req, res, next);
};

export const googleCallbackSession = async (req, res, next) => {
  passport.authenticate('google', async (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json(
        createErrorResponse('OAuth authentication failed', 401)
      );
    }

    try {
      const sessionUser = await createSession(user.id);
      req.login(sessionUser, async (err) => {
        if (err) return next(err);
        
        try {
          const result = await handleOAuthCallback(user, true);
          return res.json(
            createSuccessResponse(result, 'Google authentication successful (Session)')
          );
        } catch (error) {
          return next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
};

export const facebookAuth = passport.authenticate('facebook', {
  scope: ['email'],
});

export const facebookCallback = async (req, res, next) => {
  passport.authenticate('facebook', async (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json(
        createErrorResponse('OAuth authentication failed', 401)
      );
    }

    try {
      const result = await handleOAuthCallback(user, false);
      return res.json(
        createSuccessResponse(result, 'Facebook authentication successful')
      );
    } catch (error) {
      next(error);
    }
  })(req, res, next);
};

export const facebookCallbackSession = async (req, res, next) => {
  passport.authenticate('facebook', async (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json(
        createErrorResponse('OAuth authentication failed', 401)
      );
    }

    try {
      const sessionUser = await createSession(user.id);
      req.login(sessionUser, async (err) => {
        if (err) return next(err);
        
        try {
          const result = await handleOAuthCallback(user, true);
          return res.json(
            createSuccessResponse(result, 'Facebook authentication successful (Session)')
          );
        } catch (error) {
          return next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
};

export const githubAuth = passport.authenticate('github', {
  scope: ['user:email'],
});

export const githubCallback = async (req, res, next) => {
  passport.authenticate('github', async (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json(
        createErrorResponse('OAuth authentication failed', 401)
      );
    }

    try {
      const result = await handleOAuthCallback(user, false);
      return res.json(
        createSuccessResponse(result, 'GitHub authentication successful')
      );
    } catch (error) {
      next(error);
    }
  })(req, res, next);
};

export const githubCallbackSession = async (req, res, next) => {
  passport.authenticate('github', async (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json(
        createErrorResponse('OAuth authentication failed', 401)
      );
    }

    try {
      const sessionUser = await createSession(user.id);
      req.login(sessionUser, async (err) => {
        if (err) return next(err);
        
        try {
          const result = await handleOAuthCallback(user, true);
          return res.json(
            createSuccessResponse(result, 'GitHub authentication successful (Session)')
          );
        } catch (error) {
          return next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
};

