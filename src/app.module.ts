import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { UtilsModule } from './modules/utils/utils.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './common/db/redis/redis.module';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { SeedService } from './common/seed/seed.services';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisConfig = configService.get('redis');
        return {
          connection: {
            host: redisConfig.host,
            port: redisConfig.port,
          },
        };
      },
      inject: [ConfigService],
    }),

    BullModule.registerQueue({ name: 'notification' }),

    PrismaModule,
    UtilsModule,
    UserModule,
    AuthModule,

    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService, SeedService],
})
export class AppModule {}
