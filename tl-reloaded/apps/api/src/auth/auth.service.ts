import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { UserRole } from '@repo/db/types';
import type { PreferredTitle } from '@repo/db/types';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { WordPressHashUtil } from './utils/wordpress-hash.util';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.client.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Try Better Auth hash first
    if (user.passwordHash) {
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (isPasswordValid) {
        // Update last login
        await this.prisma.client.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        const { passwordHash, passwordHashWp, studentPasswordHash, studentPasswordPlain, ...result } = user;
        return result;
      }
    }

    // Try WordPress hash if Better Auth hash failed and WordPress hash exists
    if (user.passwordHashWp && !user.passwordMigrated) {
      const isWordPressPasswordValid = await WordPressHashUtil.validateWordPressPassword(
        password,
        user.passwordHashWp,
      );

      if (isWordPressPasswordValid) {
        // Migrate password to Better Auth
        await this.migratePasswordOnLogin(user.id, password);

        // Update last login
        await this.prisma.client.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        const { passwordHash, passwordHashWp, studentPasswordHash, studentPasswordPlain, ...result } = user;
        return result;
      }
    }

    return null;
  }

  /**
   * Migrates WordPress password to Better Auth hash on successful login
   */
  private async migratePasswordOnLogin(userId: string, password: string): Promise<void> {
    const passwordHash = await bcrypt.hash(password, 10);

    await this.prisma.client.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        passwordMigrated: true,
        wpMigratedAt: new Date(),
      },
    });
  }

  async validateStudentByPassword(password: string): Promise<any> {
    // For students: find by student password (stored as plain for now, but should be searchable)
    // Actually, in the current schema, studentPasswordHash is searchable.
    // However, if it's a bcrypt hash, we can't search directly.
    // To make it efficient, we iterate only over active students.
    // TODO: Implement a faster lookup (e.g., indexed searchable token)
    const students = await this.prisma.client.user.findMany({
      where: {
        role: UserRole.student,
        studentPasswordHash: { not: null },
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        studentPasswordHash: true,
        classId: true,
        schoolId: true,
      }
    });

    for (const student of students) {
      if (student.studentPasswordHash && (await bcrypt.compare(password, student.studentPasswordHash))) {
        // Update last login
        await this.prisma.client.user.update({
          where: { id: student.id },
          data: { lastLoginAt: new Date() },
        });

        return student;
      }
    }
    return null;
  }

  async validateUserById(userId: string): Promise<any> {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      return null;
    }

    const { passwordHash, passwordHashWp, studentPasswordHash, studentPasswordPlain, ...result } = user;
    return result;
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: UserRole = UserRole.teacher,
    preferredTitle?: string,
    phone?: string,
  ) {
    // Check if user already exists
    if (email) {
      const existingUser = await this.prisma.client.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        throw new UnauthorizedException('User already exists');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.client.user.create({
      data: {
        email,
        firstName,
        lastName,
        passwordHash,
        role,
        username: email, // Use email as username for now
        passwordMigrated: false,
        ...(preferredTitle && { preferredTitle: preferredTitle as PreferredTitle }),
        ...(phone && { phone }),
      },
    });

    const { passwordHash: _, passwordHashWp, studentPasswordHash, studentPasswordPlain, ...result } = user;
    return result;
  }

  async registerStudent(firstName: string, lastName: string): Promise<{ user: any; password: string }> {
    // Generate secure student password (12 characters, alphanumeric + special chars)
    const password = this.generateStudentPassword();

    // Hash password
    const studentPasswordHash = await bcrypt.hash(password, 10);

    // Create student user
    const user = await this.prisma.client.user.create({
      data: {
        firstName,
        lastName,
        role: UserRole.student,
        studentPasswordHash,
        studentPasswordPlain: password, // Store plain password for teacher display (should be encrypted in production)
      },
    });

    const { passwordHash, passwordHashWp, studentPasswordHash: _, studentPasswordPlain, ...result } = user;
    return { user: result, password };
  }

  private generateStudentPassword(): string {
    const length = 12;
    // Exclude confusing characters: 0, O, 1, l, I
    const charset = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*';
    let password = '';

    // Use crypto.randomBytes for better security
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      password += charset[bytes[i] % charset.length];
    }

    return password;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        schoolId: user.schoolId,
        classId: user.classId,
      },
    };
  }
}
