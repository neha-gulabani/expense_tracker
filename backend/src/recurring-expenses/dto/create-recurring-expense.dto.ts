import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { RecurringInterval } from '../schemas/recurring-expense.schema';

export class CreateRecurringExpenseDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(RecurringInterval)
  @IsNotEmpty()
  interval: RecurringInterval;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  categoryName?: string;
}
