import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserRole, ProjectStatus, ProjectVisibility } from '@repo/db/types';

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) { }

    async create(authorId: string, data: any) {
        return this.prisma.client.project.create({
            data: {
                ...data,
                authorId,
                status: ProjectStatus.draft,
                visibility: ProjectVisibility.private,
                version: 1,
            },
        });
    }

    async findAll(user: any) {
        if (user.role === UserRole.admin) {
            return this.prisma.client.project.findMany({
                include: { author: true, class: true },
            });
        }

        // Teachers see projects from their school/classes
        if (user.role === UserRole.teacher) {
            return this.prisma.client.project.findMany({
                where: {
                    OR: [
                        { visibility: ProjectVisibility.public },
                        {
                            class: {
                                OR: [
                                    { primaryTeacherId: user.id },
                                    { teachers: { some: { teacherId: user.id } } },
                                ],
                            },
                        },
                    ],
                },
                include: { author: true, class: true },
            });
        }

        // Students see public projects and projects in their class
        return this.prisma.client.project.findMany({
            where: {
                OR: [
                    { visibility: ProjectVisibility.public },
                    { classId: user.classId, visibility: ProjectVisibility.class },
                ],
            },
            include: { author: true },
        });
    }

    async findByAuthor(authorId: string) {
        return this.prisma.client.project.findMany({
            where: { authorId },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async findOne(id: string, user: any) {
        const project = await this.prisma.client.project.findUnique({
            where: { id },
            include: { author: true, class: true },
        });

        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }

        // Check visibility
        if (
            project.visibility === ProjectVisibility.private &&
            project.authorId !== user.id &&
            user.role !== UserRole.admin
        ) {
            throw new ForbiddenException('You do not have permission to view this project');
        }

        return project;
    }

    async update(id: string, userId: string, data: any) {
        const project = await this.prisma.client.project.findUnique({
            where: { id },
        });

        if (!project) throw new NotFoundException('Project not found');
        if (project.authorId !== userId) throw new ForbiddenException('Not your project');

        return this.prisma.client.project.update({
            where: { id },
            data,
        });
    }

    async submit(id: string, userId: string) {
        const project = await this.prisma.client.project.findUnique({
            where: { id },
        });

        if (!project) throw new NotFoundException('Project not found');
        if (project.authorId !== userId) throw new ForbiddenException('Not your project');

        return this.prisma.client.project.update({
            where: { id },
            data: {
                status: ProjectStatus.submitted_for_review,
            },
        });
    }

    async review(id: string, reviewerId: string, reviewDto: any) {
        const project = await this.prisma.client.project.findUnique({
            where: { id },
        });

        if (!project) throw new NotFoundException('Project not found');

        return this.prisma.client.project.update({
            where: { id },
            data: {
                status: reviewDto.approve ? ProjectStatus.published : ProjectStatus.rejected,
                reviewedById: reviewerId,
                reviewedAt: new Date(),
                reviewNotes: reviewDto.notes,
                visibility: reviewDto.approve ? ProjectVisibility.public : project.visibility,
            },
        });
    }

    async remove(id: string, user: any) {
        const project = await this.prisma.client.project.findUnique({
            where: { id },
        });

        if (!project) throw new NotFoundException('Project not found');
        if (project.authorId !== user.id && user.role !== UserRole.admin) {
            throw new ForbiddenException('Not allowed to delete this project');
        }

        return this.prisma.client.project.delete({
            where: { id },
        });
    }
}
