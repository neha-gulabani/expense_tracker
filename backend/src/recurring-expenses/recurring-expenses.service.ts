import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RecurringExpense } from './schemas/recurring-expense.schema';
import { CreateRecurringExpenseDto } from './dto/create-recurring-expense.dto';
import { UpdateRecurringExpenseDto } from './dto/update-recurring-expense.dto';
import { FilterRecurringExpenseDto } from './dto/filter-recurring-expense.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class RecurringExpensesService {
  private readonly logger = new Logger(RecurringExpensesService.name);

  constructor(
    @InjectModel(RecurringExpense.name)
    private recurringExpenseModel: Model<RecurringExpense>,
    private categoriesService: CategoriesService,
  ) {}

  async create(userId: string, createRecurringExpenseDto: CreateRecurringExpenseDto) {
    this.logger.debug(`Creating recurring expense for user ${userId}`);
    this.logger.debug(`DTO: ${JSON.stringify(createRecurringExpenseDto)}`);

    const { startDate, endDate, categoryId, ...rest } = createRecurringExpenseDto;

    // Create the recurring expense
    const recurringExpense = new this.recurringExpenseModel({
      ...rest,
      user: userId,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      category: categoryId,
    });

    this.logger.debug(`Created recurring expense object: ${JSON.stringify(recurringExpense)}`);

    // Save the recurring expense
    const savedExpense = await recurringExpense.save();
    this.logger.debug(`Saved recurring expense: ${JSON.stringify(savedExpense)}`);

    return savedExpense;
  }

  async findAll(
    userId: string,
    paginationQuery: PaginationQueryDto,
    filterDto: FilterRecurringExpenseDto,
  ) {
    try {
      this.logger.debug(`Finding all recurring expenses for user: ${userId}`);
      this.logger.debug(`Pagination: ${JSON.stringify(paginationQuery)}`);
      this.logger.debug(`Filters: ${JSON.stringify(filterDto)}`);
      
      const { page = 1, limit = 10 } = paginationQuery;
      const skip = (page - 1) * limit;

      // Build filter query
      const filter: any = { user: userId };
      
      // Category filtering
      if (filterDto.category) {
        filter.category = new Types.ObjectId(filterDto.category);
      }

      // Amount filtering
      const amountFilter: any = {};
      if (filterDto.minAmount !== undefined && filterDto.minAmount !== null) {
        amountFilter.$gte = Number(filterDto.minAmount);
      }
      if (filterDto.maxAmount !== undefined && filterDto.maxAmount !== null) {
        amountFilter.$lte = Number(filterDto.maxAmount);
      }
      if (Object.keys(amountFilter).length > 0) {
        filter.amount = amountFilter;
      }

      // Active status filtering
      if (filterDto.isActive !== undefined && filterDto.isActive !== null) {
        filter.isActive = filterDto.isActive;
      }

      this.logger.debug('Query filter:', JSON.stringify(filter, null, 2));

      const [items, total] = await Promise.all([
        this.recurringExpenseModel
          .find(filter)
          .populate('category')
          .skip(skip)
          .limit(limit)
          .exec(),
        this.recurringExpenseModel.countDocuments(filter),
      ]);

      this.logger.debug(`Found ${items.length} items out of ${total} total`);

      return {
        data: items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Error finding all recurring expenses: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(userId: string, id: string) {
    return this.recurringExpenseModel
      .findOne({ _id: id, user: userId })  
      .populate('category')
      .exec();
  }

  async update(userId: string, id: string, updateRecurringExpenseDto: UpdateRecurringExpenseDto) {
    try {
      const { categoryName, ...rest } = updateRecurringExpenseDto;
      
      // Find or create category if categoryName is provided
      if (categoryName) {
        const category = await this.categoriesService.findOrCreate(userId, categoryName);
        rest['category'] = category._id;
      }

      return this.recurringExpenseModel
        .findOneAndUpdate(
          { _id: id, user: userId },
          { $set: rest },
          { new: true },
        )
        .populate('category')
        .exec();
    } catch (error) {
      this.logger.error(`Error updating recurring expense: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(userId: string, id: string) {
    return this.recurringExpenseModel
      .findOneAndDelete({ _id: id, user: userId })  
      .exec();
  }
} 