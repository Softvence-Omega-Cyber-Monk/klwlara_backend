// src/otp/otp.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { addMinutes, isBefore } from 'date-fns';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as Twilio from 'twilio';
import { generateOTP } from './utiles.services';
import { JwtService } from '@nestjs/jwt';
import { buildJwtPayload } from '../utils/userbasetoken';

@Injectable()
export class OtpService {
  private client: Twilio.Twilio;
  private verifyServiceSid: string;
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.client = Twilio(
      this.configService.get('twilio.accountSid'),
      this.configService.get('twilio.authToken'),
    );
    this.verifyServiceSid = this.configService.get('twilio.verifyServiceSid')!;
  }

  // send Email verification code
  async generate(email: string) {
    const otp = generateOTP();
    const expiresAt = addMinutes(new Date(), 10);

    await this.prisma.client.otpVerification.upsert({
      where: { email },
      update: {
        verified: false,
        otp,
        expiresAt,
      },
      create: {
        email,
        otp,
        expiresAt,
      },
    });

    return otp;
  }

  // Check Email verification code
  async verify(email: string, submittedOtp: string) {
    const user = await this.prisma.client.user.findFirst({
      where: {
        email,
        userStatus: { notIn: ['BANNED', 'DELETED', 'SUSPENDED'] },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found for the provided email');
    }
    const record = await this.prisma.client.otpVerification.findFirst({
      where: { email, verified: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) throw new BadRequestException('OTP not found');

    if (record.otp !== submittedOtp)
      throw new BadRequestException('Invalid OTP');

    if (isBefore(record.expiresAt, new Date()))
      throw new BadRequestException('OTP expired');

    await this.prisma.client.otpVerification.update({
      where: { id: record.id },
      data: { verified: true },
    });

    const jwtPayload = await buildJwtPayload(this.prisma, user);

    const accessToken = this.jwtService.sign(jwtPayload, {
      secret: this.configService.get('jwt_access_secret'),
      expiresIn: this.configService.get('jwt_access_expires_in'),
    });

    const refreshToken = this.jwtService.sign(jwtPayload, {
      secret: this.configService.get('jwt_refresh_secret'),
      expiresIn: this.configService.get('jwt_refresh_expires_in'),
    });

    return { accessToken, refreshToken };
  }

  //  Send verification code
  async sendVerificationCode(to: string) {
    const data = await this.client.verify.v2
      .services(this.verifyServiceSid)
      .verifications.create({ to, channel: 'sms' });

    return data;
  }

  //  Check verification code
  async checkVerificationCode(to: string, code: string) {
    try {
      const result = await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verificationChecks.create({ to, code });

      if (!result) {
        throw new BadRequestException('Verification failed. Please try again.');
      }

      if (result.status !== 'approved') {
        if (result.status === 'pending') {
          throw new BadRequestException(
            'Invalid or incorrect verification code.',
          );
        } else if (result.status === 'expired') {
          throw new BadRequestException(
            'Verification code has expired. Please request a new one.',
          );
        } else {
          throw new BadRequestException(
            'Verification failed. Please try again.',
          );
        }
      }

      const user = await this.prisma.client.user.findFirst({
        where: {
          phoneNumber: to,
          userStatus: { notIn: ['BANNED', 'DELETED', 'SUSPENDED'] },
        },
      });

      if (!user) {
        throw new NotFoundException(
          'User not found for the provided phone number',
        );
      }

      const expiresAt = addMinutes(new Date(), 10);
      await this.prisma.client.otpVerification.upsert({
        where: { email: user.email },
        update: { verified: true, otp: code, expiresAt },
        create: { email: user.email, verified: true, otp: code, expiresAt },
      });

      const jwtPayload = await buildJwtPayload(this.prisma, user);

      const accessToken = this.jwtService.sign(jwtPayload, {
        secret: this.configService.get('jwt_access_secret'),
        expiresIn: this.configService.get('jwt_access_expires_in'),
      });

      const refreshToken = this.jwtService.sign(jwtPayload, {
        secret: this.configService.get('jwt_refresh_secret'),
        expiresIn: this.configService.get('jwt_refresh_expires_in'),
      });

      return {
        success: true,
        message: 'OTP verified successfully',
        accessToken,
        refreshToken,
      };
    } catch (error: any) {
      if (
        error.code === 20404 ||
        error.message?.includes('VerificationCheck was not found')
      ) {
        throw new BadRequestException(
          'Verification failed — please check the code and try again',
        );
      }

      if (error.code === 60200) {
        throw new BadRequestException('Invalid verification code.');
      }

      throw new BadRequestException(error.message || 'Verification failed.');
    }
  }
}
