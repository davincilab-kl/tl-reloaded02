import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@repo/db/types';

@Controller('teacher')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.teacher)
export class TeacherController {
  constructor(private teacherService: TeacherService) { }

  @Get('dashboard')
  async getDashboard(@Request() req) {
    console.log('Fetching dashboard for user:', req.user.id);
    return this.teacherService.getDashboardOverview(req.user.id);
  }
}
