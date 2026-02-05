import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messaging')
@UseGuards(JwtAuthGuard)
export class MessagingController {
    constructor(private readonly messagingService: MessagingService) { }

    @Get('conversations')
    getConversations(@Request() req) {
        return this.messagingService.getUserConversations(req.user.id);
    }

    @Get('conversations/:id/messages')
    getMessages(@Param('id') id: string, @Request() req) {
        return this.messagingService.getConversationMessages(id, req.user.id);
    }

    @Post('messages')
    sendMessage(@Request() req, @Body() sendMessageDto: any) {
        return this.messagingService.sendMessage(req.user.id, sendMessageDto);
    }
}
