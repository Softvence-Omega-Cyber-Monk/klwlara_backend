// src/socket/socket.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SocketGateway } from './socket.gateway';
import { UserModule } from 'src/modules/user/user.module';

@Module({
  imports: [
    UserModule, // reuse existing user logic
    JwtModule, // same JWT config as auth module
  ],

  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
