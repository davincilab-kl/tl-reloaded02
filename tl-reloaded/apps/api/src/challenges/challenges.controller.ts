import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@repo/db/types';
import { Public } from '../auth/decorators/public.decorator';

@Controller('challenges')
@UseGuards(JwtAuthGuard)
export class ChallengesController {
    constructor(private readonly challengesService: ChallengesService) { }

    @Post()
    @Roles(UserRole.admin)
    create(@Body() createChallengeDto: any) {
        return this.challengesService.create(createChallengeDto);
    }

    @Public()
    @Get()
    findAll() {
        return this.challengesService.findAll();
    }

    @Public()
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.challengesService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.admin)
    update(@Param('id') id: string, @Body() updateChallengeDto: any) {
        return this.challengesService.update(id, updateChallengeDto);
    }

    @Post(':id/submit')
    @Roles(UserRole.student)
    submitProject(@Param('id') id: string, @Request() req, @Body('projectId') projectId: string) {
        return this.challengesService.submitProject(id, req.user.id, projectId);
    }

    @Delete(':id')
    @Roles(UserRole.admin)
    remove(@Param('id') id: string) {
        return this.challengesService.remove(id);
    }
}
