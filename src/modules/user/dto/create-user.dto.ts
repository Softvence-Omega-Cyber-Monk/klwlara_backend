import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { Role } from 'generated/prisma';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '25464654654' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: Role, required: false })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiProperty({ example: 'your-client-id' })
  @IsString()
  clientId: string;

  @ApiPropertyOptional({ type: [String], example: ['skill1', 'skill2'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];
}

export class UserFilterDto {
  @ApiPropertyOptional({
    example: 'john',
    description: 'Partial match on name',
  })
  @IsOptional()
  @IsString()
  name_contains?: string;

  @ApiPropertyOptional({
    example: 'gmail.com',
    description: 'Email ends with this value',
  })
  @IsOptional()
  @IsString()
  email_endsWith?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter users by active status',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 'admin,user',
    description: 'Comma-separated roles',
  })
  @IsOptional()
  @IsString()
  role_in?: string;
}
