import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding portal database...');

  const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
  const userPasswordHash = await bcrypt.hash('UserPass123!', 10);

  // 1. Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@archivist.network' },
    update: {},
    create: {
      email: 'admin@archivist.network',
      name: 'System Administrator',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      quotaBytes: BigInt(107374182400), // 100 GB
    },
  });

  // 2. Create Standard Demo Customer User
  const demoUser = await prisma.user.upsert({
    where: { email: 'user@archivist.network' },
    update: {},
    create: {
      email: 'user@archivist.network',
      name: 'Alex Durability',
      passwordHash: userPasswordHash,
      role: 'USER',
      quotaBytes: BigInt(10737418240), // 10 GB
    },
  });

  console.log(`Created users: Admin (${admin.email}), User (${demoUser.email})`);

  // 3. Create Sample File Records for Demo User
  const sampleFiles = [
    {
      userId: demoUser.id,
      name: 'archivist-network-architecture.pdf',
      originalName: 'archivist-network-architecture.pdf',
      mimeType: 'application/pdf',
      size: BigInt(4194304), // 4 MB
      cid: 'zdj7W9kPx2vL5M8N1Q3R6S9T2U5V8W1X4Y7Z0A3B6C9D2E5F8G1H',
      category: 'DOCUMENT',
      visibility: 'PUBLIC',
      uploadStatus: 'COMPLETED',
    },
    {
      userId: demoUser.id,
      name: 'decentralized-backup-demo.mp4',
      originalName: 'decentralized-backup-demo.mp4',
      mimeType: 'video/mp4',
      size: BigInt(157286400), // 150 MB
      cid: 'zdj7W1A4B7C0D3E6F9G2H5I8J1K4L7M0N3O6P9Q2R5S8T1U4V7W',
      category: 'VIDEO',
      visibility: 'PRIVATE',
      uploadStatus: 'COMPLETED',
    },
    {
      userId: demoUser.id,
      name: 'storage-node-metrics.png',
      originalName: 'storage-node-metrics.png',
      mimeType: 'image/png',
      size: BigInt(2097152), // 2 MB
      cid: 'zdj7W8X1Y4Z7A0B3C6D9E2F5G8H1I4J7K0L3M6N9O2P5Q8R1S4T',
      category: 'IMAGE',
      visibility: 'PUBLIC',
      uploadStatus: 'COMPLETED',
    },
  ];

  for (const f of sampleFiles) {
    const existing = await prisma.fileRecord.findFirst({
      where: { userId: demoUser.id, cid: f.cid },
    });
    if (!existing) {
      await prisma.fileRecord.create({ data: f });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
