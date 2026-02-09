// src/modules/chat/chat.controller.ts
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/common/jwt/jwt.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Get chat history between logged-in user and another user
  // @UseGuards(JwtAuthGuard)
  @Get(':userId')
  getConversation(@Req() req, @Param('userId') userId: string) {
    console.log('in controller ', req.user.userId, userId);
    return this.chatService.getConversation(req.user.userId, userId);
  }
}
