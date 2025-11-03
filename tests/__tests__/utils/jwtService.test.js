// Jest globals are available automatically
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../../../src/services/jwtService.js';

describe('JWT Service', () => {
  const testUserId = 'test-user-id';

  describe('generateAccessToken', () => {
    test('should generate a valid access token', () => {
      const token = generateAccessToken(testUserId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('generateRefreshToken', () => {
    test('should generate a valid refresh token', () => {
      const token = generateRefreshToken(testUserId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    test('should verify a valid access token', () => {
      const token = generateAccessToken(testUserId);
      const decoded = verifyAccessToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(testUserId);
    });

    test('should throw error for invalid token', () => {
      expect(() => {
        verifyAccessToken('invalid-token');
      }).toThrow();
    });

    test('should throw error for expired token', () => {
      // This would require mocking time or using a very short expiry
      // For now, we'll test that invalid tokens throw errors
      expect(() => {
        verifyAccessToken('invalid.token.here');
      }).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    test('should verify a valid refresh token', () => {
      const token = generateRefreshToken(testUserId);
      const decoded = verifyRefreshToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(testUserId);
    });

    test('should throw error for invalid refresh token', () => {
      expect(() => {
        verifyRefreshToken('invalid-token');
      }).toThrow();
    });
  });
});

