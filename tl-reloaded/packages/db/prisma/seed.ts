import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Admin User
  console.log('👤 Creating admin user...');
  const adminPasswordHash = await bcrypt.hash('adminadmin', 10);
  
  // Check if admin user exists (by username or old email)
  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { username: 'admin' },
        { email: 'admin' },
        { email: 'admin@test.com' },
      ],
    },
  });

  let admin;
  if (existingAdmin) {
    // Update existing admin
    admin = await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        email: 'admin@test.com',
        username: 'admin',
        passwordHash: adminPasswordHash,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
      },
    });
  } else {
    // Create new admin
    admin = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        username: 'admin',
        passwordHash: adminPasswordHash,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
      },
    });
  }
  console.log('✅ Admin user created:', admin.email);

  // 2. Create Default School Year (Schuljahr)
  console.log('📅 Creating default school year...');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const schoolYearStart = new Date(currentYear, 8, 1); // September 1st
  const schoolYearEnd = new Date(currentYear + 1, 6, 30); // June 30th next year

  // If we're past June, use next year's school year
  const actualStart = currentDate > schoolYearEnd 
    ? new Date(currentYear + 1, 8, 1)
    : schoolYearStart;
  const actualEnd = currentDate > schoolYearEnd
    ? new Date(currentYear + 2, 6, 30)
    : schoolYearEnd;

  const schoolYearName = `${actualStart.getFullYear()}/${actualEnd.getFullYear()}`;
  
  // Set all other school years to not current first
  await prisma.schoolYear.updateMany({
    where: {
      isCurrent: true,
    },
    data: {
      isCurrent: false,
    },
  });

  // Find or create the school year
  let schoolYear = await prisma.schoolYear.findFirst({
    where: { name: schoolYearName },
  });

  if (!schoolYear) {
    schoolYear = await prisma.schoolYear.create({
      data: {
        name: schoolYearName,
        startDate: actualStart,
        endDate: actualEnd,
        isCurrent: true,
        isActive: true,
      },
    });
  } else {
    schoolYear = await prisma.schoolYear.update({
      where: { id: schoolYear.id },
      data: {
        startDate: actualStart,
        endDate: actualEnd,
        isCurrent: true,
        isActive: true,
      },
    });
  }
  console.log('✅ School year created:', schoolYear.name);

  // 3. Create School
  console.log('🏫 Creating school...');
  const school = await prisma.school.upsert({
    where: { schoolCode: 'TEST-SCHOOL-001' },
    update: {
      name: 'Test Schule',
      schoolType: 'AHS',
      street: 'Teststraße 1',
      postalCode: '1010',
      city: 'Wien',
      state: 'Wien',
      status: 'active',
      freeLicensesEnabled: true,
    },
    create: {
      name: 'Test Schule',
      schoolType: 'AHS',
      schoolCode: 'TEST-SCHOOL-001',
      street: 'Teststraße 1',
      postalCode: '1010',
      city: 'Wien',
      state: 'Wien',
      status: 'active',
      freeLicensesEnabled: true,
      approvedAt: new Date(),
      approvedById: admin.id,
    },
  });
  console.log('✅ School created:', school.name);

  // 4. Create Teacher
  console.log('👨‍🏫 Creating teacher...');
  const teacherPasswordHash = await bcrypt.hash('teacher', 10);
  
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@test.schule' },
    update: {
      passwordHash: teacherPasswordHash,
      role: 'teacher',
      firstName: 'Max',
      lastName: 'Mustermann',
      username: 'teacher',
      schoolId: school.id,
      isActive: true,
    },
    create: {
      email: 'teacher@test.schule',
      username: 'teacher',
      passwordHash: teacherPasswordHash,
      role: 'teacher',
      firstName: 'Max',
      lastName: 'Mustermann',
      schoolId: school.id,
      isActive: true,
    },
  });
  console.log('✅ Teacher created:', teacher.email);

  // 5. Create Course Packages
  console.log('📦 Creating course packages...');
  
  let coursePackage1 = await prisma.coursePackage.findFirst({
    where: { title: 'Digital Grundbildung & Coding Sek. I' },
  });
  
  if (!coursePackage1) {
    coursePackage1 = await prisma.coursePackage.create({
      data: {
        title: 'Digital Grundbildung & Coding Sek. I',
        description: 'Umfassendes Kurspaket für digitale Grundbildung und Programmierung in der Sekundarstufe I',
        licenseCount: 50,
        freeLicenseCount: 10,
        pricePerStudent: 29.99,
        currency: 'EUR',
        isActive: true,
        isAvailable: true,
      },
    });
  } else {
    coursePackage1 = await prisma.coursePackage.update({
      where: { id: coursePackage1.id },
      data: {
        description: 'Umfassendes Kurspaket für digitale Grundbildung und Programmierung in der Sekundarstufe I',
        licenseCount: 50,
        freeLicenseCount: 10,
        pricePerStudent: 29.99,
        currency: 'EUR',
        isActive: true,
        isAvailable: true,
      },
    });
  }
  console.log('✅ Course package created:', coursePackage1.title);

  let coursePackage2 = await prisma.coursePackage.findFirst({
    where: { title: 'Robotics & AI Grundlagen' },
  });
  
  if (!coursePackage2) {
    coursePackage2 = await prisma.coursePackage.create({
      data: {
        title: 'Robotics & AI Grundlagen',
        description: 'Einführung in Robotik und künstliche Intelligenz für Schülerinnen und Schüler',
        licenseCount: 30,
        freeLicenseCount: 5,
        pricePerStudent: 39.99,
        currency: 'EUR',
        isActive: true,
        isAvailable: true,
      },
    });
  } else {
    coursePackage2 = await prisma.coursePackage.update({
      where: { id: coursePackage2.id },
      data: {
        description: 'Einführung in Robotik und künstliche Intelligenz für Schülerinnen und Schüler',
        licenseCount: 30,
        freeLicenseCount: 5,
        pricePerStudent: 39.99,
        currency: 'EUR',
        isActive: true,
        isAvailable: true,
      },
    });
  }
  console.log('✅ Course package created:', coursePackage2.title);

  // 6. Create available licenses for the school (for testing)
  // This represents licenses available to the school for the current school year
  // We'll create a dummy class assignment to represent available licenses
  // In a real system, this would be managed through a license purchase/assignment system
  console.log('📋 Creating available licenses for school...');
  
  // Create a placeholder class to hold available licenses (or we could track this differently)
  // For now, we'll just note that the school has freeLicensesEnabled which allows license-based creation
  // The actual license checking will be done in the application logic

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('   Admin:');
  console.log('     Email: admin@test.com');
  console.log('     Password: adminadmin');
  console.log('   Teacher:');
  console.log('     Email: teacher@test.schule');
  console.log('     Password: teacher');
  console.log('   School Year:', schoolYear.name);
  console.log('   School:', school.name);
  console.log('   Course Packages:', coursePackage1.title, ',', coursePackage2.title);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
