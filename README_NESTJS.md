# NestJS Migration

The application has been migrated from Express to NestJS. This provides:

- **Better structure**: Modular architecture with clear separation of concerns
- **TypeScript support**: Type-safe codebase with decorators and dependency injection
- **Built-in features**: Validation, guards, interceptors, and more
- **Scalability**: Easier to maintain and extend

## Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
├── prisma/                 # Prisma service module
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── auth/                   # Authentication module
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   │   └── auth.dto.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── local-auth.guard.ts
│   └── strategies/
│       ├── jwt.strategy.ts
│       └── local.strategy.ts
├── users/                  # Users module
│   ├── users.module.ts
│   ├── users.controller.ts
│   └── users.service.ts
└── roles/                  # Roles module
    ├── roles.module.ts
    ├── roles.controller.ts
    ├── roles.service.ts
    ├── dto/
    │   └── roles.dto.ts
    └── guards/
        └── roles.guard.ts
```

## Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

## API Endpoints

All endpoints now use the `/api` prefix:

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `GET /api/users/:id` - Get user by ID
- `GET /api/roles` - Get all roles
- `POST /api/roles` - Create a role
- `POST /api/roles/assign` - Assign role to user
- `GET /api/roles/me/permissions` - Get current user permissions

## Key Differences from Express

1. **Modules**: Code is organized into feature modules
2. **Dependency Injection**: Services are injected via constructors
3. **Guards**: Replace Express middleware for authentication/authorization
4. **DTOs**: Data Transfer Objects for validation
5. **Decorators**: Use `@Controller()`, `@Get()`, `@Post()`, etc.

## Next Steps

- Add OAuth strategies (Google, Facebook, GitHub)
- Implement session-based authentication
- Add rate limiting interceptors
- Create custom decorators for permissions
- Add Swagger/OpenAPI documentation

