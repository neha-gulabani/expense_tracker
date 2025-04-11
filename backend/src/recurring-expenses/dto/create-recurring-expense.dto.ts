import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, IsBoolean, Min, IsMongoId } from 'class-validator';
import { RecurringInterval } from '../schemas/recurring-expense.schema';

export class CreateRecurringExpenseDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  frequency: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsNotEmpty()
  @IsMongoId()
  categoryId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
