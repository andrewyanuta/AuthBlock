import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set NODE_ENV first
process.env.NODE_ENV = 'test';

// Load test environment variables from .env.test if it exists
const envTestPath = join(__dirname, '..', '.env.test');
if (existsSync(envTestPath)) {
  dotenv.config({ path: envTestPath });
}

// Load .env if it exists (as fallback)
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath, override: false });
}

// Set default test environment variables if not already set
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only-min-32-chars-long-required';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-key-for-testing-only-min-32-chars-long';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test-session-secret-for-testing-only-min-32-chars-long';

// Use TEST_DATABASE_URL if provided, otherwise use DATABASE_URL, or fallback to default
const testDbUrl = process.env.TEST_DATABASE_URL || 
                  process.env.DATABASE_URL || 
                  'postgresql://postgres:postgres@localhost:5432/authdb_test?schema=public';
process.env.DATABASE_URL = testDbUrl;

// Set other defaults for tests
process.env.PORT = process.env.PORT || '3000';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Suppress console output in tests
if (process.env.NODE_ENV === 'test') {
  // Keep console.error and console.warn for debugging
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalDebug = console.debug;
  
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  
  // Restore on exit
  process.on('exit', () => {
    console.log = originalLog;
    console.info = originalInfo;
    console.debug = originalDebug;
  });
}

