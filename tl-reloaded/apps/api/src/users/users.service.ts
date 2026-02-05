import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserRole } from '@repo/db/types';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOne(id: string) {
        const user = await this.prisma.client.user.findUnique({
            where: { id },
            include: {
                school: true,
                class: true,
            },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        const { passwordHash, passwordHashWp, studentPasswordHash, studentPasswordPlain, ...result } = user;
        return result;
    }

    async update(id: string, data: any) {
        const user = await this.prisma.client.user.update({
            where: { id },
            data,
        });

        const { passwordHash, passwordHashWp, studentPasswordHash, studentPasswordPlain, ...result } = user;
        return result;
    }

    async findAllByRole(role: UserRole) {
        return this.prisma.client.user.findMany({
            where: { role, isActive: true },
            include: {
                school: true,
            },
        });
    }

    async findStudentsByTeacher(teacherId: string) {
        return this.prisma.client.user.findMany({
            where: {
                role: UserRole.student,
                class: {
                    OR: [
                        { primaryTeacherId: teacherId },
                        {
                            teachers: {
                                some: {
                                    teacherId,
                                },
                            },
                        },
                    ],
                },
            },
            include: {
                class: true,
            },
        });
    }
}
