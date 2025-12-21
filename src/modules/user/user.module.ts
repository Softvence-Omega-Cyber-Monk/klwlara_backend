import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { ConfigModule } from '@nestjs/config';

import { UserController } from './controller/user.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
  imports: [ConfigModule, NotificationModule],
})
export class UserModule {}
