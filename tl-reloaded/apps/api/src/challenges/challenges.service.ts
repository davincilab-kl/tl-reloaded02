import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ChallengeStatus } from '@repo/db/types';

@Injectable()
export class ChallengesService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        return this.prisma.client.challenge.create({
            data,
        });
    }

    async findAll() {
        return this.prisma.client.challenge.findMany({
            where: { status: { not: ChallengeStatus.ended } },
            orderBy: { endDate: 'asc' },
        });
    }

    async findOne(id: string) {
        const challenge = await this.prisma.client.challenge.findUnique({
            where: { id },
            include: {
                submissions: {
                    include: {
                        project: {
                            include: { author: true },
                        },
                    },
                },
            },
        });

        if (!challenge) {
            throw new NotFoundException(`Challenge with ID ${id} not found`);
        }

        return challenge;
    }

    async update(id: string, data: any) {
        return this.prisma.client.challenge.update({
            where: { id },
            data,
        });
    }

    async submitProject(challengeId: string, userId: string, projectId: string) {
        return this.prisma.client.challengeSubmission.create({
            data: {
                challengeId,
                projectId,
                userId,
                status: 'submitted',
            },
        });
    }

    async remove(id: string) {
        return this.prisma.client.challenge.delete({
            where: { id },
        });
    }
}
