import { Module } from '@nestjs/common';
import { UserProductsService } from './user-products.service';
import { UserProductsController } from './user-products.controller';

@Module({
  controllers: [UserProductsController],
  providers: [UserProductsService],
})
export class UserProductsModule {}
