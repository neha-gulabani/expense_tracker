import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense, ExpenseDocument } from './schemas/expense.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CategoriesService } from '../categories/categories.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { FilterExpenseDto } from './dto/filter-expense.dto';
import { format } from 'date-fns';

interface DailyExpenseResult {
  date: string;
  amount: number;
}

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    private categoriesService: CategoriesService,
  ) {}

  async create(userId: string, createExpenseDto: CreateExpenseDto): Promise<Expense> {
    try {
      console.log('Creating expense with data:', { userId, createExpenseDto });
      const { categoryName, ...expenseData } = createExpenseDto;
      
      let categoryId: string | undefined = undefined;
      if (categoryName) {
        try {
          // Trim the category name to prevent whitespace issues
          const trimmedCategoryName = categoryName.trim();
          if (trimmedCategoryName) {
            // First check if category exists
            let category = await this.categoriesService.findOne(userId, trimmedCategoryName);
            
            if (!category) {
              // If it doesn't exist, create it
              category = await this.categoriesService.create(userId, {
                name: trimmedCategoryName,
                color: '#' + Math.floor(Math.random()*16777215).toString(16)
              });
            }
            
            categoryId = category._id;
            console.log('Category for expense:', { categoryId, categoryName: category.name });
          }
        } catch (error) {
          console.error('Error processing category:', error);
          throw new Error('Failed to process category');
        }
      }

      const expense = new this.expenseModel({
        ...expenseData,
        category: categoryId,
        user: userId,
        date: createExpenseDto.date || new Date(),
      });
      
      console.log('Saving expense:', expense);
      const savedExpense = await expense.save();
      
      const populatedExpense = await this.expenseModel
        .findById(savedExpense._id)
        .populate('category')
        .exec();
        
      if (!populatedExpense) {
        throw new Error('Failed to retrieve created expense');
      }
      
      console.log('Created expense with category:', {
        expenseId: populatedExpense._id,
        category: populatedExpense.category
      });
      
      return populatedExpense;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw new Error('Failed to create expense: ' + error.message);
    }
  }

  async findAll(
    userId: string,
    paginationQuery: PaginationQueryDto,
    filterDto: FilterExpenseDto,
  ): Promise<{ data: Expense[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const query: any = { user: userId };
    
 
    const dateFilter: any = {};
    if (filterDto.startDate) {
      dateFilter.$gte = new Date(filterDto.startDate);
    }
    if (filterDto.endDate) {
      dateFilter.$lte = new Date(filterDto.endDate);
    }
    if (Object.keys(dateFilter).length > 0) {
      query.date = dateFilter;
    }
    
 
    if (filterDto.category) {
      try {
        query.category = new Types.ObjectId(filterDto.category);
      } catch (error) {
        console.error('Invalid category ID:', filterDto.category);
       
        return {
          data: [],
          total: 0,
          page,
          limit,
        };
      }
    }

   
    const amountFilter: any = {};
    if (filterDto.minAmount !== undefined && filterDto.minAmount !== null) {
      amountFilter.$gte = Number(filterDto.minAmount);
    }
    if (filterDto.maxAmount !== undefined && filterDto.maxAmount !== null) {
      amountFilter.$lte = Number(filterDto.maxAmount);
    }
    if (Object.keys(amountFilter).length > 0) {
      query.amount = amountFilter;
    }

   

    try {
    
      const total = await this.expenseModel.countDocuments(query);
      
    
      const expenses = await this.expenseModel
        .find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .populate('category')
        .exec();

      console.log(`Found ${expenses.length} expenses out of ${total} total`);

      const dailyExpenses = expenses.reduce((acc: { [date: string]: number }, expense) => {
        const date = format(expense.date, 'yyyy-MM-dd');
        acc[date] = (acc[date] || 0) + expense.amount;
        return acc;
      }, {});

      return {
        data: expenses,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return {
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  }

  async findOne(userId: string, id: string): Promise<Expense | null> {
    return this.expenseModel
      .findOne({ _id: id, user: userId })
      .populate('category')
      .exec();
  }

  async update(userId: string, id: string, updateExpenseDto: UpdateExpenseDto): Promise<Expense | null> {
    try {
      const { categoryName, ...updateData } = updateExpenseDto;
      
      if (categoryName) {
        const trimmedCategoryName = categoryName.trim();
        if (trimmedCategoryName) {
          const category = await this.categoriesService.findOrCreate(
            userId,
            trimmedCategoryName
          );
          updateData['category'] = category._id;
          console.log('Updated category:', { categoryId: category._id, categoryName: category.name });
        }
      }

      const updatedExpense = await this.expenseModel
        .findOneAndUpdate(
          { _id: id, user: userId }, 
          updateData, 
          { new: true }
        )
        .populate('category')
        .exec();

      if (!updatedExpense) {
        throw new Error('Expense not found or update failed');
      }

      return updatedExpense;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw new Error('Failed to update expense: ' + error.message);
    }
  }

  async remove(userId: string, id: string): Promise<Expense | null> {
    return this.expenseModel.findOneAndDelete({ _id: id, user: userId }).exec();
  }

  async getDailyExpenses(userId: string, startDate: Date, endDate: Date): Promise<DailyExpenseResult[]> {
    console.log(`Getting daily expenses for user ${userId} from ${startDate} to ${endDate}`);
    
    try {
      const result = await this.expenseModel.aggregate([
        {
          $match: {
            user: new Types.ObjectId(userId),
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            amount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            date: '$_id',
            amount: 1,
            count: 1,
          }
        },
        {
          $sort: { date: 1 },
        },
      ]);
      
     
      const allDates: string[] = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        allDates.push(format(currentDate, 'yyyy-MM-dd'));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      const resultMap = new Map(result.map(item => [item.date, item.amount]));
      const finalResult = allDates.map(date => ({
        date,
        amount: resultMap.get(date) || 0
      }));
      
     
      return finalResult;
    } catch (error) {
      console.error('Error in getDailyExpenses:', error);
      throw new Error('Failed to fetch daily expenses');
    }
  }

  async getCategoryTotals(userId: string, startDate: Date, endDate: Date): Promise<any[]> {
    console.log(`Getting category totals for user ${userId} from ${startDate} to ${endDate}`);
    
    try {
      const result = await this.expenseModel.aggregate([
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
            color: { $first: { $ifNull: ['$categoryData.color', '#6b7280'] } },
          },
        },
        {
          $project: {
            _id: 0,
            category: '$_id',
            amount: 1,
            color: 1,
          },
        },
        {
          $sort: { amount: -1 },
        },
      ]);
      
      // Ensure we have at least one category
      if (result.length === 0) {
        result.push({
          category: 'Uncategorized',
          amount: 0,
          color: '#6b7280'
        });
      }
      
      console.log('Category totals result:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('Error in getCategoryTotals:', error);
      throw new Error('Failed to fetch category totals');
    }
  }

  async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Expense[]> {
    const query = {
      user: userId,
      date: { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      }
    };
    
    return this.expenseModel
      .find(query)
      .sort({ date: -1 })
      .populate('category')
      .exec();
  }
}