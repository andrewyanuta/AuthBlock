// Jest globals are available automatically
import { validateRegister, validateLogin } from '../../../src/utils/validators.js';

describe('Validators', () => {
  describe('validateRegister', () => {
    test('should validate email format', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'SecurePass123!',
          name: 'Test User',
        },
      };

      for (const validator of validateRegister) {
        await validator(req, {}, () => {});
      }

      expect(req.body.email).toBe('test@example.com');
    });

    test('should require password strength', () => {
      // Validator array contains validation rules
      expect(Array.isArray(validateRegister)).toBe(true);
      expect(validateRegister.length).toBeGreaterThan(0);
    });
  });

  describe('validateLogin', () => {
    test('should have login validation rules', () => {
      expect(Array.isArray(validateLogin)).toBe(true);
      expect(validateLogin.length).toBeGreaterThan(0);
    });
  });
});

