import express from 'express';
import {
  createRoleHandler,
  getAllRolesHandler,
  getRoleByIdHandler,
  updateRoleHandler,
  deleteRoleHandler,
  assignRoleHandler,
  removeRoleHandler,
  getUserRolesHandler,
  getUserPermissionsHandler,
} from '../controllers/roleController.js';
import { verifyAny } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';
import {
  validateCreateRole,
  validateUpdateRole,
  validateAssignRole,
  handleValidationErrors,
} from '../utils/roleValidators.js';

const router = express.Router();

// All routes require authentication
router.use(verifyAny);

// Role management routes (require admin permission)
router.post('/', requirePermission('roles:create'), validateCreateRole, handleValidationErrors, createRoleHandler);
router.get('/', requirePermission('roles:read'), getAllRolesHandler);
router.get('/:id', requirePermission('roles:read'), getRoleByIdHandler);
router.put('/:id', requirePermission('roles:update'), validateUpdateRole, handleValidationErrors, updateRoleHandler);
router.delete('/:id', requirePermission('roles:delete'), deleteRoleHandler);

// User role assignment routes
router.post('/assign', requirePermission('roles:assign'), validateAssignRole, handleValidationErrors, assignRoleHandler);
router.post('/remove', requirePermission('roles:assign'), validateAssignRole, handleValidationErrors, removeRoleHandler);
router.get('/user/:userId', requirePermission('roles:read'), getUserRolesHandler);
router.get('/user/:userId/permissions', verifyAny, getUserPermissionsHandler);

// Allow users to check their own permissions
router.get('/me/permissions', verifyAny, getUserPermissionsHandler);

export default router;

