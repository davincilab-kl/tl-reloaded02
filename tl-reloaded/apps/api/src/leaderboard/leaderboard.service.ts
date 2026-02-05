import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LeaderboardService {
    constructor(private prisma: PrismaService) { }

    async getTopStudents(limit: number = 50) {
        return this.prisma.client.user.findMany({
            where: { role: 'student', isActive: true },
            orderBy: { tScore: 'desc' },
            take: limit,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                tScore: true,
                avatarId: true,
            },
        });
    }

    async getClassLeaderboard(classId: string) {
        return this.prisma.client.user.findMany({
            where: { classId, role: 'student', isActive: true },
            orderBy: { tScore: 'desc' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                tScore: true,
                avatarId: true,
            },
        });
    }

    async getSchoolLeaderboard(schoolId: string) {
        // This could also be a ranking of classes within the school
        const classes = await this.prisma.client.class.findMany({
            where: { schoolId },
            include: {
                students: {
                    where: { isActive: true },
                    select: { tScore: true },
                },
            },
        });

        return classes
            .map((c) => {
                const totalScore = c.students.reduce((sum, s) => sum + Number(s.tScore || 0), 0);
                const avgScore = c.students.length > 0 ? totalScore / c.students.length : 0;
                return {
                    id: c.id,
                    name: c.name,
                    avgScore: Number(avgScore.toFixed(2)),
                };
            })
            .sort((a, b) => b.avgScore - a.avgScore);
    }
}
