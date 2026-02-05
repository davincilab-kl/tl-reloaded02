import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  // Re-export prisma client for convenience
  readonly client = prisma;

  async onModuleInit() {
    // Optional: Test database connection on startup
    await this.client.$connect();
  }

  async onModuleDestroy() {
    // Disconnect Prisma Client when the module is destroyed
    await this.client.$disconnect();
  }
}
