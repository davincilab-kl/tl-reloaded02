import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@repo/db/types';

@Controller('schools')
@UseGuards(JwtAuthGuard)
export class SchoolsController {
    constructor(private readonly schoolsService: SchoolsService) { }

    @Post()
    @Roles(UserRole.admin)
    create(@Body() createSchoolDto: any) {
        return this.schoolsService.create(createSchoolDto);
    }

    @Get()
    @Roles(UserRole.admin, UserRole.teacher) // Teachers might need to see schools to select their own
    findAll() {
        return this.schoolsService.findAll();
    }

    @Get(':id')
    @Roles(UserRole.admin, UserRole.teacher)
    findOne(@Param('id') id: string) {
        return this.schoolsService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.admin)
    update(@Param('id') id: string, @Body() updateSchoolDto: any) {
        return this.schoolsService.update(id, updateSchoolDto);
    }

    @Post(':id/approve')
    @Roles(UserRole.admin)
    approve(@Param('id') id: string, @Body('adminId') adminId: string) {
        return this.schoolsService.approve(id, adminId);
    }

    @Delete(':id')
    @Roles(UserRole.admin)
    remove(@Param('id') id: string) {
        return this.schoolsService.remove(id);
    }
}
