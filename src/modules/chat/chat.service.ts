// src/modules/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prismaService: PrismaService) {}

  async createMessage(senderId: string, receiverId: string, content: string) {
    console.log('send mesage body', senderId, receiverId, content);
    return this.prismaService.client.chat.create({
      data: {
        senderId,
        receiverId,
        content,
      },
    });
  }

  async getConversation(userA: string, userB: string) {
    return this.prismaService.client.chat.findMany({
      where: {
        OR: [
          { senderId: userA, receiverId: userB },
          { senderId: userB, receiverId: userA },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async markAsRead(messageId: number) {
    return this.prismaService.client.chat.update({
      where: { id: messageId },
      data: { isRead: true },
    });
  }
}
