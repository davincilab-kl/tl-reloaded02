import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { WebinarsService } from './webinars.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@repo/db/types';

@Controller('webinars')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WebinarsController {
    constructor(private readonly webinarsService: WebinarsService) { }

    @Roles(UserRole.admin)
    @Get()
    async getWebinars() {
        return this.webinarsService.getWebinars();
    }

    @Roles(UserRole.admin)
    @Post('sync')
    async syncWebinars() {
        return this.webinarsService.syncCalendlyEvents();
    }
}
