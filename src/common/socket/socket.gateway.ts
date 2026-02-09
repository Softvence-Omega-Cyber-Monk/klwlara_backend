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

  afterInit() {
    this.logger.log('✅ Socket Gateway initialized');
  }

  // ---------------- CONNECTION ----------------
  async handleConnection(client: Socket) {
    this.logger.log(`➡️ Connection attempt: ${client.id}`);

    const user = await this.authenticateSocket(client);

    if (!user) {
      // ❗ This is a rejected connection, not a disconnect
      client.disconnect(true);
      return;
    }

    client.data.user = user;
    client.join(`user:${user.id}`);

    this.logger.log(`🟢 Connected: ${user.email} (${client.id})`);
  }

  // ---------------- DISCONNECT ----------------
  handleDisconnect(client: Socket) {
    const user = client.data?.user;

    if (user) {
      this.logger.log(`🔴 User disconnected: ${user.email}`);
    } else {
      this.logger.log(`🔴 Anonymous socket disconnected: ${client.id}`);
    }
  }

  // ---------------- EVENTS ----------------
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { receiverId: string; content: string },
  ) {
    const sender = client.data.user;
    if (!sender) return { error: 'Unauthorized' };

    if (!body?.receiverId || !body?.content?.trim()) {
      return { error: 'Invalid message body' };
    }

    try {
      const message = await this.chatService.createMessage(
        sender.id,
        body.receiverId,
        body.content.trim(),
      );

      this.server
        .to(`user:${body.receiverId}`)
        .emit('receive_message', message);
      client.emit('receive_message', message);

      return { success: true, message };
    } catch (err) {
      this.logger.error('Send message failed', err);
      return { error: 'Failed to send message' };
    }
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { messageId: number | string },
  ) {
    const user = client.data.user;
    if (!user) return { error: 'Unauthorized' };

    const messageId = Number(body?.messageId);
    if (!messageId) return { error: 'Invalid message ID' };

    try {
      const updated = await this.chatService.markAsRead(messageId);
      return { success: true, updated };
    } catch (err) {
      this.logger.error('Mark as read failed', err);
      return { error: 'Failed to mark message as read' };
    }
  }

  // ---------------- HELPERS ----------------
  private async authenticateSocket(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers.authorization?.replace(/^Bearer\s/, '');

      if (!token) {
        throw new Error('No token provided');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      const user = await this.userService.findOne(payload.userId);
      if (!user) {
        this.logger.warn(`❌ User not found for socket: ${client.id}`);
        return null;
      }

      return { id: user.id, email: user.email };
    } catch (err) {
      this.logger.warn(`❌ Socket auth failed: ${err.message}`);
      return null;
    }
  }
}
