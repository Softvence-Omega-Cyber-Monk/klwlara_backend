import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { IsAdminApprove, Prisma, ProductCategory } from 'generated/prisma';
import { CreateUserProductDto } from './dto/create-user-product.dto';
import { UpdateUserProductDto } from './dto/update-user-product.dto';

@Injectable()
export class UserProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(CreateUserProductDto: CreateUserProductDto) {
    console.log('CreateUserProductDto', CreateUserProductDto);
    // createAdminProductDto.isAdminApprove = 'pending';

    const product = await this.prisma.client.userProducts.create({
      data: CreateUserProductDto,
    });
    return product;
  }

  async findAll(params: {
    page: number;

    limit: number;
    search?: string;
    category?: ProductCategory;
    isAdminApprove?: IsAdminApprove;
  }) {
    const { page, limit, search, category, isAdminApprove } = params;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (isAdminApprove !== undefined) {
      where.isAdminApprove = isAdminApprove;
    }

    const [data, total] = await Promise.all([
      this.prisma.client.userProducts.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.userProducts.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async findAllByUser(params: {
    page: number;
    limit: number;
    search?: string;
    isAdminApprove?: IsAdminApprove;
  }) {
    const { page, limit, search, isAdminApprove } = params;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isAdminApprove !== undefined) {
      where.isAdminApprove = isAdminApprove;
    }

    const [data, total] = await Promise.all([
      this.prisma.client.userProducts.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.userProducts.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma?.client.userProducts.findUnique({
      where: { id },
    });
    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  async update(id: string, updateAdminProductDto: UpdateUserProductDto) {
    const { sku, ...existingData } = updateAdminProductDto;
    try {
      return await this.prisma.client.userProducts.update({
        where: { id },
        data: existingData,
      });
    } catch (error) {
      // Only throw 404 if Prisma says record not found
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // Otherwise rethrow so GlobalExceptionFilter handles it
      throw error;
    }
  }

  async removeMultiple(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new Error('No product IDs provided');
    }

    const result = await this.prisma.client.userProducts.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('No products found to delete');
    }

    return result; // { count: number }
  }

  async updateStatus(body: any) {
    const result = await this.prisma.client.userProducts.update({
      where: { id: body.productId },
      data: { isAdminApprove: body.status },
    });
    return result;
  }
}
