# Authentication Microservice

A comprehensive Node.js authentication microservice built with Express, PostgreSQL, and Prisma. Supports multiple authentication methods including email/password registration/login, OAuth providers (Google, Facebook, GitHub), and both JWT tokens and session-based authentication.

## Features

- ✅ Email/Password Authentication
- ✅ OAuth Integration (Google, Facebook, GitHub)
- ✅ JWT Token Authentication
- ✅ Session-Based Authentication
- ✅ Dual Authentication Support (JWT + Session)
- ✅ Password Hashing with bcrypt
- ✅ Input Validation
- ✅ Rate Limiting
- ✅ Security Headers (Helmet.js)
- ✅ CORS Support
- ✅ PostgreSQL Database with Prisma ORM

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. Clone the repository and navigate to the project directory:
```bash
cd AuthMicroBlock
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update `.env` file with your configuration:
   - Database connection string
   - JWT secrets
   - OAuth client IDs and secrets (see OAuth Setup section below)
   - Session secret

5. Generate Prisma Client:
```bash
npm run prisma:generate
```

6. Run database migrations:
```bash
npm run prisma:migrate
```

7. Start the server:
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/authdb?schema=public"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=30d

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
SESSION_MAX_AGE=86400000

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# OAuth - Facebook
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:3000/api/auth/facebook/callback

# OAuth - GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# CORS
CORS_ORIGIN=http://localhost:3000
```

## OAuth Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client ID
5. Set authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
6. Copy the Client ID and Client Secret to your `.env` file

### Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add "Facebook Login" product
4. Go to Settings > Basic and copy App ID and App Secret
5. Add redirect URI: `http://localhost:3000/api/auth/facebook/callback`
6. Update your `.env` file with App ID and App Secret

### GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/github/callback`
4. Copy Client ID and generate Client Secret
5. Update your `.env` file with Client ID and Client Secret

## API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "provider": "email",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Login (JWT + Session)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "provider": "email"
    },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

#### Login (JWT Only)
```http
POST /api/auth/login/jwt
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Login (Session Only)
```http
POST /api/auth/login/session
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### OAuth - Google
```http
GET /api/auth/google
```
Redirects to Google OAuth consent screen.

```http
GET /api/auth/google/callback
```
OAuth callback endpoint (returns JWT tokens).

```http
GET /api/auth/google/callback/session
```
OAuth callback endpoint (returns session).

#### OAuth - Facebook
```http
GET /api/auth/facebook
```
Redirects to Facebook OAuth consent screen.

```http
GET /api/auth/facebook/callback
```
OAuth callback endpoint (returns JWT tokens).

```http
GET /api/auth/facebook/callback/session
```
OAuth callback endpoint (returns session).

#### OAuth - GitHub
```http
GET /api/auth/github
```
Redirects to GitHub OAuth consent screen.

```http
GET /api/auth/github/callback
```
OAuth callback endpoint (returns JWT tokens).

```http
GET /api/auth/github/callback/session
```
OAuth callback endpoint (returns session).

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <jwt-token>
```
Or using session cookies.

**Response:**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt-token>
```
Or using session cookies.

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "provider": "email",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### User Endpoints

#### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <jwt-token>
```

## Using JWT Tokens

After logging in or completing OAuth flow, you'll receive an `accessToken`. Include it in requests:

```http
Authorization: Bearer <accessToken>
```

## Using Session Authentication

When using session-based authentication, the session cookie is automatically set. Make sure to include credentials in your requests:

```javascript
fetch('http://localhost:3000/api/auth/me', {
  credentials: 'include'
})
```

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **Registration**: 3 requests per hour per IP

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token expiration
- Session-based authentication with secure cookies
- Rate limiting to prevent brute force attacks
- Input validation and sanitization
- Security headers via Helmet.js
- CORS protection
- SQL injection protection via Prisma

## Project Structure

```
AuthMicroBlock/
├── src/
│   ├── controllers/      # Request handlers
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── middleware/       # Custom middleware
│   ├── utils/           # Utility functions
│   └── config/          # Configuration files
├── prisma/
│   └── schema.prisma    # Database schema
├── server.js            # Application entry point
└── package.json         # Dependencies
```

## Development

Run in development mode with auto-reload:
```bash
npm run dev
```

Generate Prisma Client:
```bash
npm run prisma:generate
```

Run database migrations:
```bash
npm run prisma:migrate
```

Open Prisma Studio (database GUI):
```bash
npm run prisma:studio
```

## Production Considerations

1. **Change all default secrets** in production
2. **Use HTTPS** for all endpoints
3. **Set secure cookie flags** in production (`secure: true`)
4. **Use environment-specific database URLs**
5. **Implement refresh token rotation**
6. **Add logging and monitoring**
7. **Set up database backups**
8. **Configure proper CORS origins**

## License

ISC

## Support

For issues and questions, please open an issue on the repository.

