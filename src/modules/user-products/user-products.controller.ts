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
import { ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../utils/config/multer.config';
import { CloudinaryService } from '../utils/services/cloudinary.service';
import { IsAdminApprove, ProductCategory, User } from 'generated/prisma';
import { UserProductsService } from './user-products.service';
import { CreateUserProductDto } from './dto/create-user-product.dto';
import { UpdateUserProductDto } from './dto/update-user-product.dto';
import { DeleteMultipleProductsDto } from '../admin-products/dto/delete-multiple-product.dto';
import { UpdateProductStatusDto } from './dto/updateProductStatus.dto';

@Controller('user-products')
export class UserProductsController {
  constructor(
    private readonly adminProductsService: UserProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @UseInterceptors(FilesInterceptor('images', 5, multerOptions))
  @ApiConsumes('multipart/form-data')
  @Post('create')
  async create(
    @Body() createAdminProductDto: CreateUserProductDto,
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
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: ProductCategory,
  })
  @ApiQuery({
    name: 'isAdminApprove',
    required: false,
    enum: IsAdminApprove,
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('category') category?: ProductCategory,
    @Query('isAdminApprove') isAdminApprove?: IsAdminApprove,
  ) {
    const result = await this.adminProductsService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search,
      category,
      isAdminApprove: isAdminApprove,
    });

    return {
      message: 'Products fetched successfully',
      ...result,
    };
  }

  @Get('getAllByUser/:userId')
  @ApiQuery({ name: 'userId', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'isAdminApprove',
    required: false,
    enum: IsAdminApprove,
  })
  async findAllByUser(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('isAdminApprove') isAdminApprove?: IsAdminApprove,
  ) {
    const result = await this.adminProductsService.findAllByUser({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search,
      isAdminApprove: isAdminApprove,
    });

    return {
      message: 'single user Products fetched successfully',
      ...result,
    };
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
    @Body() updateAdminProductDto: UpdateUserProductDto,
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
  @Delete('delete-multiple')
  async removeMultiple(@Body() body: DeleteMultipleProductsDto) {
    const result = await this.adminProductsService.removeMultiple(body.ids);

    return {
      message: 'Products deleted successfully',
      deletedCount: result.count,
    };
  }

  @Patch('update-status')
  async updateStatus(@Body() body: UpdateProductStatusDto) {
    const result = await this.adminProductsService.updateStatus(body);
    return {
      message: 'Product status updated successfully',
      data: result,
    };
  }
}
