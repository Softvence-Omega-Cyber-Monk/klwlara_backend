import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateAdminProductDto } from './dto/create-admin-product.dto';
import { UpdateAdminProductDto } from './dto/update-admin-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAdminProductDto: CreateAdminProductDto) {
    console.log('createAdminProductDto', createAdminProductDto);

    const product = await this.prisma.client.adminProduct.create({
      data: createAdminProductDto,
    });
    return product;
  }

  async findAll() {
    return this.prisma.adminProduct.findMany();
  }

  async findOne(id: string) {
    const product = await this.prisma.adminProduct.findUnique({
      where: { id },
    });
    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  async update(id: string, updateAdminProductDto: UpdateAdminProductDto) {
    try {
      return await this.prisma.adminProduct.update({
        where: { id },
        data: updateAdminProductDto,
      });
    } catch (error) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.adminProduct.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}
