import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  RecurringExpense,
  RecurringExpenseDocument,
  RecurringInterval,
} from './schemas/recurring-expense.schema';
import { CreateRecurringExpenseDto } from './dto/create-recurring-expense.dto';
import { UpdateRecurringExpenseDto } from './dto/update-recurring-expense.dto';
import { CategoriesService } from '../categories/categories.service';
import { ExpensesService } from '../expenses/expenses.service';

@Injectable()
export class RecurringExpensesService {
  private readonly logger = new Logger(RecurringExpensesService.name);

  constructor(
    @InjectModel(RecurringExpense.name)
    private recurringExpenseModel: Model<RecurringExpenseDocument>,
    private categoriesService: CategoriesService,
    private expensesService: ExpensesService,
  ) {}

  async create(
    userId: string,
    createRecurringExpenseDto: CreateRecurringExpenseDto,
  ): Promise<RecurringExpense> {
    const { categoryName, ...expenseData } = createRecurringExpenseDto;

    // Find or create category if categoryName is provided
    let categoryId: string | undefined = undefined;
    if (categoryName) {
      const category = await this.categoriesService.findOrCreate(
        userId,
        categoryName,
      );
      categoryId = category._id;
    }

    const recurringExpense = new this.recurringExpenseModel({
      ...expenseData,
      category: categoryId,
      user: userId,
      isActive: true,
      lastProcessed: new Date(),
    });

    return recurringExpense.save();
  }

  async findAll(userId: string): Promise<RecurringExpense[]> {
    return this.recurringExpenseModel
      .find({ user: userId })
      .populate('category')
      .exec();
  }

  async findOne(userId: string, id: string): Promise<RecurringExpense | null> {
    return this.recurringExpenseModel
      .findOne({ _id: id, user: userId })
      .populate('category')
      .exec();
  }

  async update(
    userId: string,
    id: string,
    updateRecurringExpenseDto: UpdateRecurringExpenseDto,
  ): Promise<RecurringExpense | null> {
    const { categoryName, ...updateData } = updateRecurringExpenseDto;

    // Find or create category if categoryName is provided
    if (categoryName) {
      const category = await this.categoriesService.findOrCreate(
        userId,
        categoryName,
      );
      updateData['category'] = category._id;
    }

    return this.recurringExpenseModel
      .findOneAndUpdate({ _id: id, user: userId }, updateData, { new: true })
      .populate('category')
      .exec();
  }

  async remove(userId: string, id: string): Promise<RecurringExpense | null> {
    return this.recurringExpenseModel
      .findOneAndDelete({ _id: id, user: userId })
      .exec();
  }

  // Daily at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processRecurringExpenses() {
    this.logger.log('Processing recurring expenses...');
    const now = new Date();

    // Get all active recurring expenses
    const activeRecurringExpenses = await this.recurringExpenseModel
      .find({
        isActive: true,
        startDate: { $lte: now },
        $or: [{ endDate: { $gte: now } }, { endDate: null }],
      })
      .populate('user')
      .populate('category')
      .exec();

    for (const recurringExpense of activeRecurringExpenses) {
      const lastProcessed = new Date(recurringExpense.lastProcessed);
      let shouldProcess = false;

      // Check if the expense should be processed based on its interval
      switch (recurringExpense.interval) {
        case RecurringInterval.DAILY:
          // If last processed date is yesterday or earlier
          shouldProcess =
            lastProcessed.getDate() < now.getDate() ||
            lastProcessed.getMonth() < now.getMonth() ||
            lastProcessed.getFullYear() < now.getFullYear();
          break;

        case RecurringInterval.WEEKLY:
          // If it's been at least 7 days since last processing
          const weekDiff = Math.floor(
            (now.getTime() - lastProcessed.getTime()) / (1000 * 60 * 60 * 24 * 7),
          );
          shouldProcess = weekDiff >= 1;
          break;

        case RecurringInterval.MONTHLY:
          // If it's a new month compared to last processing
          shouldProcess =
            lastProcessed.getMonth() < now.getMonth() ||
            lastProcessed.getFullYear() < now.getFullYear();
          break;
      }

      if (shouldProcess) {
        try {
          // Create a new expense
          await this.expensesService.create(recurringExpense.user._id as string, {
            amount: recurringExpense.amount,
            description: `[Recurring] ${recurringExpense.description}`,
            date: new Date().toISOString(),
            categoryName: recurringExpense.category?.name,
          });

          // Update the lastProcessed date
          await this.recurringExpenseModel
            .findByIdAndUpdate(recurringExpense._id, {
              lastProcessed: now,
            })
            .exec();

          this.logger.log(
            `Processed recurring expense: ${recurringExpense._id} for user: ${recurringExpense.user._id as string}`,
          );
        } catch (error) {
          this.logger.error(
            `Error processing recurring expense: ${recurringExpense._id}`,
            error.stack,
          );
        }
      }
    }

    this.logger.log('Recurring expenses processing completed');
  }
}