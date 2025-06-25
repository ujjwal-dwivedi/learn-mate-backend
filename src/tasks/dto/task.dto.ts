import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsDateString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Learn Python basics' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Complete Python fundamentals course', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Python Programming' })
  @IsString()
  @IsNotEmpty()
  topic: string;

  @ApiProperty({ example: 'Programming', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 'high', enum: ['low', 'medium', 'high'], required: false })
  @IsIn(['low', 'medium', 'high'])
  @IsOptional()
  priority?: 'low' | 'medium' | 'high';

  @ApiProperty({ example: '2024-12-31T23:59:59.000Z', required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

export class UpdateTaskDto {
  @ApiProperty({ example: 'Learn Python advanced concepts', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Complete advanced Python course', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @ApiProperty({ example: 'Programming', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 'high', enum: ['low', 'medium', 'high'], required: false })
  @IsIn(['low', 'medium', 'high'])
  @IsOptional()
  priority?: 'low' | 'medium' | 'high';

  @ApiProperty({ example: '2024-12-31T23:59:59.000Z', required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

export class GenerateTasksDto {
  @ApiProperty({ example: 'Learn Python' })
  @IsString()
  @IsNotEmpty()
  topic: string;
}
