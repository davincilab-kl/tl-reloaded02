import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { NotificationType } from '@repo/db/types';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async getNotifications(userId: string) {
        return this.prisma.client.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    async markAsRead(userId: string, notificationId: string) {
        return this.prisma.client.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true },
        });
    }

    async createNotification(data: {
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        relatedId?: string;
        relatedType?: string;
    }) {
        return this.prisma.client.notification.create({
            data: {
                userId: data.userId,
                notificationType: data.type,
                title: data.title,
                message: data.message,
                relatedId: data.relatedId,
                relatedType: data.relatedType as any, // Cast to avoid build issues with string-to-enum
                isRead: false,
            },
        });
    }
}
