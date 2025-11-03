import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Initialize Prisma Client
// The DATABASE_URL will be set by tests/setup.js before this runs
const prisma = new PrismaClient();

export const cleanupDatabase = async () => {
  // Ensure Prisma client is initialized
  if (!prisma) {
    throw new Error('Prisma client not initialized');
  }
  
  try {
    // Delete in correct order to respect foreign key constraints
    await prisma.userRole.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.role.deleteMany({});
    await prisma.user.deleteMany({});
  } catch (error) {
    // If models don't exist yet, that's okay - database might not be migrated
    if (error.message.includes('does not exist')) {
      console.warn('Database tables not found - run migrations first');
      return;
    }
    throw error;
  }
};

export const createTestUser = async (userData = {}) => {
  const defaultUser = {
    email: 'test@example.com',
    password: 'Test123456!',
    name: 'Test User',
    provider: 'email',
    ...userData,
  };

  const hashedPassword = await bcrypt.hash(defaultUser.password, 12);

  return await prisma.user.create({
    data: {
      ...defaultUser,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      name: true,
      provider: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const createTestRole = async (roleData = {}) => {
  const defaultRole = {
    name: 'test-role',
    description: 'Test role',
    permissions: ['test:permission'],
    ...roleData,
  };

  return await prisma.role.create({
    data: defaultRole,
  });
};

export const createTestAdminUser = async () => {
  // Create admin role first
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator',
      permissions: ['system:admin', 'roles:create', 'roles:read'],
    },
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 12);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      password: hashedPassword,
      name: 'Admin User',
      provider: 'email',
    },
  });

  // Assign admin role
  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  return { user: adminUser, role: adminRole };
};

export const generateAccessToken = async (userId) => {
  const jwt = await import('../../src/services/jwtService.js');
  return jwt.generateAccessToken(userId);
};

export { prisma };
export default {
  cleanupDatabase,
  createTestUser,
  createTestRole,
  createTestAdminUser,
  generateAccessToken,
  prisma,
};

