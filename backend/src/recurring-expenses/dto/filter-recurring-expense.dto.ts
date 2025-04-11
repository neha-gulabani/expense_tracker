import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';

export class FilterRecurringExpenseDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' ? undefined : value)
  category?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => value === '' ? undefined : value)
  minAmount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => value === '' ? undefined : value)
  maxAmount?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @Transform(({ value }) => value === '' ? undefined : value)
  isActive?: boolean;
} 