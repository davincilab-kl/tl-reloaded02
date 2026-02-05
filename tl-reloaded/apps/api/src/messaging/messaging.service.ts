import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MessagingService {
    constructor(private prisma: PrismaService) { }

    async getUserConversations(userId: string) {
        return this.prisma.client.conversation.findMany({
            where: {
                OR: [{ participant1Id: userId }, { participant2Id: userId }],
            },
            include: {
                participant1: { select: { firstName: true, lastName: true } },
                participant2: { select: { firstName: true, lastName: true } },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async getConversationMessages(conversationId: string, userId: string) {
        // Check if user is part of conversation
        const conversation = await this.prisma.client.conversation.findUnique({
            where: { id: conversationId },
        });

        if (!conversation) throw new Error('Conversation not found');
        if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
            throw new ForbiddenException('Not part of this conversation');
        }

        return this.prisma.client.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
        });
    }

    async sendMessage(senderId: string, data: any) {
        return this.prisma.client.message.create({
            data: {
                senderId,
                conversationId: data.conversationId,
                content: data.content,
                messageType: 'text',
            },
        });
    }
}
