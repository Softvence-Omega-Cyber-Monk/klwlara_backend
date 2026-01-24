import { Test, TestingModule } from '@nestjs/testing';
import { UserProductsService } from './user-products.service';

describe('UserProductsService', () => {
  let service: UserProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserProductsService],
    }).compile();

    service = module.get<UserProductsService>(UserProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
