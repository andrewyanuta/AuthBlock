// Jest globals are available automatically
import request from 'supertest';
import app from '../../../server.js';
import {
  cleanupDatabase,
  createTestUser,
  createTestAdminUser,
  generateAccessToken,
  prisma,
} from '../../helpers/testHelpers.js';

describe('Auth Routes', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        name: 'New User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.name).toBe(userData.name);
      expect(response.body.data.password).toBeUndefined();
    });

    test('should return error for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123!',
          name: 'User',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return error for weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'user@example.com',
          password: 'weak',
          name: 'User',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return error for duplicate email', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: user.email,
          password: 'SecurePass123!',
          name: 'Another User',
        })
        .expect(500); // Will be caught by error handler

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login user with correct credentials', async () => {
      const password = 'TestPassword123!';
      const user = await createTestUser({ password });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    test('should return error for incorrect password', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'WrongPassword123!',
        })
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    test('should return error for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    test('should return current user with valid JWT token', async () => {
      const user = await createTestUser();
      const token = await generateAccessToken(user.id);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(user.id);
      expect(response.body.data.email).toBe(user.email);
    });

    test('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should logout user successfully', async () => {
      const user = await createTestUser();
      const token = await generateAccessToken(user.id);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/auth/oauth/providers', () => {
    test('should return available OAuth providers', async () => {
      const response = await request(app)
        .get('/api/auth/oauth/providers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.providers).toBeDefined();
      expect(Array.isArray(response.body.data.providers)).toBe(true);
    });
  });
});

