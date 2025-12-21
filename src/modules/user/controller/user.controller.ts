import {
  Controller,
  Body,
  Get,
  Param,
  Delete,
  Patch,
  UseGuards,
  Query,
  Req,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from '../service/user.service';

import { UpdateUserDto } from '../dto/update-user.dto';
import { RolesGuard } from 'src/common/jwt/roles.guard';
import { JwtAuthGuard } from 'src/common/jwt/jwt.guard';
import { Roles } from 'src/common/jwt/roles.decorator';
import { Role } from 'generated/prisma';
import { PaginationDto } from 'src/modules/utils/pagination/pagination.dto';
import { RequestWithUser } from 'src/types/RequestWithUser';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/modules/utils/config/multer.config';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(Role.CLIENT)
  async findAll(@Query() query: PaginationDto) {
    const result = await this.userService.findAll({
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    });
    return { message: 'Users fetched successfully', data: result };
  }

  @Get('profile')
  async getUser(@Req() req: RequestWithUser) {
    const id = req.user?.userId;
    return {
      message: 'User fetched successfully',
      data: await this.userService.findOne(id!),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.userService.findOne(id);
    return { message: 'User fetched successfully', data: result };
  }

  @Patch()
  @UseInterceptors(FileInterceptor('profileImage', multerOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateUserDto })
  async update(
    @Req() req: RequestWithUser,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedException('User not found or not authenticated');
    }

    if (file) {
      updateUserDto.profileImage = file.path;
    }

    const result = await this.userService.update(userId, updateUserDto);
    return { message: 'User updated successfully', data: result };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.userService.remove(id);
    return { message: 'User deleted successfully', data: result };
  }

  // @Put('employees/:id/convert-to-manager')
  // async convertEmployeeToManager(
  //   @Param('id') id: string,
  //   @Body() convertDto: ConvertEmployeeToManagerDto,
  // ) {
  //   return this.userService.convertEmployeeToManager(id, convertDto);
  // }
}
