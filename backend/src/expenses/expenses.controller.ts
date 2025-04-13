import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    Request,
  } from '@nestjs/common';
  import { ExpensesService } from './expenses.service';
  import { CreateExpenseDto } from './dto/create-expense.dto';
  import { UpdateExpenseDto } from './dto/update-expense.dto';
  import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
  import { FilterExpenseDto } from './dto/filter-expense.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  
  @Controller('expenses')
  @UseGuards(JwtAuthGuard)
  export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) {}
  
    @Post()
    create(@Request() req, @Body() createExpenseDto: CreateExpenseDto) {
      return this.expensesService.create(req.user.id, createExpenseDto);
    }
  
    @Get()
    async findAll(
      @Request() req,
      @Query('page') page?: string,
      @Query('limit') limit?: string,
      @Query('startDate') startDate?: string,
      @Query('endDate') endDate?: string,
      @Query('category') category?: string,
      @Query('minAmount') minAmount?: string,
      @Query('maxAmount') maxAmount?: string,
    ) {
      console.log('GET /expenses - User:', req.user.id);
      console.log('GET /expenses - Query params:', { page, limit, startDate, endDate, category, minAmount, maxAmount });
      
     
      const paginationQuery: PaginationQueryDto = {};
      if (page) paginationQuery.page = parseInt(page, 10);
      if (limit) paginationQuery.limit = parseInt(limit, 10);
      
      
      const filterDto: FilterExpenseDto = {};
      if (startDate) filterDto.startDate = startDate;
      if (endDate) filterDto.endDate = endDate;
      if (category) filterDto.category = category;
      if (minAmount) filterDto.minAmount = parseFloat(minAmount);
      if (maxAmount) filterDto.maxAmount = parseFloat(maxAmount);
      
      try {
        const result = await this.expensesService.findAll(req.user.id, paginationQuery, filterDto);
        console.log('GET /expenses - Found', result.total, 'expenses');
        
        console.log('GET /expenses - Response structure:', {
          hasData: !!result.data,
          dataIsArray: Array.isArray(result.data),
          dataLength: result.data ? result.data.length : 0,
          firstItem: result.data && result.data.length > 0 ? {
            _id: result.data[0]._id,
            description: result.data[0].description,
            amount: result.data[0].amount,
            date: result.data[0].date,
            hasCategory: !!result.data[0].category
          } : 'No items'
        });
        
        return result;
      } catch (error) {
        console.error('GET /expenses - Error:', error.message);
        console.error('GET /expenses - Error stack:', error.stack);
        throw error;
      }
    }
  
    @Get('recent')
    async getRecentExpenses(@Request() req) {
      console.log('GET /expenses/recent - User:', req.user.id);
      
      try {
        
        const paginationQuery = { limit: 5, page: 1 };
        const filterDto = {};
        
        const result = await this.expensesService.findAll(req.user.id, paginationQuery, filterDto);
        console.log('GET /expenses/recent - Found', result.total, 'expenses');
        
       
        console.log('GET /expenses/recent - Response structure:', {
          hasData: !!result.data,
          dataIsArray: Array.isArray(result.data),
          dataLength: result.data ? result.data.length : 0,
          firstItem: result.data && result.data.length > 0 ? {
            _id: result.data[0]._id,
            description: result.data[0].description,
            amount: result.data[0].amount,
            date: result.data[0].date,
            hasCategory: !!result.data[0].category
          } : 'No items'
        });
        
       
        return result.data;
      } catch (error) {
        console.error('GET /expenses/recent - Error:', error.message);
        throw error;
      }
    }

    @Get('analytics/daily')
    async getDailyExpenses(
      @Request() req,
      @Query('startDate') startDate: string,
      @Query('endDate') endDate: string,
    ): Promise<{ date: string; amount: number }[]> {
      console.log(
        `Getting daily expenses for user: ${
          req.user.id
        } with dates: ${startDate} ${endDate}`,
      );
      const start = startDate ? new Date(startDate) : new Date();
      start.setDate(start.getDate() - 30); // Default to last 30 days
      const end = endDate ? new Date(endDate) : new Date();
  
      const data = await this.expensesService.getDailyExpenses(
        req.user.id,
        start,
        end,
      );
      console.log('Daily expenses data:', data);
      return data;
    }
  
    @Get('analytics/category')
    async getCategoryTotals(
      @Request() req,
      @Query('startDate') startDate: string,
      @Query('endDate') endDate: string,
    ) {
      console.log(
        `Getting category totals for user: ${
          req.user.id
        } with dates: ${startDate} ${endDate}`,
      );
      const start = startDate ? new Date(startDate) : new Date();
      start.setDate(start.getDate() - 30); // Default to last 30 days
      const end = endDate ? new Date(endDate) : new Date();
  
      const data = await this.expensesService.getCategoryTotals(
        req.user.id,
        start,
        end,
      );
      console.log('Category totals data:', data);
      return data;
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
      return this.expensesService.findOne(req.user.id, id);
    }
  
    @Patch(':id')
    update(
      @Request() req,
      @Param('id') id: string,
      @Body() updateExpenseDto: UpdateExpenseDto,
    ) {
      return this.expensesService.update(req.user.id, id, updateExpenseDto);
    }
  
    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
      return this.expensesService.remove(req.user.id, id);
    }
  }