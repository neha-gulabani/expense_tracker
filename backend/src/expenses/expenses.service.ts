import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense, ExpenseDocument } from './schemas/expense.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CategoriesService } from '../categories/categories.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { FilterExpenseDto } from './dto/filter-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    private categoriesService: CategoriesService,
  ) {}

  async create(userId: string, createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const { categoryName, ...expenseData } = createExpenseDto;
    
    // Find or create category if categoryName is provided
    let categoryId: string | undefined = undefined;
    if (categoryName) {
      const category = await this.categoriesService.findOrCreate(
        userId,
        categoryName,
      );
      categoryId = category._id;
    }

    const expense = new this.expenseModel({
      ...expenseData,
      category: categoryId,
      user: userId,
      date: createExpenseDto.date || new Date(),
    });
    
    return expense.save();
  }

  async findAll(
    userId: string,
    paginationQuery: PaginationQueryDto,
    filterDto: FilterExpenseDto,
  ): Promise<{ data: Expense[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    // Build filter query
    const query: any = { user: userId };
    
    if (filterDto.startDate) {
      query.date = { $gte: new Date(filterDto.startDate) };
    }
    
    if (filterDto.endDate) {
      query.date = { ...query.date, $lte: new Date(filterDto.endDate) };
    }
    
    if (filterDto.category) {
      query.category = filterDto.category;
    }

    if (filterDto.minAmount) {
      query.amount = { $gte: filterDto.minAmount };
    }

    if (filterDto.maxAmount) {
      query.amount = { ...query.amount, $lte: filterDto.maxAmount };
    }

    // Get total count for pagination
    const total = await this.expenseModel.countDocuments(query);
    
    // Get expenses with pagination
    const expenses = await this.expenseModel
      .find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate('category')
      .exec();

      console.log('returning expenses')

    return {
      data: expenses,
      total,
      page,
      limit,
    };
  }

  async findOne(userId: string, id: string): Promise<Expense | null> {
    return this.expenseModel
      .findOne({ _id: id, user: userId })
      .populate('category')
      .exec();
  }

  async update(userId: string, id: string, updateExpenseDto: UpdateExpenseDto): Promise<Expense | null> {
    const { categoryName, ...updateData } = updateExpenseDto;
    
    // Find or create category if categoryName is provided
    if (categoryName) {
      const category = await this.categoriesService.findOrCreate(
        userId,
        categoryName,
      );
      updateData['category'] = category._id;
    }

    return this.expenseModel
      .findOneAndUpdate({ _id: id, user: userId }, updateData, { new: true })
      .populate('category')
      .exec();
  }

  async remove(userId: string, id: string): Promise<Expense | null> {
    return this.expenseModel.findOneAndDelete({ _id: id, user: userId }).exec();
  }

  async getDailyExpenses(userId: string, startDate: Date, endDate: Date): Promise<any[]> {
    console.log('daily expense data:',
      this.expenseModel.aggregate([
        {
          $match:{
            user:userId,
            date: { $gte: startDate, $lte: endDate },
          }
        }
      ])
    )
    return this.expenseModel.aggregate([
      {
        $match: {
          user: new Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
  }

  async getCategoryTotals(userId: string, startDate: Date, endDate: Date): Promise<any[]> {
    return this.expenseModel.aggregate([
      {
        $match: {
          user: new Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryData',
        },
      },
      {
        $unwind: {
          path: '$categoryData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: { $ifNull: ['$categoryData.name', 'Uncategorized'] },
          amount: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          amount: 1,
        },
      },
      {
        $sort: { amount: -1 },
      },
    ]);
  }
}