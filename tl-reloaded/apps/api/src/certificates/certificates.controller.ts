import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, AwardType } from '@repo/db/types';

@Controller('certificates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CertificatesController {
    constructor(private readonly certificatesService: CertificatesService) { }

    @Get('my')
    async getMyCertificates(@Request() req) {
        return this.certificatesService.getUserCertificates(req.user.id);
    }

    @Get(':id')
    async getCertificate(@Param('id') id: string) {
        return this.certificatesService.getCertificateDetails(id);
    }

    @Roles(UserRole.admin)
    @Post('templates')
    async createTemplate(@Body() data: any) {
        return this.certificatesService.createCertificateTemplate(data);
    }

    @Roles(UserRole.teacher)
    @Post('award')
    async awardCertificate(@Request() req, @Body() data: { userId: string; certificateId: string }) {
        return this.certificatesService.awardCertificate({
            ...data,
            awardedById: req.user.id,
            awardType: AwardType.manual,
        });
    }
}
