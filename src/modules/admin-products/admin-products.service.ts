import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateAdminProductDto } from './dto/create-admin-product.dto';
import { UpdateAdminProductDto } from './dto/update-admin-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, ProductCategory } from 'generated/prisma';

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAdminProductDto: CreateAdminProductDto) {
    // console.log('createAdminProductDto', createAdminProductDto);

    const product = await this.prisma.client.adminProduct.create({
      data: createAdminProductDto,
    });
    return product;
  }

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    category?: ProductCategory;
    isActive?: boolean;
  }) {
    const { page, limit, search, category, isActive } = params;

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

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.client.adminProduct.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.adminProduct.count({ where }),
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
    const product = await this.prisma?.client.adminProduct.findUnique({
      where: { id },
    });
    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  async update(id: string, updateAdminProductDto: UpdateAdminProductDto) {
    const { sku, ...existingData } = updateAdminProductDto;
    try {
      return await this.prisma.client.adminProduct.update({
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

    const result = await this.prisma.client.adminProduct.deleteMany({
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
}
