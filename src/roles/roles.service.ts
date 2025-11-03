import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async createRole(name: string, description?: string, permissions: string[] = []) {
    const existingRole = await this.prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    return this.prisma.role.create({
      data: {
        name,
        description,
        permissions,
      },
    });
  }

  async getAllRoles() {
    return this.prisma.role.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRoleById(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async getRoleByName(name: string) {
    return this.prisma.role.findUnique({
      where: { name },
    });
  }

  async updateRole(roleId: string, data: { name?: string; description?: string; permissions?: string[] }) {
    return this.prisma.role.update({
      where: { id: roleId },
      data,
    });
  }

  async deleteRole(roleId: string) {
    // Check if role is assigned to any users
    const userRoles = await this.prisma.userRole.findMany({
      where: { roleId },
    });

    if (userRoles.length > 0) {
      throw new ConflictException('Cannot delete role that is assigned to users');
    }

    await this.prisma.role.delete({
      where: { id: roleId },
    });

    return { success: true, message: 'Role deleted successfully' };
  }

  async assignRoleToUser(userId: string, roleId: string) {
    const existingUserRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    if (existingUserRole) {
      throw new ConflictException('User already has this role');
    }

    return this.prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
    });
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    const userRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    if (!userRole) {
      throw new NotFoundException('User does not have this role');
    }

    await this.prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    return { success: true, message: 'Role removed from user successfully' };
  }

  async getUserRoles(userId: string) {
    const user = await this.prisma.user.findUnique({
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
      throw new NotFoundException('User not found');
    }

    return user.userRoles.map((ur) => ur.role);
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const roles = await this.getUserRoles(userId);
    const permissions = new Set<string>();

    roles.forEach((role) => {
      role.permissions.forEach((permission) => permissions.add(permission));
    });

    return Array.from(permissions);
  }

  async userHasRole(userId: string, roleName: string): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.some((role) => role.name === roleName);
  }

  async userHasPermission(userId: string, permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);

    // Admin users have all permissions implicitly
    if (permissions.includes('system:admin')) {
      return true;
    }

    return permissions.includes(permission);
  }
}

