// Jest globals are available automatically
import request from 'supertest';
import app from '../../../server.js';
import {
  cleanupDatabase,
  createTestUser,
  createTestAdminUser,
  createTestRole,
  generateAccessToken,
  prisma,
} from '../../helpers/testHelpers.js';

describe('Role Routes', () => {
  let adminToken;
  let userToken;

  beforeEach(async () => {
    await cleanupDatabase();
    const { user: admin } = await createTestAdminUser();
    const user = await createTestUser();
    adminToken = await generateAccessToken(admin.id);
    userToken = await generateAccessToken(user.id);
  });

  afterEach(async () => {
    await cleanupDatabase();
    await prisma.$disconnect();
  });

  describe('POST /api/roles', () => {
    test('should create role as admin', async () => {
      const roleData = {
        name: 'editor',
        description: 'Content Editor',
        permissions: ['content:read', 'content:write'],
      };

      const response = await request(app)
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(roleData.name);
    });

    test('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .post('/api/roles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'editor',
          permissions: [],
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/roles', () => {
    test('should get all roles as admin', async () => {
      await createTestRole({ name: 'role1' });
      await createTestRole({ name: 'role2' });

      const response = await request(app)
        .get('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('POST /api/roles/assign', () => {
    test('should assign role to user as admin', async () => {
      const user = await createTestUser({ email: 'test@example.com' });
      const role = await createTestRole();

      const response = await request(app)
        .post('/api/roles/assign')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: user.id,
          roleId: role.id,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/roles/user/:userId', () => {
    test('should get user roles as admin', async () => {
      const user = await createTestUser();
      const role = await createTestRole();

      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });

      const response = await request(app)
        .get(`/api/roles/user/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe(role.name);
    });
  });

  describe('GET /api/roles/me/permissions', () => {
    test('should get current user permissions', async () => {
      const response = await request(app)
        .get('/api/roles/me/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.permissions).toBeDefined();
      expect(Array.isArray(response.body.data.permissions)).toBe(true);
    });
  });
});
