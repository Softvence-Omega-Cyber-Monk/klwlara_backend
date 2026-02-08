// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from 'src/common/jwt/jwt.strategy';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './services/auth.services';
import { UserModule } from '../user/user.module';
import { UtilsModule } from '../utils/utils.module';
import { GoogleStrategy } from './utils/google.stratey';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    UserModule,
    UtilsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule, PassportModule.register({ session: false })],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt_access_secret'),
        signOptions: {
          expiresIn: configService.get('jwt_access_expires_in'),
        },
      }),
    }),
  ],

  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
})
export class AuthModule {}
