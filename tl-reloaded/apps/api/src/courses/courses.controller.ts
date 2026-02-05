import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@repo/db/types';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    @Post()
    @Roles(UserRole.admin)
    create(@Body() createCourseDto: any) {
        return this.coursesService.create(createCourseDto);
    }

    @Get()
    findAll() {
        return this.coursesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.coursesService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.admin)
    update(@Param('id') id: string, @Body() updateCourseDto: any) {
        return this.coursesService.update(id, updateCourseDto);
    }

    @Delete(':id')
    @Roles(UserRole.admin)
    remove(@Param('id') id: string) {
        return this.coursesService.remove(id);
    }
}
