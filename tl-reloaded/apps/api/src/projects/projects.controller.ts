import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@repo/db/types';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    create(@Request() req, @Body() createProjectDto: any) {
        return this.projectsService.create(req.user.id, createProjectDto);
    }

    @Get()
    findAll(@Request() req) {
        // Admins see all, others see public/class projects
        return this.projectsService.findAll(req.user);
    }

    @Get('my-projects')
    findMyProjects(@Request() req) {
        return this.projectsService.findByAuthor(req.user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.projectsService.findOne(id, req.user);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Request() req, @Body() updateProjectDto: any) {
        return this.projectsService.update(id, req.user.id, updateProjectDto);
    }

    @Post(':id/submit')
    submit(@Param('id') id: string, @Request() req) {
        return this.projectsService.submit(id, req.user.id);
    }

    @Post(':id/review')
    @Roles(UserRole.teacher, UserRole.admin)
    review(@Param('id') id: string, @Request() req, @Body() reviewDto: any) {
        return this.projectsService.review(id, req.user.id, reviewDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.projectsService.remove(id, req.user);
    }
}
