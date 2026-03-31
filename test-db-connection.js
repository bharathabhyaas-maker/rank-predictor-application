const { PrismaClient } = require('./generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');

async function testDatabase() {
  console.log('Testing database connection...');
  
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  const prisma = new PrismaClient({
    adapter,
    log: ['query', 'error', 'warn'],
  });

  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Test table existence
    const institutions = await prisma.institution.count();
    console.log(`✅ Institutions table exists, count: ${institutions}`);

    const users = await prisma.user.count();
    console.log(`✅ Users table exists, count: ${users}`);

    const templates = await prisma.template.count();
    console.log(`✅ Templates table exists, count: ${templates}`);

    console.log('🎉 All database tables are accessible!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
