import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma.service';
import { StorageModule } from '../storage/storage.module';

@Module({
    imports: [StorageModule],
    controllers: [UsersController],
    providers: [UsersService, PrismaService],
    exports: [UsersService],
})
export class UsersModule { }
