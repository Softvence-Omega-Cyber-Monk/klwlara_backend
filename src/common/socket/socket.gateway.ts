// src/common/socket/socket.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/modules/user/service/user.service';
import { ChatService } from 'src/modules/chat/chat.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(SocketGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly chatService: ChatService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Socket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    console.log('➡️ New socket connection attempt');
    console.log('Handshake:', client.handshake);

    try {
      const token = this.getTokenFromSocket(client);
      console.log('Extracted token:', token);

      if (!token) {
        this.logger.warn(`No token provided for client: ${client.id}`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      console.log('JWT payload:', payload);

      const user = await this.userService.findOne(payload.userId);
      console.log('Fetched user from DB:', user);

      if (!user) {
        this.logger.warn(`User not found for client: ${client.id}`);
        client.disconnect();
        return;
      }

      client.data.user = { id: user.id, email: user.email };
      client.join(`user:${user.id}`);

      console.log(`🟢 Socket connected: ${user.email} (${client.id})`);
      console.log('client.data after attach:', client.data);
    } catch (err) {
      this.logger.warn(`Socket connection failed: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    console.log(`🔴 Socket disconnected: ${user?.email || client.id}`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { receiverId: string; content: string },
  ) {
    console.log('📨 send_message event received');
    console.log('client.data:', client.data);
    console.log('message body:', body);

    try {
      const sender = client.data.user;
      console.log('Sender from client.data', sender);

      if (!sender) {
        console.warn('Unauthorized: sender is missing in client.data');
        return { error: 'Unauthorized' };
      }

      if (!body?.receiverId || !body?.content?.trim()) {
        console.warn('Invalid message body', body);
        return { error: 'Invalid message body' };
      }

      const message = await this.chatService.createMessage(
        sender.id,
        body.receiverId,
        body.content.trim(),
      );

      console.log('Message saved in DB:', message);

      this.server
        .to(`user:${body.receiverId}`)
        .emit('receive_message', message);
      client.emit('receive_message', message);

      return { success: true, message };
    } catch (err) {
      this.logger.error('Send message error:', err);
      return { error: 'Failed to send message' };
    }
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { messageId: number },
  ) {
    console.log('📌 mark_as_read event received');
    console.log('client.data:', client.data);
    console.log('body:', body);

    try {
      const user = client.data.user;
      if (!user) return { error: 'Unauthorized' };

      if (!body?.messageId) return { error: 'Invalid message ID' };

      const updated = await this.chatService.markAsRead(body.messageId);
      console.log('Message marked as read:', updated);

      return { success: true, updated };
    } catch (err) {
      this.logger.error('Mark as read error:', err);
      return { error: 'Failed to mark message as read' };
    }
  }

  private getTokenFromSocket(client: Socket): string | undefined {
    const authHeader = client.handshake.headers.authorization;
    const authToken = client.handshake.auth?.token;

    console.log('Checking token from headers:', authHeader);
    console.log('Checking token from handshake auth:', authToken);

    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return authToken;
  }
}
