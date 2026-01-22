import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AdminProductsService } from './admin-products.service';
import { CreateAdminProductDto } from './dto/create-admin-product.dto';
import { UpdateAdminProductDto } from './dto/update-admin-product.dto';
import { ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../utils/config/multer.config';
import { CloudinaryService } from '../utils/services/cloudinary.service';

@Controller('admin-products')
export class AdminProductsController {
  constructor(
    private readonly adminProductsService: AdminProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @UseInterceptors(FilesInterceptor('images', 5, multerOptions))
  @ApiConsumes('multipart/form-data')
  @Post('create')
  async create(
    @Body() createAdminProductDto: CreateAdminProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    if (files && files.length) {
      // Wait for all uploads to finish
      const uploadedUrls = await Promise.all(
        files.map((file) =>
          this.cloudinaryService.uploadFile(file, 'products'),
        ),
      );

      // Map to secure_url
      createAdminProductDto.images = uploadedUrls
        .filter((u) => u) // remove any null/undefined
        .map((u) => u!.secure_url); // '!' because we filtered nulls
    }

    return this.adminProductsService.create(createAdminProductDto);
  }

  @Get('getAll')
  findAll() {
    return this.adminProductsService.findAll();
  }

  @Get('getSingle/:id')
  findOne(@Param('id') id: string) {
    return this.adminProductsService.findOne(id);
  }

  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateAdminProductDto: UpdateAdminProductDto,
  ) {
    return this.adminProductsService.update(id, updateAdminProductDto);
  }

  @Delete('delte/:id')
  remove(@Param('id') id: string) {
    return this.adminProductsService.remove(id);
  }
}
