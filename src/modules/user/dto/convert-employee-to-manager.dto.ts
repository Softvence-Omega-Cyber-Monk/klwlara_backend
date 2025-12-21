import { IsArray, IsOptional, IsString } from 'class-validator';

export class ConvertEmployeeToManagerDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];
}
