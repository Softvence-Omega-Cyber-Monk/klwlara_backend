import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

import { TLoginUserDto } from '../dto/auth.dto';
import { EmailService } from 'src/modules/utils/services/emailService';
import { JwtPayload } from 'src/types/RequestWithUser';
import { maskEmail, maskPhone } from './utiles.services';
import { buildJwtPayload } from '../utils/userbasetoken';
import { resetPasswordTemplate } from 'src/modules/utils/template/resetpassowordtemplate';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async loginUser(payload: TLoginUserDto) {
    const { email, password } = payload;

    const user = await this.prisma.client.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('This user is not found!');
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      throw new UnauthorizedException('Password does not match');
    }

    const jwtPayload = buildJwtPayload(user);

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

  async changePassword(
    userData: JwtPayload,
    payload: { oldPassword: string; newPassword: string },
  ): Promise<null> {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userData.userId },
    });

    if (!user) {
      throw new NotFoundException('This user is not found!');
    }

    // if (user.userStatus === UserStatus.DELETED) {
    //   throw new ForbiddenException('This user is deleted!');
    // }

    // if (user.userStatus === UserStatus.BANNED) {
    //   throw new ForbiddenException('This user is blocked!');
    // }

    // if (user.userStatus !== UserStatus.ACTIVE) {
    //   throw new ForbiddenException('Only active users can change password!');
    // }

    const isMatch = await bcrypt.compare(payload.oldPassword, user.password);
    if (!isMatch) {
      throw new ForbiddenException('Old password does not match');
    }

    const saltRounds =
      Number(this.configService.get('bcrypt_salt_rounds')) || 10;
    const newHashedPassword = await bcrypt.hash(
      payload.newPassword,
      saltRounds,
    );

    await this.prisma.client.user.update({
      where: { id: userData.userId },
      data: { password: newHashedPassword },
    });

    return null;
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded: JwtPayload = this.jwtService.verify<JwtPayload>(
        refreshToken,
        {
          secret: this.configService.get('jwt_refresh_secret'),
        },
      );

      const { userId }: { userId: string } = decoded;

      const user = await this.prisma.client.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // if (user.userStatus === UserStatus.BANNED) {
      //   throw new UnauthorizedException('This user is banned');
      // }

      // if (user.userStatus === UserStatus.DELETED) {
      //   throw new UnauthorizedException('This user account has been deleted');
      // }

      // if (user.userStatus !== UserStatus.ACTIVE) {
      //   throw new UnauthorizedException('Only active users can refresh token');
      // }

      const payload = {
        userId: user.id,
        role: user.role,
        email: user.email,
      };

      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get('jwt_access_secret'),
        expiresIn: this.configService.get('jwt_access_expires_in'),
      });

      return { accessToken };
    } catch (_error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async forgetPassword(email: string): Promise<void> {
    const user = await this.prisma.client.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('This user is not found!');
    }

    const jwtPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
    };

    const token = this.jwtService.sign(jwtPayload, {
      secret: this.configService.get('jwt_reset_secret'),
      expiresIn: '5m',
    });

    const resetLink = `${this.configService.get(
      'reset_pass_ui_link',
    )}?id=${user.id}&token=${token}`;

    await this.emailService.sendMail(
      user.email,
      'Reset Your Password',
      resetPasswordTemplate(user.name, resetLink),
    );
  }

  async resetPassword(
    payload: { id: string; newPassword: string },
    token: string,
  ): Promise<{ message: string }> {
    let decoded: { userId: string; email: string; role: string };
    try {
      decoded = this.jwtService.verify(token, {
        secret: this.configService.get('jwt_reset_secret'),
      });
    } catch (_error) {
      throw new BadRequestException('Invalid or expired token!');
    }

    if (decoded.userId !== payload.id) {
      throw new ForbiddenException('You are forbidden to reset this password!');
    }

    const user = await this.prisma.client.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      throw new NotFoundException('This user is not found!');
    }

    // if (user.userStatus === UserStatus.DELETED) {
    //   throw new ForbiddenException('This user is deleted!');
    // }

    // if (user.userStatus === UserStatus.BANNED) {
    //   throw new ForbiddenException('This user is blocked!');
    // }

    // if (user.userStatus !== UserStatus.ACTIVE) {
    //   throw new ForbiddenException('Only active users can reset password!');
    // }

    const saltRounds =
      Number(this.configService.get('bcrypt_salt_rounds')) || 10;

    const hashedPassword = await bcrypt.hash(payload.newPassword, saltRounds);

    await this.prisma.client.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    return {
      message: 'Password reset successful!',
    };
  }
}
