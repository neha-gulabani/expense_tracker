// src/recurring-expenses/recurring-expenses.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecurringExpensesService } from './recurring-expense.service';
import { RecurringExpensesController } from './recurring-expenses.controller';
import { RecurringExpense, RecurringExpenseSchema } from './schemas/recurring-expense.schema';
import { CategoriesModule } from '../categories/categories.module';
import { ExpensesModule } from '../expenses/expenses.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RecurringExpense.name, schema: RecurringExpenseSchema },
    ]),
    CategoriesModule,
    ExpensesModule,
  ],
  controllers: [RecurringExpensesController],
  providers: [RecurringExpensesService],
})
export class RecurringExpensesModule {}