# Authentication Microservice with React UI

A comprehensive Node.js authentication microservice built with Express, PostgreSQL, Prisma, and React. Supports multiple authentication methods including email/password registration/login, OAuth providers (Google, Facebook, GitHub), and both JWT tokens and session-based authentication.

## Features

- ✅ Email/Password Authentication
- ✅ OAuth Integration (Google, Facebook, GitHub) - Optional
- ✅ JWT Token Authentication
- ✅ Session-Based Authentication
- ✅ Dual Authentication Support (JWT + Session)
- ✅ React Frontend with Modern UI
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
   - OAuth client IDs and secrets (optional - see OAuth Setup section below)
   - Session secret

5. Generate Prisma Client:
```bash
npm run prisma:generate
```

6. Run database migrations:
```bash
npm run prisma:migrate
```

## Development

### Running the Application

You'll need to run both the backend server and the React development server:

**Terminal 1 - Backend Server:**
```bash
npm run dev
```

**Terminal 2 - React Development Server:**
```bash
npm run dev:client
```

- Backend API: `http://localhost:3000`
- React Frontend: `http://localhost:5173`

The React dev server is configured to proxy API requests to the backend.

### Production Build

1. Build the React app:
```bash
npm run build
```

2. Start the production server:
```bash
NODE_ENV=production npm start
```

The server will serve the built React app on port 3000.

## Project Structure

```
AuthMicroBlock/
├── src/
│   ├── config/          # Backend configuration
│   ├── controllers/     # Request handlers
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Utility functions
│   ├── context/        # React context (AuthContext)
│   └── pages/          # React pages/components
├── prisma/
│   └── schema.prisma   # Database schema
├── public/             # Static files (development fallback)
├── dist/               # React build output (production)
├── server.js           # Backend entry point
├── vite.config.js      # Vite configuration
└── package.json        # Dependencies
```

## Environment Variables

Create a `.env` file in the root directory:

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

# OAuth - Google (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5173/api/auth/google/callback

# OAuth - Facebook (Optional)
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:5173/api/auth/facebook/callback

# OAuth - GitHub (Optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:5173/api/auth/github/callback

# CORS (comma-separated for multiple origins)
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

## OAuth Setup

OAuth providers are **optional**. If client IDs are not set, OAuth buttons won't appear in the UI.

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client ID
5. Set authorized redirect URI: `http://localhost:5173/api/auth/google/callback`
6. Copy the Client ID and Client Secret to your `.env` file

### Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add "Facebook Login" product
4. Go to Settings > Basic and copy App ID and App Secret
5. Add redirect URI: `http://localhost:5173/api/auth/facebook/callback`
6. Update your `.env` file with App ID and App Secret

### GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:5173/api/auth/github/callback`
4. Copy Client ID and generate Client Secret
5. Update your `.env` file with Client ID and Client Secret

## API Endpoints

All API endpoints are prefixed with `/api/auth`:

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (JWT + Session)
- `POST /api/auth/login/jwt` - Login (JWT only)
- `POST /api/auth/login/session` - Login (Session only)
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/facebook` - Facebook OAuth
- `GET /api/auth/github` - GitHub OAuth
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `GET /api/auth/oauth/providers` - Get available OAuth providers

## React Routes

- `/` - Home page
- `/login` - Login page
- `/register` - Register page
- `/dashboard` - User dashboard (protected)

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

## Development Scripts

- `npm run dev` - Start backend server with nodemon
- `npm run dev:client` - Start React development server
- `npm run build` - Build React app for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Production Considerations

1. **Change all default secrets** in production
2. **Use HTTPS** for all endpoints
3. **Set secure cookie flags** in production (`secure: true`)
4. **Use environment-specific database URLs**
5. **Update OAuth callback URLs** for production domain
6. **Set proper CORS origins** in production
7. **Implement refresh token rotation**
8. **Add logging and monitoring**
9. **Set up database backups**

## License

ISC
