import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { IsAdminApprove } from 'generated/prisma';

export class UpdateProductStatusDto {
  @ApiProperty({
    example: 'cuid12345',
    description: 'ID of the product to update',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    example: IsAdminApprove.approved,
    enum: IsAdminApprove,
    description: 'New admin approval status',
  })
  @IsEnum(IsAdminApprove)
  status: IsAdminApprove;
}
