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
      @Query() paginationQuery: PaginationQueryDto,
      @Query() filterDto: FilterExpenseDto,
    ) {
      console.log('GET /expenses - User:', req.user.id);
      console.log('GET /expenses - Pagination:', paginationQuery);
      console.log('GET /expenses - Filters:', filterDto);
      
      try {
        const result = await this.expensesService.findAll(req.user.id, paginationQuery, filterDto);
        console.log('GET /expenses - Found', result.total, 'expenses');
        return result;
      } catch (error) {
        console.error('GET /expenses - Error:', error.message);
        throw error;
      }
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
  
    @Get('analytics/daily')
    async getDailyExpenses(
      @Request() req,
      @Query('startDate') startDate: string,
      @Query('endDate') endDate: string,
    ) {
      console.log('Getting daily expenses for user:', req.user.id, 'with dates:', startDate, endDate);
      
      return await this.expensesService.getDailyExpenses(
        req.user.id,
        new Date(startDate || new Date().setDate(new Date().getDate() - 30)),
        new Date(endDate || new Date()),
      ).then(data => {
        console.log('Daily expenses data:', data);
        return data;
      }).catch(err => {
        console.error('Error getting daily expenses:', err);
        return err;
      })
    }

    @Get('analytics/category')
    async getCategoryTotals(
      @Request() req,
      @Query('startDate') startDate: string,
      @Query('endDate') endDate: string,
    ) {
      console.log('Getting category totals for user:', req.user.id, 'with dates:', startDate, endDate);
      
      return await this.expensesService.getCategoryTotals(
        req.user.id,
        new Date(startDate || new Date().setDate(new Date().getDate() - 30)),
        new Date(endDate || new Date()),
      ).then(data => {
        console.log('Category totals data:', data);
        return data;
      }).catch(err => {
        console.error('Error getting category totals:', err);
        return err;
      });
    }
  }