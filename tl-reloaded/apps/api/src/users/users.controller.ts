import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../storage/storage.service';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@repo/db/types';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly storageService: StorageService
    ) { }

    @Get('profile')
    getProfile(@Request() req) {
        return this.usersService.findOne(req.user.id);
    }

    @Patch('profile')
    updateProfile(@Request() req, @Body() updateProfileDto: any) {
        return this.usersService.update(req.user.id, updateProfileDto);
    }

    @Post('avatar')
    @UseInterceptors(FileInterceptor('file'))
    async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
        const url = await this.storageService.uploadFile(file, 'avatars');
        return this.usersService.update(req.user.id, { avatarId: url });
    }

    @Get('teachers')
    @Roles(UserRole.admin)
    findAllTeachers() {
        return this.usersService.findAllByRole(UserRole.teacher);
    }

    @Get('students')
    @Roles(UserRole.admin, UserRole.teacher)
    findAllStudents(@Request() req) {
        // If teacher, only return students in their classes
        if (req.user.role === UserRole.teacher) {
            return this.usersService.findStudentsByTeacher(req.user.id);
        }
        return this.usersService.findAllByRole(UserRole.student);
    }

    @Post(':id/impersonate')
    @Roles(UserRole.admin)
    impersonate(@Param('id') id: string) {
        // This logic would be handled by the frontend by swapping tokens, 
        // but the API can provide the necessary user data.
        return this.usersService.findOne(id);
    }
}
