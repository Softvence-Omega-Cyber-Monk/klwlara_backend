import { Module } from '@nestjs/common';
import { AdminProductsService } from './admin-products.service';
import { AdminProductsController } from './admin-products.controller';

@Module({
  controllers: [AdminProductsController],
  providers: [AdminProductsService],
})
export class AdminProductsModule {}
