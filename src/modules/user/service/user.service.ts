import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from 'src/modules/utils/services/cloudinary.service';
import { uploadImageAndDto } from '../dto/updatefile.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UploadApiResponse } from 'cloudinary';
import { buildDynamicPrismaFilter } from 'src/modules/utils/queryBuilder/prisma-filter-builder';
import { Role } from 'generated/prisma';
import { ConvertEmployeeToManagerDto } from '../dto/convert-employee-to-manager.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import {
  paginate,
  PaginatedResult,
} from 'src/modules/utils/pagination/pagination.utils';
import { deleteProfileImage } from 'src/modules/utils/file.utils';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async uploadMultipleImages(files: Express.Multer.File[]) {
    const results: UploadApiResponse[] = [];

    for (const file of files) {
      try {
        const res: UploadApiResponse = await this.cloudinary.uploadFile(file);
        results.push(res);
      } catch (error) {
        console.error(`Failed to upload image ${file.originalname}:`, error);
      }
    }

    return {
      message: 'Multiple images uploaded',
      files: results,
    };
  }

  async uploadSingleImage(file: Express.Multer.File) {
    try {
      const result = await this.cloudinary.uploadFile(file);
      return {
        message: 'Single image uploaded',
        file: result,
      };
    } catch (error) {
      console.error('Upload single image failed:', error);
      throw error;
    }
  }

  async findAll(
    query: { page: number; limit: number } = { page: 1, limit: 10 },
  ): Promise<PaginatedResult<any>> {
    const paginatedUsers = await paginate(
      this.prisma.client,
      'user',
      {},
      { page: query.page, limit: query.limit },
    );

    paginatedUsers.data = paginatedUsers.data.map((user: any) => {
      const { password, ...result } = user;
      return result;
    });

    return paginatedUsers;
  }

  async findOne(id: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    const { password, ...result } = user;
    return result;
  }

  async getUserById(id: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password, ...safeUser } = user;
    return safeUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userExists = await this.prisma.client.user.findUnique({
      where: { id },
    });

    if (!userExists) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (
      updateUserDto.profileImage &&
      userExists.profileImage &&
      updateUserDto.profileImage !== userExists.profileImage
    ) {
      deleteProfileImage(userExists.profileImage);
    }

    const user = await this.prisma.client.user.update({
      where: { id },
      data: updateUserDto,
    });

    const { password, ...result } = user;
    return result;
  }

  async remove(id: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    await this.prisma.client.user.delete({
      where: { id },
    });

    const { password, ...result } = user;
    return result;
  }

  // async convertEmployeeToManager(employeeId: string, dto: ConvertEmployeeToManagerDto) {
  //   return this.prisma.client.$transaction(async (prisma) => {
  //     const user = await prisma.user.findUnique({
  //       where: { id: employeeId },
  //       include: { employee: true },
  //     });

  //     if (!user || !user.employee) {
  //       throw new BadRequestException(`User with ID "${employeeId}" is not a valid employee.`);
  //     }

  //     await prisma.employee.delete({ where: { userId: employeeId } });

  //     const manager = await prisma.manager.create({
  //       data: {
  //         userId: employeeId,
  //         description:dto.
  //         skills: dto.skills || [],
  //       },
  //     });

  //     const updatedUser = await prisma.user.update({
  //       where: { id: employeeId },
  //       data: { role: Role.MANAGER },
  //     });

  //     const { password, ...userWithoutPassword } = updatedUser;

  //     return {
  //       ...manager,
  //       user: userWithoutPassword,
  //     };
  //   });
  // }

  async findAllWithFilters(dto: Record<string, any>) {
    const where = buildDynamicPrismaFilter(dto);
    return this.prisma.client.user.findMany({ where });
  }
}
