import { Module } from '@nestjs/common';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { DemoClassService } from './demo-class.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ClassController],
  providers: [ClassService, DemoClassService, PrismaService],
  exports: [ClassService, DemoClassService],
})
export class ClassModule { }
