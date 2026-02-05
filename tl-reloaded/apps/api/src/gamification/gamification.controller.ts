import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
    constructor(private readonly gamificationService: GamificationService) { }

    @Get('stats')
    getStats(@Request() req) {
        return this.gamificationService.getUserStats(req.user.id);
    }

    @Get('transactions')
    getTransactions(@Request() req) {
        return this.gamificationService.getTransactions(req.user.id);
    }

    @Post('tscore/calculate')
    calculateTScore(@Body('classId') classId: string) {
        return this.gamificationService.calculateClassTScore(classId);
    }
}
