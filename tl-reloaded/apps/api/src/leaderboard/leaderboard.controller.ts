import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('leaderboard')
@UseGuards(JwtAuthGuard)
export class LeaderboardController {
    constructor(private readonly leaderboardService: LeaderboardService) { }

    @Public()
    @Get('global')
    getGlobalLeaderboard() {
        return this.leaderboardService.getTopStudents(50);
    }

    @Get('class/:classId')
    getClassLeaderboard(@Param('classId') classId: string) {
        return this.leaderboardService.getClassLeaderboard(classId);
    }

    @Get('school/:schoolId')
    getSchoolLeaderboard(@Param('schoolId') schoolId: string) {
        return this.leaderboardService.getSchoolLeaderboard(schoolId);
    }
}
