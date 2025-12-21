import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { NotificationService } from '../service/notification.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { JwtAuthGuard } from '../../../common/jwt/jwt.guard';
import { ApiTags } from '@nestjs/swagger';
import { RequestWithUser } from '../../../types/RequestWithUser';

@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createNotificationDto: CreateNotificationDto,
    @Req() req: RequestWithUser,
  ) {
    return this.notificationService.create(
      createNotificationDto,
      req.user.userId,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Get('received')
  findAll(@Req() req: RequestWithUser) {
    return this.notificationService.findAll(req.user.userId);
  }
  @UseGuards(JwtAuthGuard)
  @Get('sent')
  findSentNotifications(@Req() req: RequestWithUser) {
    console.log('request user', req.user);
    return this.notificationService.findSentNotifications(req.user.userId);
  }
}
