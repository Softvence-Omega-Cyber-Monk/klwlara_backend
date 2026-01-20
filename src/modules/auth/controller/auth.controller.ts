import {
  Controller,
  Post,
  Body,
  UseGuards,
  Patch,
  Req,
  BadRequestException,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import {
  ChangePasswordDto,
  forgotPasswordDto,
  RefreshTokenDto,
  ResetPasswordDto,
  TLoginUserDto,
} from '../dto/auth.dto';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.services';
import { JwtAuthGuard } from 'src/common/jwt/jwt.guard';
import { Request } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: TLoginUserDto) {
    const data = await this.authService.loginUser(loginDto);
    return {
      message: 'Login User successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @Req() req: Request,
    @Body() payload: ChangePasswordDto,
  ) {
    const userData = req.user as {
      userId: string;
      role: string;
      email: string;
    };

    if (!payload.oldPassword || !payload.newPassword) {
      throw new BadRequestException(
        'Old password and new password are required',
      );
    }

    await this.authService.changePassword(userData, payload);

    return { message: 'Password changed successfully!' };
  }

  @Post('refresh-token')
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Refresh access token using refresh token from cookie',
  })
  async refreshAccessToken(@Body() dto: RefreshTokenDto) {
    const refreshToken = dto.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const result = await this.authService.refreshToken(refreshToken);
    return {
      message: 'access  token Change successfully',
      data: result,
    };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: forgotPasswordDto) {
    await this.authService.forgetPassword(dto.email);
    return { message: 'Please check your email to reset your password.' };
  }

  @Post('reset-password')
  @ApiQuery({ name: 'token', required: true })
  async resetPassword(
    @Body() payload: ResetPasswordDto,
    @Query('token') token: string,
  ) {
    return this.authService.resetPassword(payload, token);
  }
}
