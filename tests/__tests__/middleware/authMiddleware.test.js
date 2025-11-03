// Jest globals are available automatically
import { verifyJWT, verifySession } from '../../../src/middleware/authMiddleware.js';
import { createTestUser, generateAccessToken, cleanupDatabase, prisma } from '../../helpers/testHelpers.js';

describe('AuthMiddleware', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
    await prisma.$disconnect();
  });

  const mockRequest = (headers = {}, user = null, isAuthenticated = false) => ({
    headers,
    user,
    isAuthenticated: () => isAuthenticated,
    session: { passport: { user: user?.id } },
  });

  const mockResponse = () => {
    const res = {};
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.body = data;
      return res;
    };
    return res;
  };

  describe('verifyJWT', () => {
    test('should return 401 if no token provided', async () => {
      const req = mockRequest();
      const res = mockResponse();
      let nextCalled = false;

      await verifyJWT(req, res, () => { nextCalled = true; });

      expect(res.statusCode).toBe(401);
      expect(nextCalled).toBe(false);
    });

    test('should pass with valid token', async () => {
      const user = await createTestUser();
      const token = await generateAccessToken(user.id);

      const req = mockRequest({
        authorization: `Bearer ${token}`,
      });
      const res = mockResponse();
      let nextCalled = false;

      await verifyJWT(req, res, () => { nextCalled = true; });

      expect(nextCalled).toBe(true);
      expect(req.user).toBeDefined();
      expect(req.authType).toBe('jwt');
    });
  });

  describe('verifySession', () => {
    test('should pass if user is authenticated via session', () => {
      const req = mockRequest({}, { id: 'user-id' }, true);
      const res = mockResponse();
      let nextCalled = false;

      verifySession(req, res, () => { nextCalled = true; });

      expect(nextCalled).toBe(true);
      expect(req.authType).toBe('session');
    });

    test('should return 401 if user is not authenticated', () => {
      const req = mockRequest({}, null, false);
      const res = mockResponse();
      let nextCalled = false;

      verifySession(req, res, () => { nextCalled = true; });

      expect(res.statusCode).toBe(401);
      expect(nextCalled).toBe(false);
    });
  });
});
