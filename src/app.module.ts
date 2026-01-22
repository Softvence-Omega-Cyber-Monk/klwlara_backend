import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { UtilsModule } from './modules/utils/utils.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
// import { RedisModule } from './common/db/redis/redis.module';

import { ScheduleModule } from '@nestjs/schedule';
// import { SeedService } from './common/seed/seed.services';
import { AdminProductsModule } from './modules/admin-products/admin-products.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),

    PrismaModule,
    UtilsModule,
    UserModule,
    AuthModule,
    AdminProductsModule,

    // RedisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ConfigService,
    // SeedService
  ],
})
export class AppModule {}
