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
  Post,
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
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { CreateUserDto } from '../dto/create-user.dto';
import { Public } from 'src/common/jwt/public.gurad';

@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  cloudinaryService: any;
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('create')
  async create(@Body() createUserDto: CreateUserDto) {
    const result = await this.userService.create(createUserDto);

    return { message: 'User created successfully', data: result };
  }

  @Get()
  // @Roles(Role.CLIENT)
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

  @Get('getSingleUser/:id')
  async findOne(@Param('id') id: string) {
    const result = await this.userService.findOne(id);
    return { message: 'User fetched successfully', data: result };
  }

  @Patch('updateUser/:id')
  @UseInterceptors(FileInterceptor('profileImg', multerOptions))
  @ApiConsumes('multipart/form-data')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log('file', file);
    if (file) {
      const uploaded = await this.cloudinaryService.uploadFile(
        file,
        'users/profile',
      );

      updateUserDto.profileImg = uploaded.secure_url;
    }

    const result = await this.userService.update(id, updateUserDto);
    return { message: 'User updated successfully', data: result };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.userService.remove(id);
    return { message: 'User deleted successfully', data: result };
  }
}
