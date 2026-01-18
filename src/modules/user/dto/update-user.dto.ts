import {
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Profile image file to upload',
  })
  @IsOptional()
  profileImage?: string;

  @ApiPropertyOptional({
    example: '2025-11-13T10:00:00Z',
    description: 'Timezone or time preference in ISO 8601 format',
  })
  @IsDateString()
  @IsOptional()
  timezone?: Date;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether 2FA verification is enabled',
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  verification2FA?: boolean;
}
