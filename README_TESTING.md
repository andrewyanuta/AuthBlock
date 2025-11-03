# Testing Guide

This project includes comprehensive unit and functional tests using Jest and Supertest.

## Test Structure

```
tests/
├── __tests__/
│   ├── services/         # Service layer tests
│   ├── routes/           # API route tests
│   ├── middleware/       # Middleware tests
│   ├── components/       # React component tests
│   └── utils/            # Utility function tests
├── helpers/              # Test helpers and utilities
└── setup.js              # Test setup and configuration
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Test Environment Setup

### 1. Create Test Database

First, create a separate test database:

```bash
# PostgreSQL
createdb authdb_test

# Or using psql
psql -U postgres -c "CREATE DATABASE authdb_test;"
```

### 2. Run Migrations on Test Database

```bash
# Set test database URL
export TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/authdb_test?schema=public

# Run migrations
npm run prisma:migrate
```

Or create a `.env.test` file in the project root:

```env
# .env.test
NODE_ENV=test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/authdb_test?schema=public
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/authdb_test?schema=public

# JWT Secrets (minimum 32 characters recommended)
JWT_SECRET=test-jwt-secret-key-for-testing-only-min-32-chars-long
JWT_REFRESH_SECRET=test-refresh-secret-key-for-testing-only-min-32-chars-long
SESSION_SECRET=test-session-secret-for-testing-only-min-32-chars-long

# Optional
PORT=3000
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

### 3. Environment Variable Priority

The test setup (`tests/setup.js`) loads environment variables in this order:
1. `.env.test` file (if exists)
2. `.env` file (as fallback)
3. Default test values (if not set)

You can also set environment variables directly:
```bash
# Windows PowerShell
$env:TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/authdb_test?schema=public"
npm test

# Linux/Mac
export TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/authdb_test?schema=public
npm test
```

## Test Categories

### Unit Tests
- **Services**: Test business logic in isolation
- **Utils**: Test utility functions
- **Middleware**: Test authentication and authorization logic

### Integration Tests
- **Routes**: Test API endpoints with database interactions
- **End-to-End**: Test complete user flows

### Component Tests
- **React Components**: Test UI components with React Testing Library

## Test Helpers

The `tests/helpers/testHelpers.js` file provides utilities:

- `cleanupDatabase()` - Clear all test data
- `createTestUser()` - Create a test user
- `createTestRole()` - Create a test role
- `createTestAdminUser()` - Create admin user with admin role
- `generateAccessToken()` - Generate JWT token for testing

## Writing Tests

### Example: Service Test
```javascript
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { registerUser } from '../../../src/services/authService.js';
import { cleanupDatabase, prisma } from '../../helpers/testHelpers.js';

describe('AuthService', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
    await prisma.$disconnect();
  });

  test('should register user', async () => {
    const user = await registerUser(
      'test@example.com',
      'Password123!',
      'Test User'
    );

    expect(user.email).toBe('test@example.com');
  });
});
```

### Example: Route Test
```javascript
import request from 'supertest';
import app from '../../../server.js';

test('should login user', async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'test@example.com',
      password: 'Password123!',
    })
    .expect(200);

  expect(response.body.success).toBe(true);
});
```

## Coverage

The project aims for:
- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

View coverage report:
```bash
npm run test:coverage
```

Then open `coverage/lcov-report/index.html` in your browser.

## Best Practices

1. **Clean Database**: Always clean up test data in `beforeEach` and `afterEach`
2. **Isolation**: Tests should not depend on each other
3. **Mocking**: Mock external services and dependencies
4. **Assertions**: Use specific assertions (e.g., `toBe()` vs `toBeTruthy()`)
5. **Descriptive Names**: Use clear test descriptions

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm test
  
- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Troubleshooting

### Database connection errors
- Ensure PostgreSQL is running
- Check `TEST_DATABASE_URL` is set correctly
- Create test database: `createdb authdb_test`

### Port conflicts
- Tests should use different ports or mock the server
- Check for running instances on test ports

### Timeout errors
- Increase timeout in `jest.config.js`
- Check for hanging database connections

