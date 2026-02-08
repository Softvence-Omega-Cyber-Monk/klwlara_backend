// src/modules/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SocketGateway } from 'src/common/socket/socket.gateway';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '1h' }, // optional
    }),
    UserModule, // <--- ADD THIS
  ],
  providers: [ChatService, SocketGateway],
  controllers: [ChatController],
  exports: [ChatService, SocketGateway],
})
export class ChatModule {}
