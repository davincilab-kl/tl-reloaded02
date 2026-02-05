import { Module } from '@nestjs/common';
import { WebinarsService } from './webinars.service';
import { WebinarsController } from './webinars.controller';
import { PrismaService } from '../prisma.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule],
    controllers: [WebinarsController],
    providers: [WebinarsService, PrismaService],
})
export class WebinarsModule { }
