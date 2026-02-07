import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/modules/user/service/user.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async handleConnection(client: Socket) {
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers['authorization']?.replace('Bearer ', '');

    const payload = await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_ACCESS_SECRET,
    });

    const user = await this.userService.findOne(payload.userId);
    if (!user) return client.disconnect();

    client.data.user = user;

    // 🔥 user-specific room
    client.join(`user:${user.id}`);

    console.log('Socket connected:', user.email);
  }

  handleDisconnect(client: Socket) {
    console.log('Socket disconnected:', client.id);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    return { event: 'pong', data: 'pong from server' };
  }
}
