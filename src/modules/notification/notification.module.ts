// import { Module } from '@nestjs/common';
// import { NotificationService } from './service/notification.service';
// import { NotificationController } from './controller/notification.controller';
// import { PrismaModule } from 'src/prisma/prisma.module';
// import { Gateway } from './service/notification.getway';
// import { JwtModule } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config';
// import { RedisService } from 'src/common/db/redis/services/redis.service';

// @Module({
//   imports: [
//     PrismaModule,
//     JwtModule.registerAsync({
//       useFactory: (configService: ConfigService) => ({
//         secret: configService.get<string>('jwt_secret'),
//         signOptions: {
//           expiresIn: configService.get<string>('jwt_expires_in') || '1d',
//         },
//       }),
//       inject: [ConfigService],
//     }),
//   ],
//   controllers: [NotificationController],
//   providers: [NotificationService, Gateway, RedisService],
//   exports: [NotificationService],
// })
// export class NotificationModule {}

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { PrismaModule } from 'src/prisma/prisma.module';
import { RedisService } from 'src/common/db/redis/services/redis.service';

import { NotificationController } from './controller/notification.controller';
import { NotificationService } from './service/notification.service';
import { Gateway } from './service/notification.getway';

import { NotificationProcessor } from './service/notification.processor';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'notification',
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt_secret'),
        signOptions: {
          expiresIn: configService.get('jwt_expires_in') || '1d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    Gateway,
    RedisService,

    NotificationProcessor,
  ],
  exports: [NotificationService, BullModule, Gateway],
})
export class NotificationModule {}
