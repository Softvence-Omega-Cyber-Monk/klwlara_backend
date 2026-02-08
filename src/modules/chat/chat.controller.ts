// src/modules/chat/chat.controller.ts
import { Controller, Get, Param, Req } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Get chat history between logged-in user and another user
  @Get(':userId')
  getConversation(@Req() req, @Param('userId') userId: string) {
    return this.chatService.getConversation(req.user.id, userId);
  }
}
