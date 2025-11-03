import { userHasPermission, userHasRole } from '../services/roleService.js';
import { createErrorResponse } from '../utils/helpers.js';

/**
 * Middleware to require a specific permission
 */
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json(
          createErrorResponse('Authentication required', 401)
        );
      }

      // Check if user has the permission directly or via a role
      const hasPermission = await userHasPermission(userId, permission);
      
      // Allow if user has admin role (bypass permission check)
      const isAdmin = await userHasRole(userId, 'admin');
      
      if (!hasPermission && !isAdmin) {
        return res.status(403).json(
          createErrorResponse(
            `Access denied. Required permission: ${permission}`,
            403
          )
        );
      }

      next();
    } catch (error) {
      return res.status(500).json(
        createErrorResponse('Error checking permissions', 500)
      );
    }
  };
};

/**
 * Middleware to require one of multiple permissions
 */
export const requireAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json(
          createErrorResponse('Authentication required', 401)
        );
      }

      const userPermissions = await userHasPermission(userId, permissions[0]);
      
      let hasAnyPermission = userPermissions;
      
      for (let i = 1; i < permissions.length && !hasAnyPermission; i++) {
        hasAnyPermission = await userHasPermission(userId, permissions[i]);
      }

      if (!hasAnyPermission) {
        return res.status(403).json(
          createErrorResponse(
            `Access denied. Required one of: ${permissions.join(', ')}`,
            403
          )
        );
      }

      next();
    } catch (error) {
      return res.status(500).json(
        createErrorResponse('Error checking permissions', 500)
      );
    }
  };
};

/**
 * Middleware to require a specific role
 */
export const requireRole = (roleName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json(
          createErrorResponse('Authentication required', 401)
        );
      }

      const hasRole = await userHasRole(userId, roleName);

      if (!hasRole) {
        return res.status(403).json(
          createErrorResponse(
            `Access denied. Required role: ${roleName}`,
            403
          )
        );
      }

      next();
    } catch (error) {
      return res.status(500).json(
        createErrorResponse('Error checking role', 500)
      );
    }
  };
};

/**
 * Middleware to require one of multiple roles
 */
export const requireAnyRole = (roleNames) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json(
          createErrorResponse('Authentication required', 401)
        );
      }

      let hasAnyRole = false;

      for (const roleName of roleNames) {
        if (await userHasRole(userId, roleName)) {
          hasAnyRole = true;
          break;
        }
      }

      if (!hasAnyRole) {
        return res.status(403).json(
          createErrorResponse(
            `Access denied. Required one of: ${roleNames.join(', ')}`,
            403
          )
        );
      }

      next();
    } catch (error) {
      return res.status(500).json(
        createErrorResponse('Error checking roles', 500)
      );
    }
  };
};

