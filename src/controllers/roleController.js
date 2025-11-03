import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  assignRoleToUser,
  removeRoleFromUser,
  getUserRoles,
  getUserPermissions,
} from '../services/roleService.js';
import { sanitizeUser, createErrorResponse, createSuccessResponse } from '../utils/helpers.js';

export const createRoleHandler = async (req, res, next) => {
  try {
    const { name, description, permissions } = req.body;

    if (!name) {
      return res.status(400).json(
        createErrorResponse('Role name is required', 400)
      );
    }

    const role = await createRole(name, description, permissions || []);

    return res.status(201).json(
      createSuccessResponse(role, 'Role created successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const getAllRolesHandler = async (req, res, next) => {
  try {
    const roles = await getAllRoles();

    return res.json(
      createSuccessResponse(roles, 'Roles retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const getRoleByIdHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const role = await getRoleById(id);

    return res.json(
      createSuccessResponse(role, 'Role retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const updateRoleHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    const role = await updateRole(id, { name, description, permissions });

    return res.json(
      createSuccessResponse(role, 'Role updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const deleteRoleHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deleteRole(id);

    return res.json(
      createSuccessResponse(result, 'Role deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const assignRoleHandler = async (req, res, next) => {
  try {
    const { userId, roleId } = req.body;

    if (!userId || !roleId) {
      return res.status(400).json(
        createErrorResponse('userId and roleId are required', 400)
      );
    }

    const userRole = await assignRoleToUser(userId, roleId);

    return res.status(201).json(
      createSuccessResponse(userRole, 'Role assigned to user successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const removeRoleHandler = async (req, res, next) => {
  try {
    const { userId, roleId } = req.body;

    if (!userId || !roleId) {
      return res.status(400).json(
        createErrorResponse('userId and roleId are required', 400)
      );
    }

    const result = await removeRoleFromUser(userId, roleId);

    return res.json(
      createSuccessResponse(result, 'Role removed from user successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const getUserRolesHandler = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const roles = await getUserRoles(userId);

    return res.json(
      createSuccessResponse(roles, 'User roles retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const getUserPermissionsHandler = async (req, res, next) => {
  try {
    // Allow users to check their own permissions or require roles:read for others
    const requestedUserId = req.params.userId || req.user?.id;
    const permissions = await getUserPermissions(requestedUserId);

    return res.json(
      createSuccessResponse({ permissions }, 'User permissions retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

