import { Test, TestingModule } from '@nestjs/testing';
import { UserProductsController } from './user-products.controller';
import { UserProductsService } from './user-products.service';

describe('UserProductsController', () => {
  let controller: UserProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserProductsController],
      providers: [UserProductsService],
    }).compile();

    controller = module.get<UserProductsController>(UserProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
