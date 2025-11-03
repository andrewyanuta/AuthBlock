# Running Tests

## Prerequisites

1. **Test Database**: Create a separate test database
   ```bash
   createdb authdb_test
   ```

2. **Environment Variables**: Create `.env.test` file (optional)
   ```env
   TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/authdb_test?schema=public
   JWT_SECRET=test-jwt-secret
   JWT_REFRESH_SECRET=test-refresh-secret
   SESSION_SECRET=test-session-secret
   ```

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

## Test Structure

- Unit tests test individual functions
- Integration tests test API endpoints with database
- Component tests test React components

## Notes

- Tests run sequentially (`--runInBand`) to avoid database conflicts
- Database is cleaned before/after each test
- Use test helpers from `tests/helpers/testHelpers.js`
