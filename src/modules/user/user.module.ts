import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { ConfigModule } from '@nestjs/config';

import { UserController } from './controller/user.controller';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
  imports: [ConfigModule],
})
export class UserModule {}
