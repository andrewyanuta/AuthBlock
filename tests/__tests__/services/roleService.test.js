// Jest globals are available automatically
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
  userHasRole,
  userHasPermission,
} from '../../../src/services/roleService.js';
import {
  cleanupDatabase,
  createTestUser,
  createTestRole,
  createTestAdminUser,
  prisma,
} from '../../helpers/testHelpers.js';

describe('RoleService', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
    await prisma.$disconnect();
  });

  describe('createRole', () => {
    test('should create a new role', async () => {
      const roleData = {
        name: 'editor',
        description: 'Content Editor',
        permissions: ['content:read', 'content:write'],
      };

      const role = await createRole(
        roleData.name,
        roleData.description,
        roleData.permissions
      );

      expect(role).toBeDefined();
      expect(role.name).toBe(roleData.name);
      expect(role.description).toBe(roleData.description);
      expect(role.permissions).toEqual(roleData.permissions);
    });

    test('should throw error if role name already exists', async () => {
      await createTestRole({ name: 'duplicate' });

      await expect(
        createRole('duplicate', 'Description', [])
      ).rejects.toThrow('Role with this name already exists');
    });
  });

  describe('getAllRoles', () => {
    test('should retrieve all roles', async () => {
      await createTestRole({ name: 'role1' });
      await createTestRole({ name: 'role2' });

      const roles = await getAllRoles();

      expect(roles.length).toBeGreaterThanOrEqual(2);
      expect(roles.some((r) => r.name === 'role1')).toBe(true);
      expect(roles.some((r) => r.name === 'role2')).toBe(true);
    });
  });

  describe('assignRoleToUser', () => {
    test('should assign role to user', async () => {
      const user = await createTestUser();
      const role = await createTestRole();

      const userRole = await assignRoleToUser(user.id, role.id);

      expect(userRole).toBeDefined();
      expect(userRole.userId).toBe(user.id);
      expect(userRole.roleId).toBe(role.id);
    });

    test('should throw error if role already assigned', async () => {
      const user = await createTestUser();
      const role = await createTestRole();

      await assignRoleToUser(user.id, role.id);

      await expect(
        assignRoleToUser(user.id, role.id)
      ).rejects.toThrow('User already has this role');
    });
  });

  describe('getUserRoles', () => {
    test('should retrieve all roles for a user', async () => {
      const user = await createTestUser();
      const role1 = await createTestRole({ name: 'role1' });
      const role2 = await createTestRole({ name: 'role2' });

      await assignRoleToUser(user.id, role1.id);
      await assignRoleToUser(user.id, role2.id);

      const roles = await getUserRoles(user.id);

      expect(roles.length).toBe(2);
      expect(roles.some((r) => r.name === 'role1')).toBe(true);
      expect(roles.some((r) => r.name === 'role2')).toBe(true);
    });
  });

  describe('userHasPermission', () => {
    test('should return true if user has permission', async () => {
      const { user } = await createTestAdminUser();

      const hasPermission = await userHasPermission(user.id, 'system:admin');

      expect(hasPermission).toBe(true);
    });

    test('should return false if user does not have permission', async () => {
      const user = await createTestUser();

      const hasPermission = await userHasPermission(user.id, 'system:admin');

      expect(hasPermission).toBe(false);
    });

    test('should return true for any permission if user has system:admin', async () => {
      const { user } = await createTestAdminUser();

      const hasPermission = await userHasPermission(user.id, 'any:permission');

      expect(hasPermission).toBe(true);
    });
  });

  describe('userHasRole', () => {
    test('should return true if user has role', async () => {
      const { user } = await createTestAdminUser();

      const hasRole = await userHasRole(user.id, 'admin');

      expect(hasRole).toBe(true);
    });

    test('should return false if user does not have role', async () => {
      const user = await createTestUser();

      const hasRole = await userHasRole(user.id, 'admin');

      expect(hasRole).toBe(false);
    });
  });

  describe('deleteRole', () => {
    test('should delete role that is not assigned to users', async () => {
      const role = await createTestRole();

      const result = await deleteRole(role.id);

      expect(result.success).toBe(true);

      const deletedRole = await prisma.role.findUnique({
        where: { id: role.id },
      });

      expect(deletedRole).toBeNull();
    });

    test('should throw error if role is assigned to users', async () => {
      const user = await createTestUser();
      const role = await createTestRole();

      await assignRoleToUser(user.id, role.id);

      await expect(deleteRole(role.id)).rejects.toThrow(
        'Cannot delete role that is assigned to users'
      );
    });
  });
});

