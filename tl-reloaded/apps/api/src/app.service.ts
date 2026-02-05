import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  // Example: Get all users
  async getUsers() {
    return this.prisma.client.user.findMany();
  }

  // Example: Create a user (matching your schema)
  async createUser(data: { 
    firstName: string; 
    lastName: string; 
    email?: string;
    role?: 'student' | 'teacher' | 'admin';
  }) {
    return this.prisma.client.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role || 'student',
      },
    });
  }
}
