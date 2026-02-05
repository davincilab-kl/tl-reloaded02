import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [MessagingController],
    providers: [MessagingService, PrismaService],
    exports: [MessagingService],
})
export class MessagingModule { }
