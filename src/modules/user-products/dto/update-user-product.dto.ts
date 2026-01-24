import { PartialType } from '@nestjs/swagger';
import { CreateUserProductDto } from './create-user-product.dto';

export class UpdateUserProductDto extends PartialType(CreateUserProductDto) {}
