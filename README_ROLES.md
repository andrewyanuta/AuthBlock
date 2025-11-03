# Role Management System

## Overview

The authentication microservice includes a comprehensive role-based access control (RBAC) system that allows you to manage roles and permissions for users.

## Default Admin User

A default admin user is created when you run the seed script:

**Default Credentials:**
- Email: `admin@example.com` (or set via `ADMIN_EMAIL` env variable)
- Password: `Admin123!` (or set via `ADMIN_PASSWORD` env variable)
- Name: `Administrator` (or set via `ADMIN_NAME` env variable)

⚠️ **IMPORTANT**: Change the default password immediately after first login!

## Setup

1. Run database migrations:
```bash
npm run prisma:migrate
```

2. Seed the database (creates admin user and default roles):
```bash
npm run prisma:seed
```

Or set custom admin credentials:
```bash
ADMIN_EMAIL=admin@yourdomain.com ADMIN_PASSWORD=YourSecurePassword123! npm run prisma:seed
```

## Default Roles

The seed script creates three default roles:

1. **admin** - Full system access with all permissions
2. **user** - Standard user with no special permissions
3. **moderator** - Limited admin permissions (users:read, users:update)

## Permissions

Permissions are stored as strings in an array. Common permission patterns:
- `roles:create`, `roles:read`, `roles:update`, `roles:delete`, `roles:assign`
- `users:create`, `users:read`, `users:update`, `users:delete`
- `system:admin` - Special permission that grants all access

## API Endpoints

### Role Management

All role management endpoints require authentication and appropriate permissions.

#### Create Role
```http
POST /api/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "editor",
  "description": "Content editor role",
  "permissions": ["content:create", "content:update", "content:read"]
}
```

#### Get All Roles
```http
GET /api/roles
Authorization: Bearer <token>
```

#### Get Role by ID
```http
GET /api/roles/:id
Authorization: Bearer <token>
```

#### Update Role
```http
PUT /api/roles/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "editor",
  "description": "Updated description",
  "permissions": ["content:create", "content:update", "content:read", "content:delete"]
}
```

#### Delete Role
```http
DELETE /api/roles/:id
Authorization: Bearer <token>
```

⚠️ **Note**: Cannot delete roles that are assigned to users.

### User Role Assignment

#### Assign Role to User
```http
POST /api/roles/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-uuid",
  "roleId": "role-uuid"
}
```

#### Remove Role from User
```http
POST /api/roles/remove
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-uuid",
  "roleId": "role-uuid"
}
```

#### Get User Roles
```http
GET /api/roles/user/:userId
Authorization: Bearer <token>
```

#### Get User Permissions
```http
GET /api/roles/user/:userId/permissions
Authorization: Bearer <token>
```

## Using RBAC Middleware

You can protect routes using role and permission middleware:

```javascript
import { requirePermission, requireRole } from './middleware/rbacMiddleware.js';

// Require specific permission
router.get('/protected', requirePermission('users:read'), handler);

// Require specific role
router.post('/admin-only', requireRole('admin'), handler);
```

## User Object

The user object now includes roles in the `/api/auth/me` endpoint:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "provider": "email",
    "userRoles": [
      {
        "role": {
          "id": "uuid",
          "name": "admin",
          "description": "Administrator role",
          "permissions": ["system:admin", ...]
        }
      }
    ]
  }
}
```

## Admin Bypass

Users with the `admin` role automatically have access to all permissions, bypassing individual permission checks.

