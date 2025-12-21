import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseUserDto } from './base-user.dto';

export class CreateEmployeeDto extends BaseUserDto {
  // @ApiProperty({ example: 'your-client-id' })
  // @IsString()
  // clientId: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['Civil Eng', 'Architect'],
    description: 'List of skills the manager has',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills: string[];

  @ApiPropertyOptional({
    example: 'Responsible for managing infrastructure projects',
    description: 'Program or role description',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    example: '2025-10-11',
    description: 'The date the manager joined the company',
  })
  @IsDateString()
  joinedDate: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['projectID_1', 'projectID_2'],
    description: 'List of assigned projects',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  projects?: string[];

  @ApiPropertyOptional({
    example: true,
    description: 'Whether to send a welcome email with login link',
  })
  @IsBoolean()
  @IsOptional()
  sendWelcomeEmail?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether to notify the project manager about this new manager',
  })
  @IsBoolean()
  @IsOptional()
  notifyProjectManager?: boolean;
}
