import prisma from '../config/database.js';
import { createErrorResponse } from '../utils/helpers.js';

export const createRole = async (name, description, permissions = []) => {
  // Check if role already exists
  const existingRole = await prisma.role.findUnique({
    where: { name },
  });

  if (existingRole) {
    throw new Error('Role with this name already exists');
  }

  const role = await prisma.role.create({
    data: {
      name,
      description,
      permissions,
    },
  });

  return role;
};

export const getAllRoles = async () => {
  const roles = await prisma.role.findMany({
    include: {
      _count: {
        select: { userRoles: true },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return roles;
};

export const getRoleById = async (roleId) => {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      userRoles: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!role) {
    throw new Error('Role not found');
  }

  return role;
};

export const updateRole = async (roleId, data) => {
  const { name, description, permissions } = data;

  // Check if role exists
  const existingRole = await prisma.role.findUnique({
    where: { id: roleId },
  });

  if (!existingRole) {
    throw new Error('Role not found');
  }

  // Check if name is being changed and if new name already exists
  if (name && name !== existingRole.name) {
    const nameExists = await prisma.role.findUnique({
      where: { name },
    });

    if (nameExists) {
      throw new Error('Role with this name already exists');
    }
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (permissions !== undefined) updateData.permissions = permissions;

  const role = await prisma.role.update({
    where: { id: roleId },
    data: updateData,
  });

  return role;
};

export const deleteRole = async (roleId) => {
  // Check if role exists
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      _count: {
        select: { userRoles: true },
      },
    },
  });

  if (!role) {
    throw new Error('Role not found');
  }

  // Check if role is assigned to any users
  if (role._count.userRoles > 0) {
    throw new Error('Cannot delete role that is assigned to users. Please remove all user assignments first.');
  }

  await prisma.role.delete({
    where: { id: roleId },
  });

  return { success: true, message: 'Role deleted successfully' };
};

export const assignRoleToUser = async (userId, roleId) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if role exists
  const role = await prisma.role.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    throw new Error('Role not found');
  }

  // Check if assignment already exists
  const existingAssignment = await prisma.userRole.findUnique({
    where: {
      userId_roleId: {
        userId,
        roleId,
      },
    },
  });

  if (existingAssignment) {
    throw new Error('User already has this role');
  }

  const userRole = await prisma.userRole.create({
    data: {
      userId,
      roleId,
    },
    include: {
      role: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return userRole;
};

export const removeRoleFromUser = async (userId, roleId) => {
  const userRole = await prisma.userRole.findUnique({
    where: {
      userId_roleId: {
        userId,
        roleId,
      },
    },
  });

  if (!userRole) {
    throw new Error('User does not have this role');
  }

  await prisma.userRole.delete({
    where: {
      userId_roleId: {
        userId,
        roleId,
      },
    },
  });

  return { success: true, message: 'Role removed from user successfully' };
};

export const getUserRoles = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user.userRoles.map((ur) => ur.role);
};

export const getUserPermissions = async (userId) => {
  const roles = await getUserRoles(userId);
  
  // Collect all unique permissions from all user roles
  const allPermissions = roles.flatMap((role) => role.permissions || []);
  const uniquePermissions = [...new Set(allPermissions)];

  return uniquePermissions;
};

export const userHasRole = async (userId, roleName) => {
  const roles = await getUserRoles(userId);
  return roles.some((role) => role.name === roleName);
};

export const userHasPermission = async (userId, permission) => {
  const permissions = await getUserPermissions(userId);
  
  // Admin users have all permissions implicitly via system:admin permission
  if (permissions.includes('system:admin')) {
    return true;
  }
  
  return permissions.includes(permission);
};

