import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin role with permissions
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator role with full system access',
      permissions: [
        'roles:create',
        'roles:read',
        'roles:update',
        'roles:delete',
        'roles:assign',
        'users:create',
        'users:read',
        'users:update',
        'users:delete',
        'system:admin',
      ],
    },
  });

  console.log('✅ Admin role created:', adminRole.name);

  // Create default admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  const adminName = process.env.ADMIN_NAME || 'Administrator';

  // Hash password
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  // Check if admin user already exists
  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!adminUser) {
    // Create admin user
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        provider: 'email',
      },
    });

    console.log('✅ Admin user created:', adminUser.email);
  } else {
    // Update password if user exists
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { password: hashedPassword },
    });

    console.log('✅ Admin user password updated:', adminUser.email);
  }

  // Assign admin role to user if not already assigned
  const existingUserRole = await prisma.userRole.findUnique({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
  });

  if (!existingUserRole) {
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });

    console.log('✅ Admin role assigned to user');
  } else {
    console.log('✅ Admin role already assigned to user');
  }

  // Create additional default roles (optional)
  const defaultRoles = [
    {
      name: 'user',
      description: 'Standard user role',
      permissions: [],
    },
    {
      name: 'moderator',
      description: 'Moderator role with limited admin permissions',
      permissions: [
        'users:read',
        'users:update',
      ],
    },
  ];

  for (const roleData of defaultRoles) {
    await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: roleData,
    });
    console.log(`✅ ${roleData.name} role created`);
  }

  console.log('🎉 Seeding completed!');
  console.log('\n📋 Default Admin Credentials:');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log('\n⚠️  Please change the default password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

