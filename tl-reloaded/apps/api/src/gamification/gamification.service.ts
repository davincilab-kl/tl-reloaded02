import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TransactionType } from '@repo/db/types';

@Injectable()
export class GamificationService {
    constructor(private prisma: PrismaService) { }

    async getUserStats(userId: string) {
        const user = await this.prisma.client.user.findUnique({
            where: { id: userId },
            select: {
                tCoinsAvailable: true,
                tCoinsTotal: true,
                tScore: true,
            },
        });
        return user;
    }

    async getTransactions(userId: string) {
        return this.prisma.client.tCoinsTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async calculateClassTScore(classId: string) {
        const students = await this.prisma.client.user.findMany({
            where: { classId, role: 'student', isActive: true },
            select: { tCoinsTotal: true },
        });

        const totalCoins = students.reduce((sum, s) => sum + s.tCoinsTotal, 0);
        const avgScore = students.length > 0 ? totalCoins / students.length : 0;

        // We don't store Class T!Score directly in Class table typically, 
        // but we can if the schema allows or return it dynamically.
        return {
            classId,
            tScore: Number(avgScore.toFixed(2)),
            studentCount: students.length,
        };
    }
}
