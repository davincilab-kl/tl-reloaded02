import { Body, Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ClassService } from './class.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@repo/db/types';

@Controller('class')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.teacher)
export class ClassController {
  constructor(private classService: ClassService) { }

  @Post()
  async createClass(@Request() req, @Body() body: any) {
    return this.classService.createClass(req.user.id, body);
  }

  @Get('course-packages/available')
  async getAvailableCoursePackages(@Request() req) {
    return this.classService.getAvailableCoursePackages(req.user.id);
  }

  @Get()
  async getClasses(@Request() req) {
    return this.classService.getClasses(req.user.id);
  }

  @Get(':id')
  async getClassById(@Request() req, @Param('id') id: string) {
    return this.classService.getClassById(id, req.user.id);
  }
}
