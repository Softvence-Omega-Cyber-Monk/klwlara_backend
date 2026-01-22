import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateAdminProductDto } from './dto/create-admin-product.dto';
import { UpdateAdminProductDto } from './dto/update-admin-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'generated/prisma';

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

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.client.adminProduct.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc', // optional but recommended
        },
      }),
      this.prisma.client.adminProduct.count(),
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

  async remove(id: string) {
    try {
      return await this.prisma.client.adminProduct.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}
