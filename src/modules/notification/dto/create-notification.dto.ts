import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';

export enum NotificationType {
  NEW_EMPLOYEE_ASSIGNED = 'NEW_EMPLOYEE_ASSIGNED',
  NEW_MANAGER_ASSIGNED = 'NEW_MANAGER_ASSIGNED',
  SUBMISSION_UPDATED_STATUS = 'SUBMISSION_UPDATED_STATUS',
  PROJECT_SUBMITTED = 'PROJECT_SUBMITTED',
  PROJECT_STATUS_UPDATE = 'PROJECT_STATUS_UPDATE',
  PROJECT_CREATED = 'PROJECT_CREATED',
  REMINDER = 'REMINDER',
  SHEET_UPDATE_REQUEST = 'SHEET_UPDATE_REQUEST',
  FILE_CREATED = 'FILE_CREATED',
  ACTIVITY_CREATED = 'ACTIVITY_CREATED',
}

export class CreateNotificationDto {
  @ApiProperty({
    description: 'An array of user IDs who will receive the notification.',
    example: ['user-id-3', 'user-id-4'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  receiverIds: string[];

  @ApiProperty({
    description: 'The main content or message of the notification.',
    example: 'You have a new task assigned.',
  })
  @IsString()
  @IsNotEmpty()
  context: string;

  @ApiProperty({
    description: 'The type of the notification.',
    example: NotificationType.NEW_EMPLOYEE_ASSIGNED,
    enum: NotificationType,
  })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @ApiPropertyOptional({
    description: 'Optional project ID related to the notification.',
    example: 'project-id-123',
  })
  @IsString()
  @IsOptional()
  projectId?: string;
}
