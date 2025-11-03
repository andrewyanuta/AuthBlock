// Jest globals are available automatically
import {
  registerUser,
  loginUser,
  createJWTToken,
  getUserById,
} from '../../../src/services/authService.js';
import { cleanupDatabase, createTestUser, prisma } from '../../helpers/testHelpers.js';

describe('AuthService', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
    await prisma.$disconnect();
  });

  describe('registerUser', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        name: 'New User',
      };

      const user = await registerUser(
        userData.email,
        userData.password,
        userData.name
      );

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.provider).toBe('email');
      expect(user.password).toBeUndefined(); // Should not be in response
    });

    test('should throw error if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'Password123!',
        name: 'Existing User',
      };

      await createTestUser({ email: userData.email });

      await expect(
        registerUser(userData.email, userData.password, userData.name)
      ).rejects.toThrow('User with this email already exists');
    });
  });

  describe('loginUser', () => {
    test('should login user with correct credentials', async () => {
      const password = 'TestPassword123!';
      const user = await createTestUser({ password });

      const result = await loginUser(user.email, password);

      expect(result).toBeDefined();
      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
      expect(result.password).toBeUndefined();
    });

    test('should throw error with incorrect password', async () => {
      const user = await createTestUser();

      await expect(
        loginUser(user.email, 'WrongPassword123!')
      ).rejects.toThrow('Invalid email or password');
    });

    test('should throw error with non-existent email', async () => {
      await expect(
        loginUser('nonexistent@example.com', 'Password123!')
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('createJWTToken', () => {
    test('should create JWT tokens and store refresh token', async () => {
      const user = await createTestUser();

      const tokens = await createJWTToken(user.id);

      expect(tokens).toBeDefined();
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();

      // Verify refresh token is stored in database
      const session = await prisma.session.findFirst({
        where: {
          userId: user.id,
          type: 'jwt',
        },
      });

      expect(session).toBeDefined();
      expect(session.token).toBe(tokens.refreshToken);
    });
  });

  describe('getUserById', () => {
    test('should retrieve user by ID', async () => {
      const user = await createTestUser();

      const retrievedUser = await getUserById(user.id);

      expect(retrievedUser).toBeDefined();
      expect(retrievedUser.id).toBe(user.id);
      expect(retrievedUser.email).toBe(user.email);
    });

    test('should return null for non-existent user', async () => {
      const retrievedUser = await getUserById('non-existent-id');
      expect(retrievedUser).toBeNull();
    });

    test('should include user roles when available', async () => {
      const user = await createTestUser();
      const role = await prisma.role.create({
        data: {
          name: 'test-role',
          permissions: ['test:permission'],
        },
      });

      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });

      const retrievedUser = await getUserById(user.id);

      expect(retrievedUser.userRoles).toBeDefined();
      expect(retrievedUser.userRoles.length).toBe(1);
      expect(retrievedUser.userRoles[0].role.name).toBe('test-role');
    });
  });
});

