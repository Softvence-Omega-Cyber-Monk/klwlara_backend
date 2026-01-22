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
  Query,
} from '@nestjs/common';
import { AdminProductsService } from './admin-products.service';
import { CreateAdminProductDto } from './dto/create-admin-product.dto';
import { UpdateAdminProductDto } from './dto/update-admin-product.dto';
import { ApiConsumes, ApiQuery } from '@nestjs/swagger';
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

    const res = await this.adminProductsService.create(createAdminProductDto);
    return {
      data: res,
      message: 'Product created successfully',
    };
  }

  @Get('getAll')
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    const res = await this.adminProductsService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
    );
    return { data: res, message: 'Products fetched successfully' };
  }
  @Get('getSingle/:id')
  async findOne(@Param('id') id: string) {
    const res = await this.adminProductsService.findOne(id);
    return { data: res, message: 'Product fetched successfully' };
  }

  @Patch('update/:id')
  @UseInterceptors(FilesInterceptor('images', 5, multerOptions))
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id') id: string,
    @Body() updateAdminProductDto: UpdateAdminProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    if (files?.length) {
      const uploadedUrls = await Promise.all(
        files.map((file) =>
          this.cloudinaryService.uploadFile(file, 'products'),
        ),
      );

      updateAdminProductDto.images = uploadedUrls
        .filter(Boolean)
        .map((u) => u!.secure_url);
    }

    const updatedProduct = await this.adminProductsService.update(
      id,
      updateAdminProductDto,
    );

    return {
      data: updatedProduct,
      message: 'Product updated successfully',
    };
  }

  @Delete('delte/:id')
  remove(@Param('id') id: string) {
    const res = this.adminProductsService.remove(id);
    return { message: 'Product deleted successfully' };
  }
}
