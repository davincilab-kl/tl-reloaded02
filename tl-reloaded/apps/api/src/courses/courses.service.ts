import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CoursesService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        return this.prisma.client.course.create({
            data,
        });
    }

    async findAll() {
        return this.prisma.client.course.findMany({
            where: { isPublished: true },
            include: {
                modules: {
                    include: {
                        lessons: true,
                    },
                },
            },
            orderBy: { orderIndex: 'asc' },
        });
    }

    async findOne(id: string) {
        const course = await this.prisma.client.course.findUnique({
            where: { id },
            include: {
                modules: {
                    include: {
                        lessons: {
                            include: {
                                lesson: true,
                            },
                        },
                    },
                },
            },
        });

        if (!course) {
            throw new NotFoundException(`Course with ID ${id} not found`);
        }

        return course;
    }

    async update(id: string, data: any) {
        return this.prisma.client.course.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.client.course.delete({
            where: { id },
        });
    }
}
