// dto/delete-multiple-products.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class DeleteMultipleProductsDto {
  @ApiPropertyOptional({ example: ['1dfdf', '2dfdf', '3dfdf'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids: string[];
}
