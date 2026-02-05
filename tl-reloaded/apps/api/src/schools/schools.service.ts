import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SchoolStatus } from '@repo/db/types';

@Injectable()
export class SchoolsService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        return this.prisma.client.school.create({
            data,
        });
    }

    async findAll() {
        return this.prisma.client.school.findMany({
            include: {
                _count: {
                    select: { teachers: true, classes: true },
                },
            },
        });
    }

    async findOne(id: string) {
        const school = await this.prisma.client.school.findUnique({
            where: { id },
            include: {
                teachers: true,
                classes: true,
            },
        });

        if (!school) {
            throw new NotFoundException(`School with ID ${id} not found`);
        }

        return school;
    }

    async update(id: string, data: any) {
        return this.prisma.client.school.update({
            where: { id },
            data,
        });
    }

    async approve(id: string, adminId: string) {
        return this.prisma.client.school.update({
            where: { id },
            data: {
                status: SchoolStatus.active,
                approvedAt: new Date(),
                approvedById: adminId,
            },
        });
    }

    async remove(id: string) {
        return this.prisma.client.school.delete({
            where: { id },
        });
    }
}
