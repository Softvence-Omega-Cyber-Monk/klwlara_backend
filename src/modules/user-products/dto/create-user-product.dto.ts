import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsArray,
  IsDateString,
  ArrayNotEmpty,
  ArrayUnique,
  IsISO8601,
} from 'class-validator';
import { Condition, IsAdminApprove, ProductCategory } from 'generated/prisma';

export class CreateUserProductDto {
  @ApiPropertyOptional({ example: 'Electronics' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: ProductCategory.NEW_ITEM })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @ApiPropertyOptional({ example: 'ABC123' })
  @IsString()
  sku: string;

  @ApiPropertyOptional({ example: 'anyting' })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({ example: 'anyting' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    example: Condition.Used,
    enum: Condition, // <-- This makes Swagger show the enum values
  })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsEnum(Condition)
  condition: Condition;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  specialPrice?: number;

  @ApiPropertyOptional({ example: '2023-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsISO8601()
  specialPriceFrom?: string;

  @ApiPropertyOptional({ example: '2023-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsISO8601()
  specialPriceTo?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  stockQuantity: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  length?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ example: 'anyting' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'anyting' })
  @IsOptional()
  @IsString()
  sourcingStory?: string;

  // Make this optional so Prisma will use default 'pending'
  @ApiPropertyOptional({
    example: IsAdminApprove.pending,
    enum: IsAdminApprove,
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsEnum(IsAdminApprove)
  isAdminApprove?: IsAdminApprove;

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
      description: 'Profile image files to upload',
    },
    description: 'Array of images for upload',
  })
  images?: string[];
}
