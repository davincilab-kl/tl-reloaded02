import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CertificateType, AwardType } from '@repo/db/types';

@Injectable()
export class CertificatesService {
    constructor(private prisma: PrismaService) { }

    async getUserCertificates(userId: string) {
        return this.prisma.client.userCertificate.findMany({
            where: { userId },
            include: {
                certificate: true,
                awardedBy: {
                    select: { firstName: true, lastName: true },
                },
            },
            orderBy: { awardedAt: 'desc' },
        });
    }

    async getCertificateDetails(id: string) {
        return this.prisma.client.userCertificate.findUnique({
            where: { id },
            include: {
                certificate: true,
                user: {
                    select: { firstName: true, lastName: true },
                },
            },
        });
    }

    async awardCertificate(data: {
        userId: string;
        certificateId: string;
        awardedById?: string;
        awardType: AwardType; // Note: awardType is on Certificate model, but we might want to log it or similar
    }) {
        return this.prisma.client.userCertificate.create({
            data: {
                userId: data.userId,
                certificateId: data.certificateId,
                awardedById: data.awardedById,
                awardedAt: new Date(),
            },
        });
    }

    async createCertificateTemplate(data: {
        title: string;
        description?: string;
        type: CertificateType;
        courseId?: string;
        challengeId?: string;
        templateUrl?: string; // This maps to templateId or similar in your app
        awardType: AwardType;
    }) {
        return this.prisma.client.certificate.create({
            data: {
                title: data.title,
                description: data.description,
                certificateType: data.type,
                courseId: data.courseId,
                challengeId: data.challengeId,
                templateId: data.templateUrl,
                awardType: data.awardType,
            },
        });
    }
}
